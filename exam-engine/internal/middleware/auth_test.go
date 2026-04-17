package middleware_test

import (
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

func makeToken(sub, jobID string) string {
	header := base64.RawURLEncoding.EncodeToString([]byte(`{"alg":"HS256","typ":"JWT"}`))
	payload, _ := json.Marshal(map[string]string{"sub": sub, "jobId": jobID})
	encoded := base64.RawURLEncoding.EncodeToString(payload)
	sig := base64.RawURLEncoding.EncodeToString([]byte("sig"))
	return fmt.Sprintf("%s.%s.%s", header, encoded, sig)
}

func TestJWTAuth_ValidToken(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.GET("/test", middleware.JWTAuth(), func(c *gin.Context) {
		cid := c.GetString(middleware.CandidateIDKey)
		jid := c.GetString(middleware.JobIDKey)
		c.JSON(http.StatusOK, gin.H{"candidateID": cid, "jobID": jid})
	})

	token := makeToken("user-123", "job-456")
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

func TestJWTAuth_MissingHeader(t *testing.T) {
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
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.GET("/test", middleware.JWTAuth(), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{})
	})

	// Token with no sub or jobId
	header := base64.RawURLEncoding.EncodeToString([]byte(`{"alg":"HS256"}`))
	payload := base64.RawURLEncoding.EncodeToString([]byte(`{}`))
	sig := base64.RawURLEncoding.EncodeToString([]byte("sig"))
	token := fmt.Sprintf("%s.%s.%s", header, payload, sig)

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected 401 for missing claims, got %d", w.Code)
	}
}
