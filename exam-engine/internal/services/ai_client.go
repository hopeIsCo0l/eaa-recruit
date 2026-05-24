package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"math/rand"
	"net/http"
	"time"

	"github.com/EAA-recruit/exam-engine/internal/config"
)

// Matches ai-service grading.GradeAnswerRequest.
type AIGradingRequest struct {
	QuestionID       string   `json:"questionId"`
	IdealAnswer      string   `json:"idealAnswer"`
	CandidateAnswer  string   `json:"candidateAnswer"`
	MaxMarks         float64  `json:"maxMarks"`
	RequiredKeywords []string `json:"requiredKeywords,omitempty"`
}

// Matches ai-service grading.GradeAnswerResponse.
type AIGradingResponse struct {
	QuestionID      string   `json:"questionId"`
	RawSimilarity   float64  `json:"rawSimilarity"`
	AwardedMarks    float64  `json:"awardedMarks"`
	MaxMarks        float64  `json:"maxMarks"`
	MissingKeywords []string `json:"missingKeywords"`
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

// Grade sends one short-answer grading request and returns the awarded marks.
func (a *AIGradingClient) Grade(ctx context.Context, req AIGradingRequest) (float64, error) {
	body, err := json.Marshal(req)
	if err != nil {
		return 0, fmt.Errorf("marshal grading request: %w", err)
	}

	url := a.cfg.AIGradingURL + "/api/v1/grade-answer"
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return 0, fmt.Errorf("build grading request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("X-Internal-Api-Key", a.cfg.InternalApiKey)

	resp, err := a.client.Do(httpReq)
	if err != nil {
		return 0, fmt.Errorf("call ai-service %s: %w", url, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return 0, fmt.Errorf("ai-service %s returned status %d", url, resp.StatusCode)
	}

	var result AIGradingResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return 0, fmt.Errorf("decode grading response: %w", err)
	}
	return result.AwardedMarks, nil
}

// GradeWithRetry retries up to cfg.AIGradingRetries times with exponential backoff + jitter (FR-57).
// Returns 0 and logs when all retries are exhausted — does NOT block session finalization.
func (a *AIGradingClient) GradeWithRetry(ctx context.Context, req AIGradingRequest) float64 {
	for attempt := 0; attempt < a.cfg.AIGradingRetries; attempt++ {
		score, err := a.Grade(ctx, req)
		if err == nil {
			return score
		}
		base := time.Duration(math.Pow(2, float64(attempt))) * time.Second
		jitter := time.Duration(rand.Int63n(int64(base) / 2))
		backoff := base + jitter
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
