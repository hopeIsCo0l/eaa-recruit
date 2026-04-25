package services_test

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/EAA-recruit/exam-engine/internal/domain"
	"github.com/EAA-recruit/exam-engine/internal/services"
)

func TestSessionService_CreateAndGet(t *testing.T) {
	svc := services.NewSessionService(newTestRedis(t))
	ctx := context.Background()

	session := &domain.ExamSession{
		CandidateID: "c1",
		JobID:       "j1",
		ExamID:      "exam-1",
		Status:      domain.StatusActive,
		StartedAt:   time.Now(),
	}
	if err := svc.Create(ctx, session, time.Minute); err != nil {
		t.Fatalf("Create: %v", err)
	}

	got, err := svc.Get(ctx, "c1", "j1")
	if err != nil {
		t.Fatalf("Get: %v", err)
	}
	if got.CandidateID != "c1" || got.ExamID != "exam-1" {
		t.Errorf("unexpected session fields: %+v", got)
	}
}

func TestSessionService_GetMissing(t *testing.T) {
	svc := services.NewSessionService(newTestRedis(t))
	_, err := svc.Get(context.Background(), "nobody", "nojob")
	if err == nil {
		t.Fatal("expected error for missing session")
	}
}

func TestSessionService_Update(t *testing.T) {
	svc := services.NewSessionService(newTestRedis(t))
	ctx := context.Background()

	session := &domain.ExamSession{CandidateID: "c2", JobID: "j2", Status: domain.StatusActive}
	_ = svc.Create(ctx, session, time.Minute)

	session.Status = domain.StatusSubmitted
	session.TotalScore = 85.0
	if err := svc.Update(ctx, session, time.Minute); err != nil {
		t.Fatalf("Update: %v", err)
	}

	got, _ := svc.Get(ctx, "c2", "j2")
	if got.Status != domain.StatusSubmitted {
		t.Errorf("expected SUBMITTED, got %s", got.Status)
	}
	if got.TotalScore != 85.0 {
		t.Errorf("expected TotalScore=85, got %v", got.TotalScore)
	}
}

func TestSessionService_UpdateAnswer(t *testing.T) {
	svc := services.NewSessionService(newTestRedis(t))
	ctx := context.Background()

	_ = svc.Create(ctx, &domain.ExamSession{CandidateID: "c3", JobID: "j3", Status: domain.StatusActive}, time.Minute)

	if err := svc.UpdateAnswer(ctx, "c3", "j3", "q1", "A", time.Minute); err != nil {
		t.Fatalf("UpdateAnswer: %v", err)
	}
	// Overwrite with different answer
	if err := svc.UpdateAnswer(ctx, "c3", "j3", "q1", "B", time.Minute); err != nil {
		t.Fatalf("UpdateAnswer overwrite: %v", err)
	}

	got, _ := svc.Get(ctx, "c3", "j3")
	if got.AnswersMap["q1"] != "B" {
		t.Errorf("expected overwritten answer B, got %q", got.AnswersMap["q1"])
	}
}

// TestSessionService_ConcurrentUpdateAnswer verifies per-session locking prevents
// data races under concurrent writes (run with -race).
func TestSessionService_ConcurrentUpdateAnswer(t *testing.T) {
	svc := services.NewSessionService(newTestRedis(t))
	ctx := context.Background()

	_ = svc.Create(ctx, &domain.ExamSession{
		CandidateID: "race-c",
		JobID:       "race-j",
		Status:      domain.StatusActive,
	}, time.Minute)

	const goroutines = 20
	done := make(chan struct{}, goroutines)
	for i := 0; i < goroutines; i++ {
		go func(i int) {
			_ = svc.UpdateAnswer(ctx, "race-c", "race-j", fmt.Sprintf("q%d", i), "X", time.Minute)
			done <- struct{}{}
		}(i)
	}
	for i := 0; i < goroutines; i++ {
		<-done
	}

	got, err := svc.Get(ctx, "race-c", "race-j")
	if err != nil {
		t.Fatalf("Get after concurrent writes: %v", err)
	}
	if len(got.AnswersMap) == 0 {
		t.Error("expected at least one answer recorded")
	}
}

func TestSessionService_CountActive(t *testing.T) {
	svc := services.NewSessionService(newTestRedis(t))
	ctx := context.Background()

	_ = svc.Create(ctx, &domain.ExamSession{CandidateID: "a", JobID: "j", Status: domain.StatusActive}, time.Minute)
	_ = svc.Create(ctx, &domain.ExamSession{CandidateID: "b", JobID: "j", Status: domain.StatusSubmitted}, time.Minute)

	count, err := svc.CountActive(ctx)
	if err != nil {
		t.Fatalf("CountActive: %v", err)
	}
	if count != 1 {
		t.Errorf("expected 1 active session, got %d", count)
	}
}
