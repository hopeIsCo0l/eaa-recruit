package handlers

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/EAA-recruit/exam-engine/internal/config"
	"github.com/EAA-recruit/exam-engine/internal/services"
	"github.com/gin-gonic/gin"
)

// BatchHandler accepts EXAM_BATCH_READY HTTP events from Spring Boot.
// Replaces the prior Kafka EXAM_BATCH_READY consumer.
type BatchHandler struct {
	questionCache *services.QuestionCache
	batchSvc      *services.BatchService
	springClient  *services.SpringClient
	cfg           *config.Config
}

func NewBatchHandler(qc *services.QuestionCache, bs *services.BatchService,
	sc *services.SpringClient, cfg *config.Config) *BatchHandler {
	return &BatchHandler{questionCache: qc, batchSvc: bs, springClient: sc, cfg: cfg}
}

// Body matches Spring Boot's ExamBatchReadyEvent record.
type batchReadyRequest struct {
	BatchID         int64     `json:"batchId"`
	JobID           int64     `json:"jobId"`
	CandidateIDs    []int64   `json:"candidateIds"`
	DurationMinutes int       `json:"durationMinutes"`
	ScheduledAt     time.Time `json:"scheduledAt"`
	OccurredAt      time.Time `json:"occurredAt"`
}

func (h *BatchHandler) BatchReady(c *gin.Context) {
	provided := c.GetHeader("X-Internal-Api-Key")
	if provided != h.cfg.InternalApiKey {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid internal API key"})
		return
	}

	var req batchReadyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.BatchID == 0 || req.JobID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing batchId or jobId"})
		return
	}

	examID := i64ToStr(req.BatchID)
	jobID := i64ToStr(req.JobID)

	questions, err := h.springClient.FetchQuestions(examID)
	if err != nil {
		log.Printf("fetch questions for exam %s: %v", examID, err)
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to fetch questions"})
		return
	}
	h.questionCache.Store(examID, questions)
	log.Printf("cached %d questions for exam %s", len(questions), examID)

	startUnix := req.ScheduledAt.Unix()
	durationSecs := int64(req.DurationMinutes) * 60
	endUnix := startUnix + durationSecs

	schedule := services.BatchSchedule{
		ExamID:       examID,
		JobID:        jobID,
		StartTime:    startUnix,
		EndTime:      endUnix,
		DurationSecs: durationSecs,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := h.batchSvc.StoreSchedule(ctx, schedule); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "store schedule: " + err.Error()})
		return
	}

	candidates := make([]string, len(req.CandidateIDs))
	for i, id := range req.CandidateIDs {
		candidates[i] = i64ToStr(id)
	}
	if err := h.batchSvc.StoreAuthorizedCandidates(ctx, jobID, candidates); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "store candidates: " + err.Error()})
		return
	}

	log.Printf("batch ready — job=%s exam=%s candidates=%d", jobID, examID, len(candidates))
	c.JSON(http.StatusAccepted, gin.H{"status": "accepted", "batchId": req.BatchID})
}

func i64ToStr(v int64) string {
	const digits = "0123456789"
	if v == 0 {
		return "0"
	}
	buf := [20]byte{}
	i := len(buf)
	for v > 0 {
		i--
		buf[i] = digits[v%10]
		v /= 10
	}
	return string(buf[i:])
}
