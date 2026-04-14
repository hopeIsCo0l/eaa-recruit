package services

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"github.com/EAA-recruit/exam-engine/internal/domain"
	pkgredis "github.com/EAA-recruit/exam-engine/pkg/redis"
	"github.com/redis/go-redis/v9"
)

// SessionService manages ExamSession lifecycle in Redis (FR-49, FR-55).
// Per-session mutexes prevent data races without a global lock.
type SessionService struct {
	rdb *redis.Client
	mu  sync.Map // key → *sync.Mutex, one per session
}

func NewSessionService(rdb *redis.Client) *SessionService {
	return &SessionService{rdb: rdb}
}

func (s *SessionService) lockFor(key string) *sync.Mutex {
	actual, _ := s.mu.LoadOrStore(key, &sync.Mutex{})
	return actual.(*sync.Mutex)
}

// Create writes a new session to Redis (FR-49). Fails if key already exists and is active.
func (s *SessionService) Create(ctx context.Context, session *domain.ExamSession, ttl time.Duration) error {
	key := domain.SessionKey(session.CandidateID, session.JobID)
	mu := s.lockFor(key)
	mu.Lock()
	defer mu.Unlock()

	data, err := json.Marshal(session)
	if err != nil {
		return fmt.Errorf("marshal session: %w", err)
	}
	return pkgredis.SetJSON(ctx, s.rdb, key, data, ttl)
}

// Get retrieves a session. Returns error if not found.
func (s *SessionService) Get(ctx context.Context, candidateID, jobID string) (*domain.ExamSession, error) {
	key := domain.SessionKey(candidateID, jobID)
	data, err := pkgredis.GetJSON(ctx, s.rdb, key)
	if err != nil {
		return nil, err
	}
	var session domain.ExamSession
	if err := json.Unmarshal(data, &session); err != nil {
		return nil, fmt.Errorf("unmarshal session: %w", err)
	}
	return &session, nil
}

// Update overwrites the full session (concurrency-safe, per-session lock) (FR-55).
func (s *SessionService) Update(ctx context.Context, session *domain.ExamSession, ttl time.Duration) error {
	key := domain.SessionKey(session.CandidateID, session.JobID)
	mu := s.lockFor(key)
	mu.Lock()
	defer mu.Unlock()

	data, err := json.Marshal(session)
	if err != nil {
		return fmt.Errorf("marshal session: %w", err)
	}
	return pkgredis.SetJSON(ctx, s.rdb, key, data, ttl)
}

// UpdateAnswer atomically records one answer in the session's AnswersMap (FR-52).
// Overwrites any existing answer for that question (candidate can change their mind).
func (s *SessionService) UpdateAnswer(ctx context.Context, candidateID, jobID, questionID, answer string, ttl time.Duration) error {
	key := domain.SessionKey(candidateID, jobID)
	mu := s.lockFor(key)
	mu.Lock()
	defer mu.Unlock()

	data, err := pkgredis.GetJSON(ctx, s.rdb, key)
	if err != nil {
		return err
	}
	var session domain.ExamSession
	if err := json.Unmarshal(data, &session); err != nil {
		return err
	}
	if session.AnswersMap == nil {
		session.AnswersMap = make(map[string]string)
	}
	session.AnswersMap[questionID] = answer

	updated, err := json.Marshal(session)
	if err != nil {
		return err
	}
	return pkgredis.SetJSON(ctx, s.rdb, key, updated, ttl)
}

// CountActive returns the number of sessions with ACTIVE status (FR-60).
func (s *SessionService) CountActive(ctx context.Context) (int64, error) {
	var cursor uint64
	var count int64
	for {
		keys, nextCursor, err := s.rdb.Scan(ctx, cursor, "exam:session:*", 100).Result()
		if err != nil {
			return 0, err
		}
		for _, k := range keys {
			data, err := pkgredis.GetJSON(ctx, s.rdb, k)
			if err != nil {
				continue
			}
			var session domain.ExamSession
			if json.Unmarshal(data, &session) == nil && session.Status == domain.StatusActive {
				count++
			}
		}
		cursor = nextCursor
		if cursor == 0 {
			break
		}
	}
	return count, nil
}

// GetAllActive returns all sessions with ACTIVE status for countdown/heartbeat processing.
func (s *SessionService) GetAllActive(ctx context.Context) ([]*domain.ExamSession, error) {
	var cursor uint64
	var sessions []*domain.ExamSession
	for {
		keys, nextCursor, err := s.rdb.Scan(ctx, cursor, "exam:session:*", 100).Result()
		if err != nil {
			return nil, err
		}
		for _, k := range keys {
			data, err := pkgredis.GetJSON(ctx, s.rdb, k)
			if err != nil {
				continue
			}
			var session domain.ExamSession
			if json.Unmarshal(data, &session) == nil && session.Status == domain.StatusActive {
				sessions = append(sessions, &session)
			}
		}
		cursor = nextCursor
		if cursor == 0 {
			break
		}
	}
	return sessions, nil
}
