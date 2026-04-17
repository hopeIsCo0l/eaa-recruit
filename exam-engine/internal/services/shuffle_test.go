package services_test

import (
	"testing"

	"github.com/EAA-recruit/exam-engine/internal/domain"
	"github.com/EAA-recruit/exam-engine/internal/services"
)

func makeQuestions(n int) []domain.Question {
	qs := make([]domain.Question, n)
	for i := range qs {
		qs[i] = domain.Question{ID: string(rune('A' + i))}
	}
	return qs
}

func TestShuffleQuestions_Deterministic(t *testing.T) {
	qs := makeQuestions(10)
	order1 := services.ShuffleQuestions(qs, "candidate-42")
	order2 := services.ShuffleQuestions(qs, "candidate-42")
	for i := range order1 {
		if order1[i] != order2[i] {
			t.Errorf("shuffle not deterministic at index %d: %s vs %s", i, order1[i], order2[i])
		}
	}
}

func TestShuffleQuestions_DifferentCandidatesDifferentOrder(t *testing.T) {
	qs := makeQuestions(10)
	order1 := services.ShuffleQuestions(qs, "candidate-1")
	order2 := services.ShuffleQuestions(qs, "candidate-2")
	same := true
	for i := range order1 {
		if order1[i] != order2[i] {
			same = false
			break
		}
	}
	if same {
		t.Error("expected different candidates to get different order (seed collision unlikely for 10 items)")
	}
}

func TestShuffleQuestions_AllIDsPresent(t *testing.T) {
	qs := makeQuestions(8)
	order := services.ShuffleQuestions(qs, "test-candidate")
	seen := make(map[string]bool)
	for _, id := range order {
		seen[id] = true
	}
	for _, q := range qs {
		if !seen[q.ID] {
			t.Errorf("question %s missing from shuffled order", q.ID)
		}
	}
}
