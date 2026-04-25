package main

import (
	"context"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/EAA-recruit/exam-engine/internal/config"
	"github.com/EAA-recruit/exam-engine/internal/handlers"
	"github.com/EAA-recruit/exam-engine/internal/middleware"
	"github.com/EAA-recruit/exam-engine/internal/services"
	pkgkafka "github.com/EAA-recruit/exam-engine/pkg/kafka"
	pkgredis "github.com/EAA-recruit/exam-engine/pkg/redis"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()

	// ── JWT RSA public key ────────────────────────────────────────────────────────
	jwtPublicKey := mustParseRSAPublicKey(cfg.JwtPublicKeyPEM)

	// ── Infrastructure ──────────────────────────────────────────────────────────
	rdb := pkgredis.NewClient(cfg)
	rawProducer := pkgkafka.NewProducer(cfg)
	consumerGroup := pkgkafka.NewConsumerGroup(cfg, "exam-engine")

	// ── Services ─────────────────────────────────────────────────────────────────
	questionCache := services.NewQuestionCache()
	sessionSvc := services.NewSessionService(rdb)
	batchSvc := services.NewBatchService(rdb, cfg)
	aiClient := services.NewAIGradingClient(cfg)
	pool := services.NewWorkerPool(cfg.WorkerPoolSize)
	kafkaProducer := services.NewKafkaProducer(rawProducer)
	gradingSvc := services.NewGradingService(questionCache, sessionSvc, aiClient, pool, kafkaProducer)
	kafkaConsumer := services.NewKafkaConsumer(consumerGroup, questionCache, batchSvc, cfg, rawProducer)
	countdownSvc := services.NewCountdownService(sessionSvc, batchSvc, gradingSvc)

	// ── Handlers ─────────────────────────────────────────────────────────────────
	healthHandler := handlers.NewHealthHandler(rdb, sessionSvc)
	examHandler := handlers.NewExamHandler(sessionSvc, batchSvc, questionCache, gradingSvc)
	heartbeatHandler := handlers.NewHeartbeatHandler(sessionSvc)

	// ── Worker pool — wires AI client as the grading handler (FR-43, FR-56) ─────
	pool.Start(func(task services.GradingTask) {
		req := services.AIGradingRequest{
			QuestionID:      task.QuestionID,
			CandidateAnswer: task.Answer,
			JobID:           task.JobID,
		}
		score := aiClient.GradeWithRetry(context.Background(), req)
		task.Done <- score
	})

	// ── Background goroutines ─────────────────────────────────────────────────
	ctx, cancel := context.WithCancel(context.Background())
	go kafkaConsumer.Start(ctx)                                                      // FR-58
	go countdownSvc.Start(ctx)                                                       // FR-47
	go countdownSvc.CheckHeartbeats(ctx, cfg.HeartbeatMisses, cfg.HeartbeatInterval) // FR-48

	// ── Router ───────────────────────────────────────────────────────────────────
	router := gin.New()
	router.Use(gin.Logger(), gin.Recovery())

	// Unauthenticated
	router.GET("/ping", func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"message": "pong"}) })
	router.GET("/health", healthHandler.Health) // FR-60 — no auth

	// Exam routes — JWT required
	exam := router.Group("/exam", middleware.JWTAuth(jwtPublicKey))
	{
		exam.GET("/start", middleware.RateLimiter(rdb, cfg), examHandler.StartExam)             // FR-51
		exam.POST("/submit-answer", middleware.RateLimiter(rdb, cfg), examHandler.SubmitAnswer) // FR-52
		exam.GET("/resume", examHandler.ResumeExam)                                             // FR-53
		exam.POST("/heartbeat", middleware.RateLimiter(rdb, cfg), heartbeatHandler.Heartbeat)   // FR-48
	}

	// ── HTTP server with graceful shutdown ───────────────────────────────────────
	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: router,
	}

	go func() {
		log.Printf("exam engine listening on :%s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("shutting down exam engine...")

	cancel() // stop Kafka consumer, countdown, heartbeat monitor

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer shutdownCancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("HTTP server shutdown error: %v", err)
	}

	pool.Stop() // drain pending grading tasks before exit (FR-43)
	_ = rawProducer.Close()
	_ = consumerGroup.Close()
	_ = rdb.Close()
	log.Println("exam engine stopped")
}

// mustParseRSAPublicKey parses a PEM-encoded RSA public key from JWT_PUBLIC_KEY_PEM.
// Exits with a fatal log if the key is missing or malformed.
func mustParseRSAPublicKey(pemStr string) *rsa.PublicKey {
	if pemStr == "" {
		log.Fatal("JWT_PUBLIC_KEY_PEM is required — set it to the RSA public key from Spring Boot's /api/v1/auth/.well-known/jwks.json")
	}
	block, _ := pem.Decode([]byte(pemStr))
	if block == nil {
		log.Fatal("JWT_PUBLIC_KEY_PEM: failed to decode PEM block")
	}
	key, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		log.Fatalf("JWT_PUBLIC_KEY_PEM: failed to parse public key: %v", err)
	}
	rsaKey, ok := key.(*rsa.PublicKey)
	if !ok {
		log.Fatal("JWT_PUBLIC_KEY_PEM: key is not RSA")
	}
	return rsaKey
}
