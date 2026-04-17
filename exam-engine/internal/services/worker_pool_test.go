package services_test

import (
	"sync/atomic"
	"testing"
	"time"

	"github.com/EAA-recruit/exam-engine/internal/services"
)

func TestWorkerPool_ProcessesAllTasks(t *testing.T) {
	pool := services.NewWorkerPool(4)
	var processed int64

	pool.Start(func(task services.GradingTask) {
		atomic.AddInt64(&processed, 1)
		task.Done <- 75.0
	})

	const tasks = 20
	for i := 0; i < tasks; i++ {
		done := make(chan float64, 1)
		pool.Submit(services.GradingTask{
			CandidateID: "c1",
			QuestionID:  "q1",
			Done:        done,
		})
		<-done
	}

	pool.Stop()

	if atomic.LoadInt64(&processed) != tasks {
		t.Errorf("expected %d tasks processed, got %d", tasks, atomic.LoadInt64(&processed))
	}
}

func TestWorkerPool_NonBlocking(t *testing.T) {
	pool := services.NewWorkerPool(2)
	done := make(chan float64, 1)

	pool.Start(func(task services.GradingTask) {
		time.Sleep(10 * time.Millisecond)
		task.Done <- 50.0
	})

	start := time.Now()
	pool.Submit(services.GradingTask{Done: done})
	elapsed := time.Since(start)

	// Submit should return nearly instantly (buffered channel)
	if elapsed > 5*time.Millisecond {
		t.Errorf("Submit blocked for %v, expected <5ms", elapsed)
	}

	<-done
	pool.Stop()
}
