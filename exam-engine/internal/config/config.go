package config

import (
	"fmt"
	"net/url"
	"os"
	"runtime"
	"strconv"
	"strings"
	"time"
)

const (
	defaultInternalAPIKey = "change-me-internal-key"
	minJWTSecretLength    = 32
)

type Config struct {
	Env                string
	Port               string
	RedisAddr          string
	RedisPassword      string
	RedisPoolSize      int
	RedisMinIdle       int
	SpringBaseURL      string
	InternalApiKey     string
	JWTSecret          string
	WorkerPoolSize     int
	RateLimitRPS       int
	HeartbeatInterval  time.Duration
	HeartbeatMisses    int
	AIGradingURL       string
	AIGradingTimeout   time.Duration
	AIGradingRetries   int
	AIGradingProtocol  string // "rest" or "grpc"
	CorsAllowedOrigins string
}

func Load() *Config {
	// 0 = autosize to NumCPU*2 (sensible for I/O-bound AI grading calls)
	pool := getEnvInt("WORKER_POOL_SIZE", 0)
	if pool <= 0 {
		pool = runtime.NumCPU() * 2
	}
	return &Config{
		Env:                getEnv("ENV", "dev"),
		Port:               getEnv("PORT", "8090"),
		RedisAddr:          getEnv("REDIS_ADDR", "localhost:6379"),
		RedisPassword:      getEnv("REDIS_PASSWORD", ""),
		RedisPoolSize:      getEnvInt("REDIS_POOL_SIZE", 20),
		RedisMinIdle:       getEnvInt("REDIS_MIN_IDLE", 5),
		SpringBaseURL:      getEnv("SPRING_BASE_URL", "http://localhost:8080"),
		InternalApiKey:     getEnv("INTERNAL_API_KEY", defaultInternalAPIKey),
		JWTSecret:          os.Getenv("JWT_SECRET"),
		WorkerPoolSize:     pool,
		RateLimitRPS:       getEnvInt("RATE_LIMIT_RPS", 10),
		HeartbeatInterval:  getEnvDuration("HEARTBEAT_INTERVAL", 10*time.Second),
		HeartbeatMisses:    getEnvInt("HEARTBEAT_MISSES", 3),
		AIGradingURL:       getEnv("AI_GRADING_URL", "http://localhost:8000"),
		AIGradingTimeout:   getEnvDuration("AI_GRADING_TIMEOUT", 10*time.Second),
		AIGradingRetries:   getEnvInt("AI_GRADING_RETRIES", 3),
		AIGradingProtocol:  getEnv("AI_GRADING_PROTOCOL", "rest"),
		CorsAllowedOrigins: getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:3000"),
	}
}

// Validate fails fast on misconfiguration. Called at startup so misconfigured
// deploys crash immediately instead of surprising us at first request.
func (c *Config) Validate() error {
	var errs []string

	if len(c.JWTSecret) < minJWTSecretLength {
		errs = append(errs, fmt.Sprintf("JWT_SECRET must be set and at least %d chars (got %d)",
			minJWTSecretLength, len(c.JWTSecret)))
	}

	if c.Env != "dev" && c.InternalApiKey == defaultInternalAPIKey {
		errs = append(errs, "INTERNAL_API_KEY must be set to a non-default value when ENV != dev")
	}
	if len(c.InternalApiKey) < 16 {
		errs = append(errs, "INTERNAL_API_KEY must be at least 16 chars")
	}

	if _, err := url.Parse(c.AIGradingURL); err != nil || !strings.HasPrefix(c.AIGradingURL, "http") {
		errs = append(errs, fmt.Sprintf("AI_GRADING_URL invalid: %q", c.AIGradingURL))
	}
	if _, err := url.Parse(c.SpringBaseURL); err != nil || !strings.HasPrefix(c.SpringBaseURL, "http") {
		errs = append(errs, fmt.Sprintf("SPRING_BASE_URL invalid: %q", c.SpringBaseURL))
	}

	if c.WorkerPoolSize <= 0 {
		errs = append(errs, fmt.Sprintf("WORKER_POOL_SIZE must be > 0 (got %d)", c.WorkerPoolSize))
	}
	if c.RateLimitRPS <= 0 {
		errs = append(errs, fmt.Sprintf("RATE_LIMIT_RPS must be > 0 (got %d)", c.RateLimitRPS))
	}
	if c.HeartbeatMisses <= 0 {
		errs = append(errs, fmt.Sprintf("HEARTBEAT_MISSES must be > 0 (got %d)", c.HeartbeatMisses))
	}
	if c.HeartbeatInterval <= 0 {
		errs = append(errs, fmt.Sprintf("HEARTBEAT_INTERVAL must be > 0 (got %v)", c.HeartbeatInterval))
	}
	if c.AIGradingProtocol != "rest" && c.AIGradingProtocol != "grpc" {
		errs = append(errs, fmt.Sprintf("AI_GRADING_PROTOCOL must be rest|grpc (got %q)", c.AIGradingProtocol))
	}

	if len(errs) > 0 {
		return fmt.Errorf("config validation failed:\n  - %s", strings.Join(errs, "\n  - "))
	}
	return nil
}

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func getEnvInt(key string, def int) int {
	if v := os.Getenv(key); v != "" {
		if i, err := strconv.Atoi(v); err == nil {
			return i
		}
	}
	return def
}

func getEnvDuration(key string, def time.Duration) time.Duration {
	if v := os.Getenv(key); v != "" {
		if d, err := time.ParseDuration(v); err == nil {
			return d
		}
	}
	return def
}
