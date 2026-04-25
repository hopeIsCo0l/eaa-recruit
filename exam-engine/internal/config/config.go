package config

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	Port              string
	RedisAddr         string
	RedisPassword     string
	RedisPoolSize     int
	RedisMinIdle      int
	KafkaBroker       string
	SpringBaseURL     string
	WorkerPoolSize    int
	RateLimitRPS      int
	HeartbeatInterval time.Duration
	HeartbeatMisses   int
	AIGradingURL      string
	AIGradingTimeout  time.Duration
	AIGradingRetries  int
	AIGradingProtocol string // "rest" or "grpc"
	JwtPublicKeyPEM   string // PEM-encoded RSA public key from Spring Boot (JWT_PUBLIC_KEY_PEM)
}

func Load() *Config {
	return &Config{
		Port:              getEnv("PORT", "8090"),
		RedisAddr:         getEnv("REDIS_ADDR", "localhost:6379"),
		RedisPassword:     getEnv("REDIS_PASSWORD", ""),
		RedisPoolSize:     getEnvInt("REDIS_POOL_SIZE", 20),
		RedisMinIdle:      getEnvInt("REDIS_MIN_IDLE", 5),
		KafkaBroker:       getEnv("KAFKA_BROKER", "localhost:9092"),
		SpringBaseURL:     getEnv("SPRING_BASE_URL", "http://localhost:8080"),
		WorkerPoolSize:    getEnvInt("WORKER_POOL_SIZE", 10),
		RateLimitRPS:      getEnvInt("RATE_LIMIT_RPS", 10),
		HeartbeatInterval: getEnvDuration("HEARTBEAT_INTERVAL", 10*time.Second),
		HeartbeatMisses:   getEnvInt("HEARTBEAT_MISSES", 3),
		AIGradingURL:      getEnv("AI_GRADING_URL", "http://localhost:8000"),
		AIGradingTimeout:  getEnvDuration("AI_GRADING_TIMEOUT", 10*time.Second),
		AIGradingRetries:  getEnvInt("AI_GRADING_RETRIES", 3),
		AIGradingProtocol: getEnv("AI_GRADING_PROTOCOL", "rest"),
		JwtPublicKeyPEM:   getEnv("JWT_PUBLIC_KEY_PEM", ""),
	}
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
