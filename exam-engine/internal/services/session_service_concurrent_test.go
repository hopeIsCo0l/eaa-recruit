package services_test

import (
	"context"
	"fmt"
	"sync"
	"testing"
	"time"

	"github.com/alicebob/miniredis/v2"
	"github.com/redis/go-redis/v9"

	"github.com/EAA-recruit/exam-engine/internal/domain"
	"github.com/EAA-recruit/exam-engine/internal/services"
)

func newTestRedis(t *testing.T) (*redis.Client, func()) {
	t.Helper()
	mr, err := miniredis.Run()
	if err != nil {
		t.Fatalf("start miniredis: %v", err)
	}
	rdb := redis.NewClient(&redis.Options{Addr: mr.Addr()})
	return rdb, func() {
		_ = rdb.Close()
		mr.Close()
	}
}

// Each goroutine writes a different answer to the same session.
// With per-session mutexes, every answer must land in the final map — no lost updates.
func TestSessionService_ConcurrentUpdateAnswer_NoLostWrites(t *testing.T) {
	rdb, teardown := newTestRedis(t)
	defer teardown()

	svc := services.NewSessionService(rdb)
	ctx := context.Background()
	ttl := time.Minute

	session := &domain.ExamSession{
		CandidateID: "c1",
		JobID:       "j1",
		ExamID:      "e1",
		Status:      domain.StatusActive,
		AnswersMap:  map[string]string{},
	}
	if err := svc.Create(ctx, session, ttl); err != nil {
		t.Fatalf("create session: %v", err)
	}

	const N = 50
	var wg sync.WaitGroup
	wg.Add(N)
	for i := 0; i < N; i++ {
		go func(idx int) {
			defer wg.Done()
			qid := fmt.Sprintf("q%d", idx)
			ans := fmt.Sprintf("a%d", idx)
			if err := svc.UpdateAnswer(ctx, "c1", "j1", qid, ans, ttl); err != nil {
				t.Errorf("update %d: %v", idx, err)
			}
		}(i)
	}
	wg.Wait()

	final, err := svc.Get(ctx, "c1", "j1")
	if err != nil {
		t.Fatalf("get final: %v", err)
	}
	if got := len(final.AnswersMap); got != N {
		t.Fatalf("expected %d answers, got %d (lost writes — mutex broken)", N, got)
	}
	for i := 0; i < N; i++ {
		want := fmt.Sprintf("a%d", i)
		if got := final.AnswersMap[fmt.Sprintf("q%d", i)]; got != want {
			t.Errorf("q%d: want %q got %q", i, want, got)
		}
	}
}

// Different sessions must not block each other.
// Many candidates submit in parallel — each lands in its own key with its own answers.
func TestSessionService_IndependentSessionsParallel(t *testing.T) {
	rdb, teardown := newTestRedis(t)
	defer teardown()

	svc := services.NewSessionService(rdb)
	ctx := context.Background()
	ttl := time.Minute

	const candidates = 25
	for i := 0; i < candidates; i++ {
		s := &domain.ExamSession{
			CandidateID: fmt.Sprintf("c%d", i),
			JobID:       "j1",
			ExamID:      "e1",
			Status:      domain.StatusActive,
			AnswersMap:  map[string]string{},
		}
		if err := svc.Create(ctx, s, ttl); err != nil {
			t.Fatalf("create c%d: %v", i, err)
		}
	}

	var wg sync.WaitGroup
	wg.Add(candidates)
	for i := 0; i < candidates; i++ {
		go func(idx int) {
			defer wg.Done()
			cid := fmt.Sprintf("c%d", idx)
			for q := 0; q < 5; q++ {
				_ = svc.UpdateAnswer(ctx, cid, "j1",
					fmt.Sprintf("q%d", q), fmt.Sprintf("ans-%d-%d", idx, q), ttl)
			}
		}(i)
	}
	wg.Wait()

	for i := 0; i < candidates; i++ {
		got, err := svc.Get(ctx, fmt.Sprintf("c%d", i), "j1")
		if err != nil {
			t.Fatalf("get c%d: %v", i, err)
		}
		if len(got.AnswersMap) != 5 {
			t.Errorf("c%d expected 5 answers, got %d", i, len(got.AnswersMap))
		}
	}
}

// Overwriting the same question key concurrently must converge to one valid answer
// (last writer wins). The session must still be valid JSON and parseable.
func TestSessionService_SameQuestionConcurrentOverwrite(t *testing.T) {
	rdb, teardown := newTestRedis(t)
	defer teardown()

	svc := services.NewSessionService(rdb)
	ctx := context.Background()
	ttl := time.Minute

	if err := svc.Create(ctx, &domain.ExamSession{
		CandidateID: "c1", JobID: "j1", ExamID: "e1",
		Status: domain.StatusActive, AnswersMap: map[string]string{},
	}, ttl); err != nil {
		t.Fatal(err)
	}

	const writers = 30
	var wg sync.WaitGroup
	wg.Add(writers)
	for i := 0; i < writers; i++ {
		go func(idx int) {
			defer wg.Done()
			_ = svc.UpdateAnswer(ctx, "c1", "j1", "q1", fmt.Sprintf("answer-%d", idx), ttl)
		}(i)
	}
	wg.Wait()

	final, err := svc.Get(ctx, "c1", "j1")
	if err != nil {
		t.Fatalf("get: %v", err)
	}
	if _, ok := final.AnswersMap["q1"]; !ok {
		t.Fatal("q1 missing — all 30 writes lost")
	}
	// Final value is one of the written ones (last-writer-wins under the lock).
}

// CountActive uses SCAN — must not race with concurrent Create/Update.
func TestSessionService_CountActive_WhileWriting(t *testing.T) {
	rdb, teardown := newTestRedis(t)
	defer teardown()

	svc := services.NewSessionService(rdb)
	ctx := context.Background()
	ttl := time.Minute

	const N = 20
	var wg sync.WaitGroup
	wg.Add(N)
	for i := 0; i < N; i++ {
		go func(idx int) {
			defer wg.Done()
			_ = svc.Create(ctx, &domain.ExamSession{
				CandidateID: fmt.Sprintf("c%d", idx),
				JobID:       "j1",
				ExamID:      "e1",
				Status:      domain.StatusActive,
				AnswersMap:  map[string]string{},
			}, ttl)
		}(i)
	}

	// Read concurrently with writes — must not panic / error.
	done := make(chan struct{})
	go func() {
		defer close(done)
		for i := 0; i < 10; i++ {
			_, _ = svc.CountActive(ctx)
		}
	}()
	wg.Wait()
	<-done

	final, err := svc.CountActive(ctx)
	if err != nil {
		t.Fatalf("final count: %v", err)
	}
	if final != N {
		t.Errorf("expected %d active, got %d", N, final)
	}
}
