package services

import (
	"context"
	"log"
	"sync"
	"time"

	"github.com/EAA-recruit/exam-engine/internal/domain"
)

type shortAnswerTask struct {
	question domain.Question
	answer   string
}

// GradingService orchestrates MCQ scoring and dispatches short-answer tasks to the worker pool (FR-54, FR-55, FR-56).
type GradingService struct {
	questionCache *QuestionCache
	sessionSvc    *SessionService
	aiClient      *AIGradingClient
	pool          *WorkerPool
	springClient  *SpringClient
}

func NewGradingService(
	qc *QuestionCache,
	ss *SessionService,
	ai *AIGradingClient,
	pool *WorkerPool,
	sc *SpringClient,
) *GradingService {
	return &GradingService{
		questionCache: qc,
		sessionSvc:    ss,
		aiClient:      ai,
		pool:          pool,
		springClient:  sc,
	}
}

// Grade grades an entire submitted exam session.
// MCQ grading is synchronous (<1s for 100 questions).
// Short-answer grading is dispatched asynchronously via worker pool (FR-54).
func (g *GradingService) Grade(ctx context.Context, session *domain.ExamSession, ttlSecs int64) {
	questions, ok := g.questionCache.Get(session.ExamID)
	if !ok {
		log.Printf("no questions cached for exam %s — cannot grade candidate %s", session.ExamID, session.CandidateID)
		return
	}

	var mcqScore float64
	var saTasks []shortAnswerTask

	for _, q := range questions {
		answer, answered := session.AnswersMap[q.ID]
		switch q.Type {
		case domain.QuestionMCQ:
			if answered && answer == q.CorrectAnswer {
				mcqScore += q.Marks
			}
		case domain.QuestionShortAnswer:
			if answered {
				saTasks = append(saTasks, shortAnswerTask{question: q, answer: answer})
			}
		}
	}

	session.MCQScore = mcqScore
	ttl := time.Duration(ttlSecs) * time.Second

	if len(saTasks) == 0 {
		session.TotalScore = mcqScore
		session.GradingComplete = true
		if err := g.sessionSvc.Update(ctx, session, ttl); err != nil {
			log.Printf("failed to persist grading result for %s: %v", session.CandidateID, err)
		}
		g.springClient.PublishExamCompleted(session)
		log.Printf("grading complete for %s: MCQ=%.2f, total=%.2f", session.CandidateID, mcqScore, session.TotalScore)
		return
	}

	session.TotalScore = mcqScore
	_ = g.sessionSvc.Update(ctx, session, ttl)
	log.Printf("MCQ graded for %s: %.2f — waiting on %d short-answer(s)", session.CandidateID, mcqScore, len(saTasks))

	// Dispatch all short-answer grading in parallel, then collect results atomically
	go g.gradeShortAnswersAndFinalize(session, saTasks, ttlSecs)
}

// gradeShortAnswersAndFinalize dispatches all short-answer tasks, waits for ALL results,
// then updates the session once and publishes a single exam-completed event.
func (g *GradingService) gradeShortAnswersAndFinalize(session *domain.ExamSession, saTasks []shortAnswerTask, ttlSecs int64) {
	type result struct {
		questionID string
		score      float64
	}

	var mu sync.Mutex
	var results []result
	var wg sync.WaitGroup

	for _, t := range saTasks {
		wg.Add(1)
		go func(q domain.Question, answer string) {
			defer wg.Done()

			idealAnswer := q.IdealAnswer
			if idealAnswer == "" {
				idealAnswer = q.CorrectAnswer
			}

			done := make(chan float64, 1)
			task := GradingTask{
				CandidateID: session.CandidateID,
				JobID:       session.JobID,
				QuestionID:  q.ID,
				IdealAnswer: idealAnswer,
				Answer:      answer,
				MaxMarks:    q.Marks,
				Done:        done,
			}
			g.pool.Submit(task)
			score := <-done

			mu.Lock()
			results = append(results, result{questionID: q.ID, score: score})
			mu.Unlock()

			log.Printf("short-answer graded for %s q=%s score=%.2f",
				session.CandidateID, q.ID, score)
		}(t.question, t.answer)
	}

	wg.Wait()

	// All short-answer grading complete — update session atomically
	ctx := context.Background()
	sess, err := g.sessionSvc.Get(ctx, session.CandidateID, session.JobID)
	if err != nil {
		log.Printf("failed to retrieve session for final grading: %v", err)
		return
	}

	var saTotal float64
	for _, r := range results {
		saTotal += r.score
	}

	sess.ShortAnswerScore = saTotal
	sess.TotalScore = sess.MCQScore + saTotal
	sess.GradingComplete = true
	ttl := time.Duration(ttlSecs) * time.Second
	if err := g.sessionSvc.Update(ctx, sess, ttl); err != nil {
		log.Printf("failed to persist final score for %s: %v", session.CandidateID, err)
	}

	g.springClient.PublishExamCompleted(sess)
	log.Printf("grading complete for %s: MCQ=%.2f SA=%.2f total=%.2f",
		session.CandidateID, sess.MCQScore, saTotal, sess.TotalScore)
}
