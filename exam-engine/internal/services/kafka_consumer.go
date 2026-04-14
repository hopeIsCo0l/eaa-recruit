package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/EAA-recruit/exam-engine/internal/config"
	"github.com/EAA-recruit/exam-engine/internal/domain"
	"github.com/IBM/sarama"
)

const (
	TopicBatchReady = "EXAM_BATCH_READY"
	TopicDeadLetter = "EXAM_BATCH_READY_DLT"
)

// ExamBatchReadyEvent is the payload of the EXAM_BATCH_READY Kafka message from Spring Boot (FR-58).
type ExamBatchReadyEvent struct {
	ExamID       string   `json:"examId"`
	JobID        string   `json:"jobId"`
	StartTime    int64    `json:"startTime"`
	EndTime      int64    `json:"endTime"`
	DurationSecs int64    `json:"durationSecs"`
	Candidates   []string `json:"candidates"`
}

// KafkaConsumer subscribes to EXAM_BATCH_READY and seeds the exam engine state (FR-58).
type KafkaConsumer struct {
	group         sarama.ConsumerGroup
	questionCache *QuestionCache
	batchSvc      *BatchService
	cfg           *config.Config
	dlqProducer   sarama.SyncProducer // dead-letter for malformed events
}

func NewKafkaConsumer(
	group sarama.ConsumerGroup,
	qc *QuestionCache,
	bs *BatchService,
	cfg *config.Config,
	dlqProducer sarama.SyncProducer,
) *KafkaConsumer {
	return &KafkaConsumer{
		group:         group,
		questionCache: qc,
		batchSvc:      bs,
		cfg:           cfg,
		dlqProducer:   dlqProducer,
	}
}

// Start blocks and continuously consumes EXAM_BATCH_READY events. Run as a goroutine.
func (kc *KafkaConsumer) Start(ctx context.Context) {
	handler := &batchReadyHandler{
		questionCache: kc.questionCache,
		batchSvc:      kc.batchSvc,
		cfg:           kc.cfg,
		dlqProducer:   kc.dlqProducer,
	}
	for {
		if err := kc.group.Consume(ctx, []string{TopicBatchReady}, handler); err != nil {
			log.Printf("Kafka consumer error: %v", err)
		}
		if ctx.Err() != nil {
			log.Println("Kafka consumer stopped")
			return
		}
	}
}

type batchReadyHandler struct {
	questionCache *QuestionCache
	batchSvc      *BatchService
	cfg           *config.Config
	dlqProducer   sarama.SyncProducer
}

func (h *batchReadyHandler) Setup(_ sarama.ConsumerGroupSession) error   { return nil }
func (h *batchReadyHandler) Cleanup(_ sarama.ConsumerGroupSession) error { return nil }

func (h *batchReadyHandler) ConsumeClaim(session sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
	for msg := range claim.Messages() {
		if err := h.process(msg); err != nil {
			log.Printf("EXAM_BATCH_READY processing failed: %v — routing to DLT", err)
			_, _, _ = h.dlqProducer.SendMessage(&sarama.ProducerMessage{
				Topic: TopicDeadLetter,
				Value: sarama.ByteEncoder(msg.Value),
			})
		}
		session.MarkMessage(msg, "")
	}
	return nil
}

func (h *batchReadyHandler) process(msg *sarama.ConsumerMessage) error {
	var event ExamBatchReadyEvent
	if err := json.Unmarshal(msg.Value, &event); err != nil {
		return fmt.Errorf("unmarshal: %w", err)
	}
	if event.ExamID == "" || event.JobID == "" {
		return fmt.Errorf("missing examId or jobId")
	}

	// Fetch questions from Spring Boot and cache in memory
	questions, err := h.fetchQuestions(event.ExamID)
	if err != nil {
		return fmt.Errorf("fetch questions for exam %s: %w", event.ExamID, err)
	}
	h.questionCache.Store(event.ExamID, questions)
	log.Printf("cached %d questions for exam %s", len(questions), event.ExamID)

	ctx := context.Background()

	// Cache exam schedule for batch trigger service (FR-46)
	schedule := BatchSchedule{
		ExamID:       event.ExamID,
		JobID:        event.JobID,
		StartTime:    event.StartTime,
		EndTime:      event.EndTime,
		DurationSecs: event.DurationSecs,
	}
	if err := h.batchSvc.StoreSchedule(ctx, schedule); err != nil {
		return fmt.Errorf("store schedule: %w", err)
	}

	// Store authorized candidate list in Redis
	if err := h.batchSvc.StoreAuthorizedCandidates(ctx, event.JobID, event.Candidates); err != nil {
		return fmt.Errorf("store candidates: %w", err)
	}

	log.Printf("batch ready — job=%s exam=%s candidates=%d window=%s→%s",
		event.JobID, event.ExamID, len(event.Candidates),
		time.Unix(event.StartTime, 0).Format(time.RFC3339),
		time.Unix(event.EndTime, 0).Format(time.RFC3339))
	return nil
}

// fetchQuestions calls Spring Boot to retrieve questions for a given exam.
func (h *batchReadyHandler) fetchQuestions(examID string) ([]domain.Question, error) {
	url := fmt.Sprintf("%s/api/v1/exams/%s/questions", h.cfg.SpringBaseURL, examID)
	//nolint:noctx // fire-and-forget startup fetch, context not critical here
	resp, err := http.Get(url) //nolint:gosec
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("spring boot returned %d for exam %s", resp.StatusCode, examID)
	}

	var result struct {
		Data []domain.Question `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}
	return result.Data, nil
}
