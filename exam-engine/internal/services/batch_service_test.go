package services_test

import (
	"context"
	"testing"
	"time"

	"github.com/EAA-recruit/exam-engine/internal/config"
	"github.com/EAA-recruit/exam-engine/internal/services"
)

func TestBatchService_StoreAndGetSchedule(t *testing.T) {
	svc := services.NewBatchService(newTestRedis(t), &config.Config{})
	ctx := context.Background()

	now := time.Now()
	s := services.BatchSchedule{
		ExamID:       "exam-1",
		JobID:        "job-1",
		StartTime:    now.Add(-time.Minute).Unix(),
		EndTime:      now.Add(time.Hour).Unix(),
		DurationSecs: 3600,
	}
	if err := svc.StoreSchedule(ctx, s); err != nil {
		t.Fatalf("StoreSchedule: %v", err)
	}

	got, err := svc.GetSchedule(ctx, "job-1")
	if err != nil {
		t.Fatalf("GetSchedule: %v", err)
	}
	if got.ExamID != "exam-1" || got.DurationSecs != 3600 {
		t.Errorf("unexpected schedule: %+v", got)
	}
}

func TestBatchService_GetSchedule_Missing(t *testing.T) {
	svc := services.NewBatchService(newTestRedis(t), &config.Config{})
	_, err := svc.GetSchedule(context.Background(), "nonexistent")
	if err == nil {
		t.Fatal("expected error for missing schedule")
	}
}

func TestBatchService_IsWindowOpen_Open(t *testing.T) {
	svc := services.NewBatchService(newTestRedis(t), &config.Config{})
	ctx := context.Background()

	now := time.Now()
	_ = svc.StoreSchedule(ctx, services.BatchSchedule{
		JobID:     "job-open",
		StartTime: now.Add(-time.Minute).Unix(),
		EndTime:   now.Add(time.Hour).Unix(),
	})

	s, err := svc.IsWindowOpen(ctx, "job-open")
	if err != nil {
		t.Fatalf("IsWindowOpen: %v", err)
	}
	if s.JobID != "job-open" {
		t.Errorf("unexpected schedule JobID: %s", s.JobID)
	}
}

func TestBatchService_IsWindowOpen_Closed(t *testing.T) {
	svc := services.NewBatchService(newTestRedis(t), &config.Config{})
	ctx := context.Background()

	now := time.Now()
	_ = svc.StoreSchedule(ctx, services.BatchSchedule{
		JobID:     "job-closed",
		StartTime: now.Add(-2 * time.Hour).Unix(),
		EndTime:   now.Add(-time.Hour).Unix(),
	})

	_, err := svc.IsWindowOpen(ctx, "job-closed")
	if err == nil {
		t.Fatal("expected error for closed window")
	}
}

func TestBatchService_IsWindowOpen_NotYetOpen(t *testing.T) {
	svc := services.NewBatchService(newTestRedis(t), &config.Config{})
	ctx := context.Background()

	now := time.Now()
	_ = svc.StoreSchedule(ctx, services.BatchSchedule{
		JobID:     "job-future",
		StartTime: now.Add(time.Hour).Unix(),
		EndTime:   now.Add(2 * time.Hour).Unix(),
	})

	_, err := svc.IsWindowOpen(ctx, "job-future")
	if err == nil {
		t.Fatal("expected error for not-yet-open window")
	}
}

func TestBatchService_CandidateAuthorization(t *testing.T) {
	svc := services.NewBatchService(newTestRedis(t), &config.Config{})
	ctx := context.Background()

	if err := svc.StoreAuthorizedCandidates(ctx, "job-1", []string{"alice", "bob"}); err != nil {
		t.Fatalf("StoreAuthorizedCandidates: %v", err)
	}

	ok, err := svc.IsCandidateAuthorized(ctx, "job-1", "alice")
	if err != nil || !ok {
		t.Errorf("alice should be authorized (ok=%v, err=%v)", ok, err)
	}

	ok, _ = svc.IsCandidateAuthorized(ctx, "job-1", "charlie")
	if ok {
		t.Error("charlie should not be authorized")
	}
}
