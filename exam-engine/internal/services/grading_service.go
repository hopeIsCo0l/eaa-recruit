package services

import (
	"context"
	"log"
	"time"

	"github.com/EAA-recruit/exam-engine/internal/domain"
)

// GradingService orchestrates MCQ scoring and dispatches short-answer tasks to the worker pool (FR-54, FR-55, FR-56).
type GradingService struct {
	questionCache *QuestionCache
	sessionSvc    *SessionService
	aiClient      *AIGradingClient
	pool          *WorkerPool
	springClient  *SpringClient
}

func NewGradingService(
	qc *QuestionCache,
	ss *SessionService,
	ai *AIGradingClient,
	pool *WorkerPool,
	sc *SpringClient,
) *GradingService {
	return &GradingService{
		questionCache: qc,
		sessionSvc:    ss,
		aiClient:      ai,
		pool:          pool,
		springClient:  sc,
	}
}

// Grade grades an entire submitted exam session.
// MCQ grading is synchronous (<1s for 100 questions).
// Short-answer grading is dispatched asynchronously via worker pool (FR-54).
func (g *GradingService) Grade(ctx context.Context, session *domain.ExamSession, ttlSecs int64) {
	questions, ok := g.questionCache.Get(session.ExamID)
	if !ok {
		log.Printf("no questions cached for exam %s — cannot grade candidate %s", session.ExamID, session.CandidateID)
		return
	}

	var mcqScore float64
	var shortAnswerPending int

	for _, q := range questions {
		answer, answered := session.AnswersMap[q.ID]
		switch q.Type {
		case domain.QuestionMCQ:
			if answered && answer == q.CorrectAnswer {
				mcqScore += q.Marks
			}
		case domain.QuestionShortAnswer:
			if answered {
				shortAnswerPending++
				g.dispatchShortAnswerGrading(session, q, answer, ttlSecs)
			}
		}
	}

	session.MCQScore = mcqScore
	ttl := time.Duration(ttlSecs) * time.Second

	if shortAnswerPending == 0 {
		session.TotalScore = mcqScore
		session.GradingComplete = true
		if err := g.sessionSvc.Update(ctx, session, ttl); err != nil {
			log.Printf("failed to persist grading result for %s: %v", session.CandidateID, err)
		}
		g.springClient.PublishExamCompleted(session)
		log.Printf("grading complete for %s: MCQ=%.2f, total=%.2f", session.CandidateID, mcqScore, session.TotalScore)
	} else {
		session.TotalScore = mcqScore
		_ = g.sessionSvc.Update(ctx, session, ttl)
		log.Printf("MCQ graded for %s: %.2f — waiting on %d short-answer(s)", session.CandidateID, mcqScore, shortAnswerPending)
	}
}

// dispatchShortAnswerGrading sends one short-answer task to the worker pool
// and collects the result asynchronously (FR-56, FR-57).
func (g *GradingService) dispatchShortAnswerGrading(session *domain.ExamSession, q domain.Question, answer string, ttlSecs int64) {
	done := make(chan float64, 1)
	task := GradingTask{
		CandidateID: session.CandidateID,
		JobID:       session.JobID,
		QuestionID:  q.ID,
		Answer:      answer,
		Done:        done,
	}
	g.pool.Submit(task)

	go func() {
		ctx := context.Background()
		score := <-done

		sess, err := g.sessionSvc.Get(ctx, session.CandidateID, session.JobID)
		if err != nil {
			log.Printf("failed to retrieve session for short-answer update: %v", err)
			return
		}
		sess.ShortAnswerScore += score
		sess.TotalScore = sess.MCQScore + sess.ShortAnswerScore
		sess.GradingComplete = true
		ttl := time.Duration(ttlSecs) * time.Second
		if err := g.sessionSvc.Update(ctx, sess, ttl); err != nil {
			log.Printf("failed to persist short-answer score for %s: %v", session.CandidateID, err)
		}
		g.springClient.PublishExamCompleted(sess)
		log.Printf("short-answer graded for %s q=%s score=%.2f total=%.2f",
			session.CandidateID, q.ID, score, sess.TotalScore)
	}()
}
