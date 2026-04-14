package services

import (
	"sync"

	"github.com/EAA-recruit/exam-engine/internal/domain"
)

// QuestionCache holds exam questions in memory for fast retrieval during the exam window (FR-58).
// RWMutex allows concurrent reads while writes are exclusive.
type QuestionCache struct {
	mu    sync.RWMutex
	exams map[string][]domain.Question // examId → questions
}

func NewQuestionCache() *QuestionCache {
	return &QuestionCache{exams: make(map[string][]domain.Question)}
}

func (qc *QuestionCache) Store(examID string, questions []domain.Question) {
	qc.mu.Lock()
	defer qc.mu.Unlock()
	qc.exams[examID] = questions
}

func (qc *QuestionCache) Get(examID string) ([]domain.Question, bool) {
	qc.mu.RLock()
	defer qc.mu.RUnlock()
	q, ok := qc.exams[examID]
	return q, ok
}

// GetQuestion returns a single question by ID without exposing the full list.
func (qc *QuestionCache) GetQuestion(examID, questionID string) *domain.Question {
	qc.mu.RLock()
	defer qc.mu.RUnlock()
	for i := range qc.exams[examID] {
		if qc.exams[examID][i].ID == questionID {
			q := qc.exams[examID][i]
			return &q
		}
	}
	return nil
}
