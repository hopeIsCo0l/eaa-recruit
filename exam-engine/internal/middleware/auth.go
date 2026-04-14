package middleware

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

const (
	CandidateIDKey = "candidateID"
	JobIDKey       = "jobID"
)

// JWTAuth extracts candidateId and jobId from a Bearer JWT issued by Spring Boot.
// TODO: verify signature with Spring Boot's public key before production deploy.
func JWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"status":  "error",
				"message": "missing or malformed Authorization header",
			})
			return
		}
		token := strings.TrimPrefix(authHeader, "Bearer ")
		candidateID, jobID, err := parseToken(token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"status":  "error",
				"message": "invalid token",
			})
			return
		}
		c.Set(CandidateIDKey, candidateID)
		c.Set(JobIDKey, jobID)
		c.Next()
	}
}

// parseToken base64-decodes the JWT payload and extracts sub (candidateId) and jobId claims.
func parseToken(token string) (candidateID, jobID string, err error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return "", "", fmt.Errorf("invalid JWT format")
	}
	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return "", "", fmt.Errorf("decode payload: %w", err)
	}
	var claims struct {
		Sub   string `json:"sub"`
		JobID string `json:"jobId"`
	}
	if err := json.Unmarshal(payload, &claims); err != nil {
		return "", "", fmt.Errorf("unmarshal claims: %w", err)
	}
	if claims.Sub == "" || claims.JobID == "" {
		return "", "", fmt.Errorf("missing sub or jobId claim")
	}
	return claims.Sub, claims.JobID, nil
}
