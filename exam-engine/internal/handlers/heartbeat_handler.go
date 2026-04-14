package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/EAA-recruit/exam-engine/internal/domain"
	"github.com/EAA-recruit/exam-engine/internal/middleware"
	"github.com/EAA-recruit/exam-engine/internal/services"
	"github.com/gin-gonic/gin"
)

// HeartbeatHandler serves POST /exam/heartbeat (FR-48).
type HeartbeatHandler struct {
	sessionSvc *services.SessionService
}

func NewHeartbeatHandler(ss *services.SessionService) *HeartbeatHandler {
	return &HeartbeatHandler{sessionSvc: ss}
}

func (h *HeartbeatHandler) Heartbeat(c *gin.Context) {
	ctx := context.Background()
	candidateID := c.GetString(middleware.CandidateIDKey)
	jobID := c.GetString(middleware.JobIDKey)

	session, err := h.sessionSvc.Get(ctx, candidateID, jobID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "session not found"})
		return
	}

	if session.Status == domain.StatusSubmitted {
		c.JSON(http.StatusOK, gin.H{"status": "success", "message": "exam already submitted"})
		return
	}

	session.LastSeenAt = time.Now()
	session.MissedHeartbeats = 0
	if session.Status == domain.StatusDisconnected {
		session.Status = domain.StatusActive
	}

	ttl := time.Duration(session.TimeRemaining+600) * time.Second
	if err := h.sessionSvc.Update(ctx, session, ttl); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "failed to update session"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   gin.H{"timeRemaining": session.TimeRemaining},
	})
}
