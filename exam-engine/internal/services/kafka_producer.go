package services

import (
	"encoding/json"
	"log"
	"math"
	"time"

	"github.com/EAA-recruit/exam-engine/internal/domain"
	"github.com/IBM/sarama"
)

const TopicExamCompleted = "EXAM_COMPLETED"

// KafkaProducer publishes exam events back to Spring Boot (FR-59).
type KafkaProducer struct {
	producer sarama.SyncProducer
}

func NewKafkaProducer(p sarama.SyncProducer) *KafkaProducer {
	return &KafkaProducer{producer: p}
}

// PublishExamCompleted publishes an EXAM_COMPLETED event with exponential-backoff retries (FR-59).
func (kp *KafkaProducer) PublishExamCompleted(session *domain.ExamSession) {
	event := domain.ExamCompletedEvent{
		CandidateID: session.CandidateID,
		JobID:       session.JobID,
		ExamID:      session.ExamID,
		TotalScore:  session.TotalScore,
		CompletedAt: time.Now().Unix(),
	}
	data, err := json.Marshal(event)
	if err != nil {
		log.Printf("marshal ExamCompleted failed for %s: %v", session.CandidateID, err)
		return
	}

	msg := &sarama.ProducerMessage{
		Topic: TopicExamCompleted,
		Key:   sarama.StringEncoder(session.CandidateID),
		Value: sarama.ByteEncoder(data),
	}

	const maxRetries = 3
	for attempt := 0; attempt < maxRetries; attempt++ {
		_, _, err := kp.producer.SendMessage(msg)
		if err == nil {
			log.Printf("EXAM_COMPLETED published: candidate=%s score=%.2f", session.CandidateID, session.TotalScore)
			return
		}
		backoff := time.Duration(math.Pow(2, float64(attempt))) * time.Second
		log.Printf("EXAM_COMPLETED publish attempt %d/%d failed: %v (retry in %v)", attempt+1, maxRetries, err, backoff)
		time.Sleep(backoff)
	}
	log.Printf("EXAM_COMPLETED publish permanently failed for candidate %s after %d attempts", session.CandidateID, maxRetries)
}
