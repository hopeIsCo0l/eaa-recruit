package services

import (
	"log"
	"sync"
)

// GradingTask is dispatched to the worker pool for async AI short-answer grading (FR-43, FR-56).
type GradingTask struct {
	CandidateID string
	JobID       string
	QuestionID  string
	Answer      string
	Done        chan<- float64 // worker sends score here when finished
}

// WorkerPool manages a fixed pool of goroutines for non-blocking grading (FR-43).
type WorkerPool struct {
	tasks   chan GradingTask
	wg      sync.WaitGroup
	workers int
}

func NewWorkerPool(size int) *WorkerPool {
	return &WorkerPool{
		tasks:   make(chan GradingTask, size*10), // buffered — handler never blocks
		workers: size,
	}
}

// Start launches worker goroutines. handler is called for each task.
// Blocks until Stop() drains the channel.
func (wp *WorkerPool) Start(handler func(GradingTask)) {
	for i := 0; i < wp.workers; i++ {
		wp.wg.Add(1)
		go func(id int) {
			defer wp.wg.Done()
			for task := range wp.tasks {
				handler(task)
			}
			log.Printf("grading worker %d stopped", id)
		}(i)
	}
}

// Submit enqueues a grading task. Returns immediately (non-blocking).
func (wp *WorkerPool) Submit(task GradingTask) {
	wp.tasks <- task
}

// Stop closes the task channel and waits for all workers to drain (FR-43).
func (wp *WorkerPool) Stop() {
	close(wp.tasks)
	wp.wg.Wait()
}
