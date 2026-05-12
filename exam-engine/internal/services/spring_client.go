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
	"github.com/EAA-recruit/exam-engine/internal/domain"
)

// SpringClient calls Spring Boot internal endpoints over HTTP — replaces the old Kafka producer.
type SpringClient struct {
	baseURL    string
	apiKey     string
	httpClient *http.Client
}

func NewSpringClient(cfg *config.Config) *SpringClient {
	return &SpringClient{
		baseURL: cfg.SpringBaseURL,
		apiKey:  cfg.InternalApiKey,
		httpClient: &http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

type examCompletedPayload struct {
	CandidateID string  `json:"candidateId"`
	JobID       string  `json:"jobId"`
	ExamID      string  `json:"examId"`
	ExamScore   float64 `json:"examScore"`
	CompletedAt string  `json:"completedAt"`
}

// PublishExamCompleted POSTs the exam result to Spring Boot with exponential-backoff retries.
// Mirrors the retry semantics of the previous Kafka producer.
func (c *SpringClient) PublishExamCompleted(session *domain.ExamSession) {
	body := examCompletedPayload{
		CandidateID: session.CandidateID,
		JobID:       session.JobID,
		ExamID:      session.ExamID,
		ExamScore:   session.TotalScore,
		CompletedAt: time.Now().UTC().Format(time.RFC3339),
	}
	data, err := json.Marshal(body)
	if err != nil {
		log.Printf("marshal exam-completed failed for %s: %v", session.CandidateID, err)
		return
	}

	url := c.baseURL + "/api/v1/internal/exam-completed"

	const maxRetries = 3
	for attempt := 0; attempt < maxRetries; attempt++ {
		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, url, bytes.NewReader(data))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Internal-Api-Key", c.apiKey)

		resp, err := c.httpClient.Do(req)
		if err == nil && resp.StatusCode >= 200 && resp.StatusCode < 300 {
			_ = resp.Body.Close()
			log.Printf("exam-completed published: candidate=%s score=%.2f", session.CandidateID, session.TotalScore)
			return
		}
		if resp != nil {
			_ = resp.Body.Close()
		}

		backoff := time.Duration(math.Pow(2, float64(attempt))) * time.Second
		log.Printf("exam-completed publish attempt %d/%d failed (err=%v): retry in %v",
			attempt+1, maxRetries, err, backoff)
		time.Sleep(backoff)
	}
	log.Printf("exam-completed publish permanently failed for candidate %s after %d attempts",
		session.CandidateID, maxRetries)
}

// fetchQuestions calls Spring Boot to retrieve cached questions for a given exam.
func (c *SpringClient) FetchQuestions(examID string) ([]domain.Question, error) {
	url := fmt.Sprintf("%s/api/v1/exams/%s/questions", c.baseURL, examID)
	resp, err := c.httpClient.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("spring boot returned %d for exam %s", resp.StatusCode, examID)
	}

	var result struct {
		Data []domain.Question `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}
	return result.Data, nil
}

