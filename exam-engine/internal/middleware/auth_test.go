package middleware_test

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/EAA-recruit/exam-engine/internal/middleware"
	"github.com/gin-gonic/gin"
)

const testSecret = "test-secret-key-that-is-long-enough"

func signed(payload map[string]any, secret string) string {
	header := base64.RawURLEncoding.EncodeToString([]byte(`{"alg":"HS256","typ":"JWT"}`))
	body, _ := json.Marshal(payload)
	encoded := base64.RawURLEncoding.EncodeToString(body)
	signingInput := header + "." + encoded
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(signingInput))
	sig := base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
	return fmt.Sprintf("%s.%s.%s", header, encoded, sig)
}

func TestJWTAuth_ValidToken(t *testing.T) {
	t.Setenv("JWT_SECRET", testSecret)
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.GET("/test", middleware.JWTAuth(), func(c *gin.Context) {
		cid := c.GetString(middleware.CandidateIDKey)
		jid := c.GetString(middleware.JobIDKey)
		c.JSON(http.StatusOK, gin.H{"candidateID": cid, "jobID": jid})
	})

	token := signed(map[string]any{"sub": "user-123", "jobId": "job-456"}, testSecret)
	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}
	if !strings.Contains(w.Body.String(), "user-123") {
		t.Error("expected candidateID in response")
	}
}

func TestJWTAuth_BadSignature(t *testing.T) {
	t.Setenv("JWT_SECRET", testSecret)
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.GET("/test", middleware.JWTAuth(), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{})
	})

	token := signed(map[string]any{"sub": "u", "jobId": "j"}, "wrong-secret")
	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected 401 for bad signature, got %d", w.Code)
	}
}

func TestJWTAuth_JobIdFromQuery(t *testing.T) {
	t.Setenv("JWT_SECRET", testSecret)
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.GET("/test", middleware.JWTAuth(), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"jobID": c.GetString(middleware.JobIDKey)})
	})

	token := signed(map[string]any{"sub": "user-1"}, testSecret) // no jobId in claims
	req := httptest.NewRequest(http.MethodGet, "/test?jobId=job-99", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}
	if !strings.Contains(w.Body.String(), "job-99") {
		t.Error("expected jobId from query string")
	}
}

func TestJWTAuth_MissingHeader(t *testing.T) {
	t.Setenv("JWT_SECRET", testSecret)
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.GET("/test", middleware.JWTAuth(), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{})
	})

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected 401, got %d", w.Code)
	}
}

func TestJWTAuth_InvalidFormat(t *testing.T) {
	t.Setenv("JWT_SECRET", testSecret)
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.GET("/test", middleware.JWTAuth(), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{})
	})

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("Authorization", "Bearer not.a.validtoken")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected 401, got %d", w.Code)
	}
}

func TestJWTAuth_MissingClaims(t *testing.T) {
	t.Setenv("JWT_SECRET", testSecret)
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.GET("/test", middleware.JWTAuth(), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{})
	})

	token := signed(map[string]any{}, testSecret)
	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected 401 for missing claims, got %d", w.Code)
	}
}
