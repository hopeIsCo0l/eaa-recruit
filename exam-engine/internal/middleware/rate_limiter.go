package middleware

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/EAA-recruit/exam-engine/internal/config"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

// RateLimiter enforces per-candidate (or per-IP fallback) request rate limiting
// using Redis sliding counters (FR-45). Does not apply to /health.
func RateLimiter(rdb *redis.Client, cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		var key string
		if candidateID, exists := c.Get(CandidateIDKey); exists {
			key = fmt.Sprintf("ratelimit:candidate:%s", candidateID)
		} else {
			key = fmt.Sprintf("ratelimit:ip:%s", c.ClientIP())
		}

		ctx := context.Background()
		pipe := rdb.Pipeline()
		incr := pipe.Incr(ctx, key)
		pipe.Expire(ctx, key, time.Second)
		if _, err := pipe.Exec(ctx); err != nil {
			// Redis error — fail open to avoid blocking candidates
			c.Next()
			return
		}

		if incr.Val() > int64(cfg.RateLimitRPS) {
			c.Header("Retry-After", "1")
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"status":  "error",
				"message": "rate limit exceeded",
			})
			return
		}
		c.Next()
	}
}
