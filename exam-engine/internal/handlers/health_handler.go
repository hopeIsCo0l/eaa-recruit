package handlers

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/EAA-recruit/exam-engine/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

// HealthHandler serves GET /health — no auth required (FR-60).
type HealthHandler struct {
	rdb        *redis.Client
	sessionSvc *services.SessionService
	startTime  time.Time
}

func NewHealthHandler(rdb *redis.Client, ss *services.SessionService) *HealthHandler {
	return &HealthHandler{rdb: rdb, sessionSvc: ss, startTime: time.Now()}
}

func (h *HealthHandler) Health(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Millisecond)
	defer cancel()

	redisOK := h.rdb.Ping(ctx).Err() == nil
	activeCandidates, _ := h.sessionSvc.CountActive(ctx)
	uptime := fmt.Sprintf("%.0fs", time.Since(h.startTime).Seconds())

	status := "UP"
	code := http.StatusOK
	if !redisOK {
		status = "DEGRADED"
		code = http.StatusServiceUnavailable
	}

	c.JSON(code, gin.H{
		"status":           status,
		"redisConnected":   redisOK,
		"activeCandidates": activeCandidates,
		"uptime":           uptime,
	})
}
