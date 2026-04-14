package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"time"

	"github.com/EAA-recruit/exam-engine/internal/config"
)

type AIGradingRequest struct {
	QuestionID      string `json:"questionId"`
	CandidateAnswer string `json:"candidateAnswer"`
	JobID           string `json:"jobId"`
}

type AIGradingResponse struct {
	Score float64 `json:"score"`
}

// AIGradingClient sends short-answer grading requests to the Python AI service (FR-56).
type AIGradingClient struct {
	cfg    *config.Config
	client *http.Client
}

func NewAIGradingClient(cfg *config.Config) *AIGradingClient {
	return &AIGradingClient{
		cfg:    cfg,
		client: &http.Client{Timeout: cfg.AIGradingTimeout},
	}
}

// Grade sends one short-answer grading request and returns a score 0–100.
func (a *AIGradingClient) Grade(ctx context.Context, req AIGradingRequest) (float64, error) {
	body, err := json.Marshal(req)
	if err != nil {
		return 0, err
	}

	url := a.cfg.AIGradingURL + "/api/v1/grade/short-answer"
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return 0, err
	}
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := a.client.Do(httpReq)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return 0, fmt.Errorf("AI service returned %d", resp.StatusCode)
	}

	var result AIGradingResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return 0, err
	}
	return result.Score, nil
}

// GradeWithRetry retries up to cfg.AIGradingRetries times with exponential backoff (FR-57).
// Returns 0 and logs when all retries are exhausted — does NOT block session finalization.
func (a *AIGradingClient) GradeWithRetry(ctx context.Context, req AIGradingRequest) float64 {
	for attempt := 0; attempt < a.cfg.AIGradingRetries; attempt++ {
		score, err := a.Grade(ctx, req)
		if err == nil {
			return score
		}
		backoff := time.Duration(math.Pow(2, float64(attempt))) * time.Second
		log.Printf("AI grading attempt %d/%d failed for question %s: %v (retry in %v)",
			attempt+1, a.cfg.AIGradingRetries, req.QuestionID, err, backoff)
		select {
		case <-ctx.Done():
			log.Printf("AI grading cancelled for question %s", req.QuestionID)
			return 0
		case <-time.After(backoff):
		}
	}
	log.Printf("AI grading exhausted %d retries for question %s — scoring 0", a.cfg.AIGradingRetries, req.QuestionID)
	return 0
}
