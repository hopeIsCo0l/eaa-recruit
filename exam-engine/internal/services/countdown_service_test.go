package services

import (
	"context"
	"testing"
	"time"

	miniredis "github.com/alicebob/miniredis/v2"
	"github.com/IBM/sarama"
	"github.com/EAA-recruit/exam-engine/internal/config"
	"github.com/EAA-recruit/exam-engine/internal/domain"
	"github.com/redis/go-redis/v9"
)

func countdownTestRedis(t *testing.T) *redis.Client {
	t.Helper()
	mr := miniredis.RunT(t)
	return redis.NewClient(&redis.Options{Addr: mr.Addr()})
}

// nopProducer is a no-op sarama.SyncProducer for tests where Kafka publish is a
// side-effect of async goroutines and expectation tracking would be racy.
type nopProducer struct{}

func (n *nopProducer) SendMessage(*sarama.ProducerMessage) (int32, int64, error) { return 0, 0, nil }
func (n *nopProducer) SendMessages([]*sarama.ProducerMessage) error              { return nil }
func (n *nopProducer) Close() error                                              { return nil }
func (n *nopProducer) TxnStatus() sarama.ProducerTxnStatusFlag                  { return 0 }
func (n *nopProducer) IsTransactional() bool                                     { return false }
func (n *nopProducer) BeginTxn() error                                           { return nil }
func (n *nopProducer) CommitTxn() error                                          { return nil }
func (n *nopProducer) AbortTxn() error                                           { return nil }
func (n *nopProducer) AddOffsetsToTxn(map[string][]*sarama.PartitionOffsetMetadata, string) error {
	return nil
}
func (n *nopProducer) AddMessageToTxn(*sarama.ConsumerMessage, string, *string) error { return nil }

func TestCountdownService_Tick_AutoSubmitsExpiredSession(t *testing.T) {
	rdb := countdownTestRedis(t)
	sessionSvc := NewSessionService(rdb)
	batchSvc := NewBatchService(rdb, &config.Config{})

	qc := NewQuestionCache()
	qc.Store("exam-1", []domain.Question{})
	pool := NewWorkerPool(1)
	pool.Start(func(task GradingTask) { task.Done <- 0 })
	t.Cleanup(pool.Stop)

	// nopProducer avoids racy expectation tracking for the async Grade() goroutine
	gradingSvc := NewGradingService(qc, sessionSvc, nil, pool, NewKafkaProducer(&nopProducer{}))
	svc := NewCountdownService(sessionSvc, batchSvc, gradingSvc)
	ctx := context.Background()

	now := time.Now()
	_ = batchSvc.StoreSchedule(ctx, BatchSchedule{
		JobID:        "job-expire",
		ExamID:       "exam-1",
		StartTime:    now.Add(-2 * time.Minute).Unix(),
		EndTime:      now.Add(time.Hour).Unix(),
		DurationSecs: 60,
	})

	// Session started 2 minutes ago → elapsed (120s) > DurationSecs (60s)
	_ = sessionSvc.Create(ctx, &domain.ExamSession{
		CandidateID:   "c1",
		JobID:         "job-expire",
		ExamID:        "exam-1",
		Status:        domain.StatusActive,
		StartedAt:     now.Add(-2 * time.Minute),
		TimeRemaining: 60,
		AnswersMap:    map[string]string{},
	}, time.Hour)

	svc.tick(ctx)

	got, err := sessionSvc.Get(ctx, "c1", "job-expire")
	if err != nil {
		t.Fatalf("Get after tick: %v", err)
	}
	if got.Status != domain.StatusSubmitted {
		t.Errorf("expected SUBMITTED after auto-submit, got %s", got.Status)
	}
	if got.TimeRemaining != 0 {
		t.Errorf("expected TimeRemaining=0, got %d", got.TimeRemaining)
	}
}

func TestCountdownService_Tick_UpdatesTimeRemaining(t *testing.T) {
	rdb := countdownTestRedis(t)
	sessionSvc := NewSessionService(rdb)
	batchSvc := NewBatchService(rdb, &config.Config{})
	svc := NewCountdownService(sessionSvc, batchSvc, nil)
	ctx := context.Background()

	now := time.Now()
	_ = batchSvc.StoreSchedule(ctx, BatchSchedule{
		JobID:        "job-active",
		DurationSecs: 3600,
		StartTime:    now.Add(-time.Minute).Unix(),
		EndTime:      now.Add(time.Hour).Unix(),
	})

	_ = sessionSvc.Create(ctx, &domain.ExamSession{
		CandidateID:   "c2",
		JobID:         "job-active",
		Status:        domain.StatusActive,
		StartedAt:     now.Add(-30 * time.Second),
		TimeRemaining: 3600,
	}, time.Hour)

	svc.tick(ctx)

	got, err := sessionSvc.Get(ctx, "c2", "job-active")
	if err != nil {
		t.Fatalf("Get after tick: %v", err)
	}
	if got.Status == domain.StatusSubmitted {
		t.Error("active session should not be auto-submitted")
	}
	// Approximately 3570 remaining (3600 - 30s elapsed)
	if got.TimeRemaining <= 0 || got.TimeRemaining > 3590 {
		t.Errorf("unexpected TimeRemaining: %d", got.TimeRemaining)
	}
}

func TestCountdownService_CheckHeartbeats_DisconnectsStaleSession(t *testing.T) {
	rdb := countdownTestRedis(t)
	sessionSvc := NewSessionService(rdb)
	svc := NewCountdownService(sessionSvc, nil, nil)
	ctx := context.Background()

	_ = sessionSvc.Create(ctx, &domain.ExamSession{
		CandidateID:   "c3",
		JobID:         "j3",
		Status:        domain.StatusActive,
		StartedAt:     time.Now(),
		LastSeenAt:    time.Now().Add(-5 * time.Minute),
		TimeRemaining: 3600,
	}, time.Hour)

	runCtx, cancel := context.WithTimeout(ctx, 200*time.Millisecond)
	defer cancel()

	// interval=10ms, maxMisses=3 → deadline=30ms; LastSeenAt 5 min ago → disconnect
	done := make(chan struct{})
	go func() {
		svc.CheckHeartbeats(runCtx, 3, 10*time.Millisecond)
		close(done)
	}()
	<-done

	got, err := sessionSvc.Get(ctx, "c3", "j3")
	if err != nil {
		t.Fatalf("Get: %v", err)
	}
	if got.Status != domain.StatusDisconnected {
		t.Errorf("expected DISCONNECTED, got %s", got.Status)
	}
}

func TestCountdownService_CheckHeartbeats_StopsOnContextCancel(t *testing.T) {
	rdb := countdownTestRedis(t)
	sessionSvc := NewSessionService(rdb)
	svc := NewCountdownService(sessionSvc, nil, nil)

	ctx, cancel := context.WithTimeout(context.Background(), 50*time.Millisecond)
	defer cancel()

	done := make(chan struct{})
	go func() {
		svc.CheckHeartbeats(ctx, 3, 10*time.Millisecond)
		close(done)
	}()

	select {
	case <-done:
	case <-time.After(500 * time.Millisecond):
		t.Fatal("CheckHeartbeats did not stop after context cancellation")
	}
}
