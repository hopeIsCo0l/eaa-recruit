package services_test

import (
	"testing"

	"github.com/EAA-recruit/exam-engine/internal/domain"
	"github.com/EAA-recruit/exam-engine/internal/services"
)

func TestQuestionCache_StoreAndGet(t *testing.T) {
	qc := services.NewQuestionCache()

	qs := []domain.Question{
		{ID: "q1", Text: "What is lift?", Type: domain.QuestionMCQ, CorrectAnswer: "A"},
		{ID: "q2", Text: "Explain Bernoulli.", Type: domain.QuestionShortAnswer},
	}
	qc.Store("exam-1", qs)

	got, ok := qc.Get("exam-1")
	if !ok {
		t.Fatal("expected cache hit, got miss")
	}
	if len(got) != 2 {
		t.Fatalf("expected 2 questions, got %d", len(got))
	}
}

func TestQuestionCache_MissOnUnknownExam(t *testing.T) {
	qc := services.NewQuestionCache()
	_, ok := qc.Get("nonexistent")
	if ok {
		t.Error("expected cache miss for unknown examId")
	}
}

func TestQuestionCache_GetQuestion(t *testing.T) {
	qc := services.NewQuestionCache()
	qc.Store("exam-1", []domain.Question{
		{ID: "q1", Text: "Q1", Type: domain.QuestionMCQ, CorrectAnswer: "B"},
	})

	q := qc.GetQuestion("exam-1", "q1")
	if q == nil {
		t.Fatal("expected question, got nil")
	}
	if q.CorrectAnswer != "B" {
		t.Errorf("expected CorrectAnswer=B, got %s", q.CorrectAnswer)
	}

	// Unknown question
	if qc.GetQuestion("exam-1", "q99") != nil {
		t.Error("expected nil for unknown questionId")
	}
}

func TestQuestionCache_StoreOverwrites(t *testing.T) {
	qc := services.NewQuestionCache()
	qc.Store("exam-1", []domain.Question{{ID: "q1"}})
	qc.Store("exam-1", []domain.Question{{ID: "q2"}, {ID: "q3"}})

	got, _ := qc.Get("exam-1")
	if len(got) != 2 {
		t.Fatalf("expected 2 questions after overwrite, got %d", len(got))
	}
}
