package domain

import "time"

type SessionStatus string

const (
	StatusActive       SessionStatus = "ACTIVE"
	StatusSubmitted    SessionStatus = "SUBMITTED"
	StatusDisconnected SessionStatus = "DISCONNECTED"
)

// ExamSession is the authoritative real-time state for one candidate's attempt.
// Stored in Redis as JSON under key exam:session:{candidateId}:{jobId}.
type ExamSession struct {
	CandidateID          string            `json:"candidateId"`
	JobID                string            `json:"jobId"`
	ExamID               string            `json:"examId"`
	StartedAt            time.Time         `json:"startedAt"`
	CurrentQuestionIndex int               `json:"currentQuestionIndex"`
	QuestionOrder        []string          `json:"questionOrder"` // deterministically shuffled question IDs
	AnswersMap           map[string]string `json:"answersMap"`    // questionId → selectedAnswer
	TimeRemaining        int64             `json:"timeRemaining"` // seconds
	Status               SessionStatus     `json:"status"`
	LastSeenAt           time.Time         `json:"lastSeenAt"`
	MissedHeartbeats     int               `json:"missedHeartbeats"`
	MCQScore             float64           `json:"mcqScore"`
	ShortAnswerScore     float64           `json:"shortAnswerScore"`
	TotalScore           float64           `json:"totalScore"`
	GradingComplete      bool              `json:"gradingComplete"`
}

func SessionKey(candidateID, jobID string) string {
	return "exam:session:" + candidateID + ":" + jobID
}
