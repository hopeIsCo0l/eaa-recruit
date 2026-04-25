package services_test

import (
	"context"
	"testing"
	"time"

	saramock "github.com/IBM/sarama/mocks"
	"github.com/EAA-recruit/exam-engine/internal/domain"
	"github.com/EAA-recruit/exam-engine/internal/services"
)

func newMockGradingDeps(t *testing.T) (
	*services.QuestionCache,
	*services.SessionService,
	*services.WorkerPool,
	*services.KafkaProducer,
	*saramock.SyncProducer,
) {
	t.Helper()
	qc := services.NewQuestionCache()
	sessionSvc := services.NewSessionService(newTestRedis(t))
	pool := services.NewWorkerPool(2)
	pool.Start(func(task services.GradingTask) { task.Done <- 0 })
	t.Cleanup(pool.Stop)

	mock := saramock.NewSyncProducer(t, nil)
	t.Cleanup(func() { _ = mock.Close() })

	return qc, sessionSvc, pool, services.NewKafkaProducer(mock), mock
}

func TestGradingService_MCQ_AllCorrect(t *testing.T) {
	qc, sessionSvc, pool, kafkaProducer, mock := newMockGradingDeps(t)
	mock.ExpectSendMessageAndSucceed()

	gradingSvc := services.NewGradingService(qc, sessionSvc, nil, pool, kafkaProducer)
	ctx := context.Background()

	qc.Store("exam-1", []domain.Question{
		{ID: "q1", Type: domain.QuestionMCQ, CorrectAnswer: "A", Marks: 10},
		{ID: "q2", Type: domain.QuestionMCQ, CorrectAnswer: "B", Marks: 5},
	})

	session := &domain.ExamSession{
		CandidateID: "cand-1", JobID: "job-1", ExamID: "exam-1",
		Status:     domain.StatusSubmitted,
		AnswersMap: map[string]string{"q1": "A", "q2": "B"},
	}
	_ = sessionSvc.Create(ctx, session, time.Hour)

	gradingSvc.Grade(ctx, session, 3600)

	if session.MCQScore != 15 {
		t.Errorf("MCQScore: got %v, want 15", session.MCQScore)
	}
	if session.TotalScore != 15 {
		t.Errorf("TotalScore: got %v, want 15", session.TotalScore)
	}
	if !session.GradingComplete {
		t.Error("GradingComplete should be true for MCQ-only exam")
	}
}

func TestGradingService_MCQ_PartialCorrect(t *testing.T) {
	qc, sessionSvc, pool, kafkaProducer, mock := newMockGradingDeps(t)
	mock.ExpectSendMessageAndSucceed()

	gradingSvc := services.NewGradingService(qc, sessionSvc, nil, pool, kafkaProducer)
	ctx := context.Background()

	qc.Store("exam-2", []domain.Question{
		{ID: "q1", Type: domain.QuestionMCQ, CorrectAnswer: "A", Marks: 10},
		{ID: "q2", Type: domain.QuestionMCQ, CorrectAnswer: "B", Marks: 10},
		{ID: "q3", Type: domain.QuestionMCQ, CorrectAnswer: "C", Marks: 10},
	})

	session := &domain.ExamSession{
		CandidateID: "cand-2", JobID: "job-2", ExamID: "exam-2",
		Status:     domain.StatusSubmitted,
		AnswersMap: map[string]string{"q1": "A", "q2": "X", "q3": "C"},
	}
	_ = sessionSvc.Create(ctx, session, time.Hour)

	gradingSvc.Grade(ctx, session, 3600)

	// q1 correct (10), q2 wrong (0), q3 correct (10) → 20
	if session.MCQScore != 20 {
		t.Errorf("MCQScore: got %v, want 20", session.MCQScore)
	}
	if session.TotalScore != 20 {
		t.Errorf("TotalScore: got %v, want 20", session.TotalScore)
	}
}

func TestGradingService_MCQ_NoAnswers(t *testing.T) {
	qc, sessionSvc, pool, kafkaProducer, mock := newMockGradingDeps(t)
	mock.ExpectSendMessageAndSucceed()

	gradingSvc := services.NewGradingService(qc, sessionSvc, nil, pool, kafkaProducer)
	ctx := context.Background()

	qc.Store("exam-3", []domain.Question{
		{ID: "q1", Type: domain.QuestionMCQ, CorrectAnswer: "A", Marks: 10},
	})

	session := &domain.ExamSession{
		CandidateID: "cand-3", JobID: "job-3", ExamID: "exam-3",
		Status:     domain.StatusSubmitted,
		AnswersMap: map[string]string{},
	}
	_ = sessionSvc.Create(ctx, session, time.Hour)

	gradingSvc.Grade(ctx, session, 3600)

	if session.MCQScore != 0 {
		t.Errorf("MCQScore: got %v, want 0", session.MCQScore)
	}
	if !session.GradingComplete {
		t.Error("GradingComplete should be true even with zero score")
	}
}

func TestGradingService_QuestionsNotCached(t *testing.T) {
	qc, sessionSvc, pool, kafkaProducer, _ := newMockGradingDeps(t)
	gradingSvc := services.NewGradingService(qc, sessionSvc, nil, pool, kafkaProducer)
	ctx := context.Background()

	session := &domain.ExamSession{
		CandidateID: "cand-4", JobID: "job-4", ExamID: "exam-nocache",
		Status: domain.StatusSubmitted,
	}
	_ = sessionSvc.Create(ctx, session, time.Hour)

	// Grade returns early — no panic, session unchanged
	gradingSvc.Grade(ctx, session, 3600)

	if session.GradingComplete {
		t.Error("GradingComplete should remain false when questions are missing")
	}
}

// TestGradingService_Persists verifies the graded session is written back to Redis.
func TestGradingService_Persists(t *testing.T) {
	qc, sessionSvc, pool, kafkaProducer, mock := newMockGradingDeps(t)
	mock.ExpectSendMessageAndSucceed()

	gradingSvc := services.NewGradingService(qc, sessionSvc, nil, pool, kafkaProducer)
	ctx := context.Background()

	qc.Store("exam-5", []domain.Question{
		{ID: "q1", Type: domain.QuestionMCQ, CorrectAnswer: "A", Marks: 7},
	})

	session := &domain.ExamSession{
		CandidateID: "cand-5", JobID: "job-5", ExamID: "exam-5",
		Status:     domain.StatusSubmitted,
		AnswersMap: map[string]string{"q1": "A"},
	}
	_ = sessionSvc.Create(ctx, session, time.Hour)

	gradingSvc.Grade(ctx, session, 3600)

	stored, err := sessionSvc.Get(ctx, "cand-5", "job-5")
	if err != nil {
		t.Fatalf("Get after grade: %v", err)
	}
	if stored.TotalScore != 7 {
		t.Errorf("persisted TotalScore: got %v, want 7", stored.TotalScore)
	}
	if !stored.GradingComplete {
		t.Error("persisted GradingComplete should be true")
	}
}
