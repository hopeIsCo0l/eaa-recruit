package services

import (
	"context"
	"log"
	"time"

	"github.com/EAA-recruit/exam-engine/internal/domain"
)

// CountdownService enforces exam duration and auto-submits expired sessions (FR-47).
// Also monitors heartbeats to flag disconnected candidates (FR-48).
type CountdownService struct {
	sessionSvc *SessionService
	batchSvc   *BatchService
	gradingSvc *GradingService
}

func NewCountdownService(sessionSvc *SessionService, batchSvc *BatchService, grading *GradingService) *CountdownService {
	return &CountdownService{
		sessionSvc: sessionSvc,
		batchSvc:   batchSvc,
		gradingSvc: grading,
	}
}

// Start ticks every 10 seconds, updates timeRemaining, and auto-submits expired sessions (FR-47).
// Run as a goroutine; stops when ctx is cancelled.
func (c *CountdownService) Start(ctx context.Context) {
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			log.Println("countdown orchestrator stopped")
			return
		case <-ticker.C:
			c.tick(ctx)
		}
	}
}

func (c *CountdownService) tick(ctx context.Context) {
	sessions, err := c.sessionSvc.GetAllActive(ctx)
	if err != nil {
		log.Printf("countdown tick scan error: %v", err)
		return
	}

	for _, session := range sessions {
		schedule, err := c.batchSvc.GetSchedule(ctx, session.JobID)
		if err != nil {
			continue
		}

		elapsed := int64(time.Since(session.StartedAt).Seconds())
		remaining := schedule.DurationSecs - elapsed

		if remaining <= 0 {
			log.Printf("auto-submitting expired session for candidate %s", session.CandidateID)
			session.TimeRemaining = 0
			session.Status = domain.StatusSubmitted
			ttl := 10 * time.Minute
			if err := c.sessionSvc.Update(ctx, session, ttl); err != nil {
				log.Printf("auto-submit update failed for %s: %v", session.CandidateID, err)
				continue
			}
			// Grade through same pipeline as manual submit (FR-47)
			go c.gradingSvc.Grade(context.Background(), session, 600)
		} else {
			session.TimeRemaining = remaining
			ttl := time.Duration(remaining+600) * time.Second
			_ = c.sessionSvc.Update(ctx, session, ttl)
		}
	}
}

// CheckHeartbeats flags sessions as DISCONNECTED when lastSeenAt is stale (FR-48).
// DISCONNECTED sessions remain resumable — they are NOT auto-submitted.
func (c *CountdownService) CheckHeartbeats(ctx context.Context, maxMisses int, interval time.Duration) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			log.Println("heartbeat monitor stopped")
			return
		case <-ticker.C:
			sessions, err := c.sessionSvc.GetAllActive(ctx)
			if err != nil {
				continue
			}
			deadline := interval * time.Duration(maxMisses)
			for _, s := range sessions {
				if time.Since(s.LastSeenAt) > deadline {
					log.Printf("candidate %s flagged DISCONNECTED (last seen %v ago)", s.CandidateID, time.Since(s.LastSeenAt).Round(time.Second))
					s.Status = domain.StatusDisconnected
					_ = c.sessionSvc.Update(ctx, s, time.Duration(s.TimeRemaining+600)*time.Second)
				}
			}
		}
	}
}
