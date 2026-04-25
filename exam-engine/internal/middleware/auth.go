package middleware

import (
	"crypto/rsa"
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

const (
	CandidateIDKey = "candidateID"
	JobIDKey       = "jobID"
)

type examClaims struct {
	jwt.RegisteredClaims
	JobID  string `json:"jobId"`
	UserID int64  `json:"userId"`
}

// JWTAuth validates RS256-signed JWTs issued by Spring Boot.
// publicKey must be the RSA public key matching the Spring Boot signing key
// (fetch from GET /api/v1/auth/.well-known/jwks.json or set JWT_PUBLIC_KEY_PEM).
func JWTAuth(publicKey *rsa.PublicKey) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"status":  "error",
				"message": "missing or malformed Authorization header",
			})
			return
		}
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		candidateID, jobID, err := parseToken(tokenStr, publicKey)
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

// parseToken verifies the RS256 signature and extracts sub (candidateID) and jobId claims.
func parseToken(tokenStr string, publicKey *rsa.PublicKey) (candidateID, jobID string, err error) {
	var claims examClaims
	parsed, err := jwt.ParseWithClaims(tokenStr, &claims, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return publicKey, nil
	})
	if err != nil {
		return "", "", fmt.Errorf("parse token: %w", err)
	}
	if !parsed.Valid {
		return "", "", fmt.Errorf("token not valid")
	}
	if claims.Subject == "" || claims.JobID == "" {
		return "", "", fmt.Errorf("missing sub or jobId claim")
	}
	return claims.Subject, claims.JobID, nil
}
