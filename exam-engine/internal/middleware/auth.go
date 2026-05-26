package middleware

import (
	"crypto/hmac"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"hash"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

const (
	CandidateIDKey = "candidateID"
	JobIDKey       = "jobID"
)

// JWTAuth verifies the HS256 signature of a Bearer token using the shared
// Spring secret, then extracts candidateId + jobId claims. jobId may also be
// supplied as a ?jobId= query parameter for tokens issued by Spring's default
// login flow which does not embed the exam batch ID.
func JWTAuth(jwtSecret string) gin.HandlerFunc {
	secret := []byte(jwtSecret)
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

		claims, err := verifyAndParse(token, secret)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"status":  "error",
				"message": "invalid token: " + err.Error(),
			})
			return
		}

		candidateID := claims.candidateID()
		jobID := claims.JobID
		if jobID == "" {
			jobID = c.Query("jobId")
		}
		if candidateID == "" || jobID == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"status":  "error",
				"message": "missing candidate or job context",
			})
			return
		}

		c.Set(CandidateIDKey, candidateID)
		c.Set(JobIDKey, jobID)
		c.Next()
	}
}

type tokenClaims struct {
	Sub    string `json:"sub"`
	UserID any    `json:"userId"`
	JobID  string `json:"jobId"`
	Exp    int64  `json:"exp"`
}

func (c tokenClaims) candidateID() string {
	switch v := c.UserID.(type) {
	case string:
		if v != "" {
			return v
		}
	case float64:
		return fmt.Sprintf("%d", int64(v))
	}
	return c.Sub
}

type tokenHeader struct {
	Alg string `json:"alg"`
	Typ string `json:"typ"`
}

// verifyAndParse checks the HMAC signature (HS256 or HS512) and exp claim, then returns the claims.
func verifyAndParse(token string, secret []byte) (tokenClaims, error) {
	var claims tokenClaims

	if len(secret) == 0 {
		return claims, fmt.Errorf("server JWT secret not configured")
	}

	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return claims, fmt.Errorf("not a JWT")
	}

	headerBytes, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return claims, fmt.Errorf("bad header b64: %w", err)
	}
	var header tokenHeader
	if err := json.Unmarshal(headerBytes, &header); err != nil {
		return claims, fmt.Errorf("bad header json: %w", err)
	}

	var hashFunc func() hash.Hash
	switch header.Alg {
	case "HS256":
		hashFunc = sha256.New
	case "HS512":
		hashFunc = sha512.New
	default:
		return claims, fmt.Errorf("unsupported alg: %s", header.Alg)
	}

	signingInput := parts[0] + "." + parts[1]
	mac := hmac.New(hashFunc, secret)
	mac.Write([]byte(signingInput))
	expected := mac.Sum(nil)

	provided, err := base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil {
		return claims, fmt.Errorf("bad signature b64: %w", err)
	}
	if !hmac.Equal(expected, provided) {
		return claims, fmt.Errorf("signature mismatch")
	}

	payloadBytes, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return claims, fmt.Errorf("bad payload b64: %w", err)
	}
	if err := json.Unmarshal(payloadBytes, &claims); err != nil {
		return claims, fmt.Errorf("bad payload json: %w", err)
	}
	if claims.Exp > 0 && time.Now().Unix() >= claims.Exp {
		return claims, fmt.Errorf("token expired")
	}
	return claims, nil
}
