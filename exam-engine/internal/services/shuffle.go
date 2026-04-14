package services

import (
	"math/rand"

	"github.com/EAA-recruit/exam-engine/internal/domain"
)

// ShuffleQuestions returns a deterministically shuffled slice of question IDs
// seeded by candidateID (FR-50). Same candidate always gets the same order on resume.
// The master question list in cache is never modified.
func ShuffleQuestions(questions []domain.Question, candidateID string) []string {
	ids := make([]string, len(questions))
	for i, q := range questions {
		ids[i] = q.ID
	}

	// Hash candidateID to a stable int64 seed
	var seed int64
	for _, c := range candidateID {
		seed = seed*31 + int64(c)
	}

	r := rand.New(rand.NewSource(seed)) //nolint:gosec // deterministic, not security-sensitive
	r.Shuffle(len(ids), func(i, j int) {
		ids[i], ids[j] = ids[j], ids[i]
	})
	return ids
}
