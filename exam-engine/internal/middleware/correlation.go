package middleware

import (
	"crypto/rand"
	"fmt"
	"log/slog"
	"time"

	"github.com/gin-gonic/gin"
)

const (
	CorrelationIDKey    = "correlationId"
	correlationIDHeader = "X-Correlation-ID"
)

// CorrelationID reads or generates X-Correlation-ID, stores it in the gin
// context, echoes it in the response header, and emits a structured request log.
func CorrelationID() gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.GetHeader(correlationIDHeader)
		if id == "" {
			id = newID()
		}
		c.Set(CorrelationIDKey, id)
		c.Header(correlationIDHeader, id)

		start := time.Now()
		c.Next()

		slog.Info("request",
			"correlationId", id,
			"method", c.Request.Method,
			"path", c.FullPath(),
			"status", c.Writer.Status(),
			"latencyMs", time.Since(start).Milliseconds(),
		)
	}
}

func newID() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return fmt.Sprintf("%08x-%04x-%04x-%04x-%012x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:])
}
