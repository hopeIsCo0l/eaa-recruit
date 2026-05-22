package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// CORS handles preflight + sets ACAO/ACAH/ACAM headers for allowed origins.
// originsCSV is comma-separated. "*" allows any origin (no credentials).
func CORS(originsCSV string) gin.HandlerFunc {
	allowed := map[string]bool{}
	for _, o := range strings.Split(originsCSV, ",") {
		o = strings.TrimSpace(o)
		if o != "" {
			allowed[o] = true
		}
	}
	any := allowed["*"]

	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		if origin != "" && (any || allowed[origin]) {
			if any {
				c.Header("Access-Control-Allow-Origin", "*")
			} else {
				c.Header("Access-Control-Allow-Origin", origin)
				c.Header("Vary", "Origin")
				c.Header("Access-Control-Allow-Credentials", "true")
			}
			c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
			c.Header("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Internal-Api-Key")
			c.Header("Access-Control-Max-Age", "3600")
		}

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}
