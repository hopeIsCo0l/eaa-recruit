package domain

type QuestionType string

const (
	QuestionMCQ         QuestionType = "MCQ"
	QuestionShortAnswer QuestionType = "SHORT_ANSWER"
)

type Question struct {
	ID            string       `json:"id"`
	ExamID        string       `json:"examId"`
	Text          string       `json:"text"`
	Type          QuestionType `json:"type"`
	Options       []string     `json:"options,omitempty"` // MCQ only
	CorrectAnswer string       `json:"correctAnswer"`     // never sent to candidate
	Marks         float64      `json:"marks"`
}

type ExamCompletedEvent struct {
	CandidateID string  `json:"candidateId"`
	JobID       string  `json:"jobId"`
	ExamID      string  `json:"examId"`
	TotalScore  float64 `json:"totalScore"`
	CompletedAt int64   `json:"completedAt"` // Unix timestamp
}
