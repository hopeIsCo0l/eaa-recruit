package handlers

import (
	"fmt"
	"runtime"
	"sync/atomic"
	"time"

	"github.com/gin-gonic/gin"
)

// Tiny Prometheus text-format /metrics endpoint. Avoids the prom client dep.
// Exposes process uptime, goroutines, memory, plus a few counters that the
// rest of the app increments directly.
var (
	httpRequestsTotal  atomic.Int64
	gradingTasksTotal  atomic.Int64
	gradingFailedTotal atomic.Int64
	startedAt          = time.Now()
)

// IncHTTPRequests is called from a gin middleware below.
func IncHTTPRequests()  { httpRequestsTotal.Add(1) }
func IncGradingTasks()  { gradingTasksTotal.Add(1) }
func IncGradingFailed() { gradingFailedTotal.Add(1) }

// MetricsCounter increments httpRequestsTotal for every request.
func MetricsCounter() gin.HandlerFunc {
	return func(c *gin.Context) {
		IncHTTPRequests()
		c.Next()
	}
}

func Metrics(c *gin.Context) {
	var ms runtime.MemStats
	runtime.ReadMemStats(&ms)
	uptime := time.Since(startedAt).Seconds()

	c.Header("Content-Type", "text/plain; version=0.0.4")
	body := fmt.Sprintf(
		"# HELP exam_engine_uptime_seconds Process uptime in seconds.\n"+
			"# TYPE exam_engine_uptime_seconds counter\n"+
			"exam_engine_uptime_seconds %.0f\n"+
			"# HELP exam_engine_goroutines Number of active goroutines.\n"+
			"# TYPE exam_engine_goroutines gauge\n"+
			"exam_engine_goroutines %d\n"+
			"# HELP exam_engine_alloc_bytes Heap bytes currently allocated.\n"+
			"# TYPE exam_engine_alloc_bytes gauge\n"+
			"exam_engine_alloc_bytes %d\n"+
			"# HELP exam_engine_http_requests_total Total HTTP requests served.\n"+
			"# TYPE exam_engine_http_requests_total counter\n"+
			"exam_engine_http_requests_total %d\n"+
			"# HELP exam_engine_grading_tasks_total Grading tasks dispatched.\n"+
			"# TYPE exam_engine_grading_tasks_total counter\n"+
			"exam_engine_grading_tasks_total %d\n"+
			"# HELP exam_engine_grading_failed_total Grading tasks that returned an error.\n"+
			"# TYPE exam_engine_grading_failed_total counter\n"+
			"exam_engine_grading_failed_total %d\n",
		uptime,
		runtime.NumGoroutine(),
		ms.Alloc,
		httpRequestsTotal.Load(),
		gradingTasksTotal.Load(),
		gradingFailedTotal.Load(),
	)
	c.String(200, body)
}
