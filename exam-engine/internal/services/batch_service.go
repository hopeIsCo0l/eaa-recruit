package services

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/EAA-recruit/exam-engine/internal/config"
	"github.com/redis/go-redis/v9"
)

const (
	batchSchedulePrefix = "exam:batch:"
	candidatesPrefix    = "exam:candidates:"
)

// BatchSchedule holds the timing and identity of one exam batch, cached from EXAM_BATCH_READY (FR-46).
type BatchSchedule struct {
	ExamID       string `json:"examId"`
	JobID        string `json:"jobId"`
	StartTime    int64  `json:"startTime"` // Unix timestamp
	EndTime      int64  `json:"endTime"`   // Unix timestamp
	DurationSecs int64  `json:"durationSecs"`
}

// BatchService controls exam window access and authorized candidate checks (FR-46).
type BatchService struct {
	rdb *redis.Client
	cfg *config.Config
}

func NewBatchService(rdb *redis.Client, cfg *config.Config) *BatchService {
	return &BatchService{rdb: rdb, cfg: cfg}
}

func (b *BatchService) StoreSchedule(ctx context.Context, schedule BatchSchedule) error {
	data, err := json.Marshal(schedule)
	if err != nil {
		return err
	}
	ttl := time.Until(time.Unix(schedule.EndTime, 0)) + 10*time.Minute
	if ttl <= 0 {
		ttl = 24 * time.Hour
	}
	return b.rdb.Set(ctx, batchSchedulePrefix+schedule.JobID, data, ttl).Err()
}

func (b *BatchService) GetSchedule(ctx context.Context, jobID string) (*BatchSchedule, error) {
	data, err := b.rdb.Get(ctx, batchSchedulePrefix+jobID).Bytes()
	if err != nil {
		return nil, fmt.Errorf("no schedule for job %s: %w", jobID, err)
	}
	var s BatchSchedule
	if err := json.Unmarshal(data, &s); err != nil {
		return nil, err
	}
	return &s, nil
}

func (b *BatchService) StoreAuthorizedCandidates(ctx context.Context, jobID string, candidates []string) error {
	key := candidatesPrefix + jobID
	members := make([]interface{}, len(candidates))
	for i, c := range candidates {
		members[i] = c
	}
	pipe := b.rdb.Pipeline()
	pipe.Del(ctx, key)
	pipe.SAdd(ctx, key, members...)
	pipe.Expire(ctx, key, 48*time.Hour)
	_, err := pipe.Exec(ctx)
	return err
}

func (b *BatchService) IsCandidateAuthorized(ctx context.Context, jobID, candidateID string) (bool, error) {
	return b.rdb.SIsMember(ctx, candidatesPrefix+jobID, candidateID).Result()
}

// IsWindowOpen returns the schedule if the exam is currently accepting candidates,
// or an error with a user-facing message (FR-46).
func (b *BatchService) IsWindowOpen(ctx context.Context, jobID string) (*BatchSchedule, error) {
	schedule, err := b.GetSchedule(ctx, jobID)
	if err != nil {
		return nil, fmt.Errorf("exam not found")
	}
	now := time.Now().Unix()
	if now < schedule.StartTime {
		return nil, fmt.Errorf("exam not yet open")
	}
	if now > schedule.EndTime {
		return nil, fmt.Errorf("exam window closed")
	}
	return schedule, nil
}
