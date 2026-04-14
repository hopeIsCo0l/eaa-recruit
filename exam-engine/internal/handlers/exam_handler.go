package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/EAA-recruit/exam-engine/internal/domain"
	"github.com/EAA-recruit/exam-engine/internal/middleware"
	"github.com/EAA-recruit/exam-engine/internal/services"
	"github.com/gin-gonic/gin"
)

// ExamHandler serves the core exam lifecycle endpoints (FR-51, FR-52, FR-53).
type ExamHandler struct {
	sessionSvc    *services.SessionService
	batchSvc      *services.BatchService
	questionCache *services.QuestionCache
	gradingSvc    *services.GradingService
}

func NewExamHandler(
	ss *services.SessionService,
	bs *services.BatchService,
	qc *services.QuestionCache,
	gs *services.GradingService,
) *ExamHandler {
	return &ExamHandler{
		sessionSvc:    ss,
		batchSvc:      bs,
		questionCache: qc,
		gradingSvc:    gs,
	}
}

// StartExam handles GET /exam/start (FR-51).
// Returns existing session state if candidate already started (idempotent).
func (h *ExamHandler) StartExam(c *gin.Context) {
	ctx := context.Background()
	candidateID := c.GetString(middleware.CandidateIDKey)
	jobID := c.GetString(middleware.JobIDKey)

	schedule, err := h.batchSvc.IsWindowOpen(ctx, jobID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"status": "error", "message": err.Error()})
		return
	}

	authorized, err := h.batchSvc.IsCandidateAuthorized(ctx, jobID, candidateID)
	if err != nil || !authorized {
		c.JSON(http.StatusForbidden, gin.H{"status": "error", "message": "not authorized for this exam"})
		return
	}

	// Return existing session rather than creating a duplicate (FR-51)
	if existing, err := h.sessionSvc.Get(ctx, candidateID, jobID); err == nil {
		if existing.Status == domain.StatusActive || existing.Status == domain.StatusDisconnected {
			h.respondWithCurrentQuestion(c, existing, schedule)
			return
		}
		if existing.Status == domain.StatusSubmitted {
			c.JSON(http.StatusForbidden, gin.H{"status": "error", "message": "exam already submitted"})
			return
		}
	}

	questions, ok := h.questionCache.Get(schedule.ExamID)
	if !ok {
		c.JSON(http.StatusServiceUnavailable, gin.H{"status": "error", "message": "exam questions not loaded yet"})
		return
	}

	now := time.Now()
	session := &domain.ExamSession{
		CandidateID:          candidateID,
		JobID:                jobID,
		ExamID:               schedule.ExamID,
		StartedAt:            now,
		CurrentQuestionIndex: 0,
		QuestionOrder:        services.ShuffleQuestions(questions, candidateID),
		AnswersMap:           make(map[string]string),
		TimeRemaining:        schedule.DurationSecs,
		Status:               domain.StatusActive,
		LastSeenAt:           now,
	}

	ttl := time.Duration(schedule.DurationSecs+600) * time.Second
	if err := h.sessionSvc.Create(ctx, session, ttl); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "failed to create session"})
		return
	}

	h.respondWithCurrentQuestion(c, session, schedule)
}

// SubmitAnswer handles POST /exam/submit-answer (FR-52).
// Persists the answer immediately and returns the next question (or completion signal).
func (h *ExamHandler) SubmitAnswer(c *gin.Context) {
	ctx := context.Background()
	candidateID := c.GetString(middleware.CandidateIDKey)
	jobID := c.GetString(middleware.JobIDKey)

	var req struct {
		QuestionID     string `json:"questionId" binding:"required"`
		SelectedAnswer string `json:"selectedAnswer" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": err.Error()})
		return
	}

	schedule, err := h.batchSvc.IsWindowOpen(ctx, jobID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"status": "error", "message": err.Error()})
		return
	}

	session, err := h.sessionSvc.Get(ctx, candidateID, jobID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "session not found"})
		return
	}
	if session.Status == domain.StatusSubmitted {
		c.JSON(http.StatusForbidden, gin.H{"status": "error", "message": "exam already submitted"})
		return
	}

	ttl := time.Duration(session.TimeRemaining+600) * time.Second

	// Persist answer atomically (FR-52) — overwrites previous answer for same question
	if err := h.sessionSvc.UpdateAnswer(ctx, candidateID, jobID, req.QuestionID, req.SelectedAnswer, ttl); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "failed to save answer"})
		return
	}

	// Re-fetch to get latest state after update
	session, _ = h.sessionSvc.Get(ctx, candidateID, jobID)

	questions, _ := h.questionCache.Get(schedule.ExamID)
	totalQuestions := len(questions)
	nextIdx := session.CurrentQuestionIndex + 1

	if nextIdx >= totalQuestions {
		// All questions answered — finalize and kick off grading
		session.Status = domain.StatusSubmitted
		session.CurrentQuestionIndex = nextIdx
		_ = h.sessionSvc.Update(ctx, session, 10*time.Minute)
		go h.gradingSvc.Grade(context.Background(), session, 600)
		c.JSON(http.StatusOK, gin.H{
			"status": "success",
			"data": gin.H{
				"completed":      true,
				"totalQuestions": totalQuestions,
			},
		})
		return
	}

	session.CurrentQuestionIndex = nextIdx
	_ = h.sessionSvc.Update(ctx, session, ttl)

	nextQuestion := findQuestion(questions, session.QuestionOrder[nextIdx])
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"completed":      false,
			"questionNumber": nextIdx + 1,
			"totalQuestions": totalQuestions,
			"timeRemaining":  session.TimeRemaining,
			"question":       sanitizeQuestion(nextQuestion),
		},
	})
}

// ResumeExam handles GET /exam/resume (FR-53).
// Returns current progress so a candidate can continue after a disconnect.
func (h *ExamHandler) ResumeExam(c *gin.Context) {
	ctx := context.Background()
	candidateID := c.GetString(middleware.CandidateIDKey)
	jobID := c.GetString(middleware.JobIDKey)

	session, err := h.sessionSvc.Get(ctx, candidateID, jobID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "no exam session found"})
		return
	}

	schedule, err := h.batchSvc.IsWindowOpen(ctx, jobID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"status": "error", "message": err.Error()})
		return
	}

	// Restore DISCONNECTED → ACTIVE on resume
	if session.Status == domain.StatusDisconnected {
		session.Status = domain.StatusActive
		session.LastSeenAt = time.Now()
		_ = h.sessionSvc.Update(ctx, session, time.Duration(session.TimeRemaining+600)*time.Second)
	}

	questions, _ := h.questionCache.Get(schedule.ExamID)

	// Recalculate accurate time remaining
	elapsed := int64(time.Since(session.StartedAt).Seconds())
	timeRemaining := schedule.DurationSecs - elapsed
	if timeRemaining < 0 {
		timeRemaining = 0
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"currentQuestionIndex": session.CurrentQuestionIndex,
			"totalQuestions":       len(questions),
			"timeRemaining":        timeRemaining,
			"answeredCount":        len(session.AnswersMap),
			"sessionStatus":        session.Status,
			"question":             sanitizeQuestion(findQuestion(questions, session.QuestionOrder[session.CurrentQuestionIndex])),
		},
	})
}

func (h *ExamHandler) respondWithCurrentQuestion(c *gin.Context, session *domain.ExamSession, schedule *services.BatchSchedule) {
	questions, _ := h.questionCache.Get(schedule.ExamID)
	totalQuestions := len(questions)
	idx := session.CurrentQuestionIndex

	if idx >= totalQuestions {
		c.JSON(http.StatusOK, gin.H{
			"status": "success",
			"data":   gin.H{"completed": true, "totalQuestions": totalQuestions},
		})
		return
	}

	question := findQuestion(questions, session.QuestionOrder[idx])
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"questionNumber": idx + 1,
			"totalQuestions": totalQuestions,
			"timeRemaining":  session.TimeRemaining,
			"question":       sanitizeQuestion(question),
		},
	})
}

// findQuestion looks up a question by ID from the cached slice.
func findQuestion(questions []domain.Question, id string) *domain.Question {
	for i := range questions {
		if questions[i].ID == id {
			return &questions[i]
		}
	}
	return nil
}

// sanitizeQuestion strips the correct answer before sending to the candidate.
func sanitizeQuestion(q *domain.Question) gin.H {
	if q == nil {
		return nil
	}
	return gin.H{
		"id":      q.ID,
		"text":    q.Text,
		"type":    q.Type,
		"options": q.Options,
		"marks":   q.Marks,
	}
}
