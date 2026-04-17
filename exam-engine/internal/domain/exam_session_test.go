package domain_test

import (
	"testing"
	"time"

	"github.com/EAA-recruit/exam-engine/internal/domain"
)

func TestSessionKey(t *testing.T) {
	key := domain.SessionKey("user-1", "job-42")
	expected := "exam:session:user-1:job-42"
	if key != expected {
		t.Errorf("expected %q, got %q", expected, key)
	}
}

func TestExamSession_DefaultValues(t *testing.T) {
	session := &domain.ExamSession{
		CandidateID: "c1",
		JobID:       "j1",
		ExamID:      "e1",
		StartedAt:   time.Now(),
		Status:      domain.StatusActive,
		AnswersMap:  make(map[string]string),
	}

	if session.Status != domain.StatusActive {
		t.Errorf("expected ACTIVE, got %s", session.Status)
	}
	if session.GradingComplete {
		t.Error("expected GradingComplete=false on new session")
	}
}

func TestStatusConstants(t *testing.T) {
	statuses := []domain.SessionStatus{
		domain.StatusActive,
		domain.StatusSubmitted,
		domain.StatusDisconnected,
	}
	seen := make(map[domain.SessionStatus]bool)
	for _, s := range statuses {
		if seen[s] {
			t.Errorf("duplicate status constant: %s", s)
		}
		seen[s] = true
		if string(s) == "" {
			t.Errorf("empty status constant")
		}
	}
}
