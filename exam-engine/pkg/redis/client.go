package redis

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/EAA-recruit/exam-engine/internal/config"
	"github.com/redis/go-redis/v9"
)

// NewClient initializes a Redis client with connection pooling and blocks startup
// if Redis is unreachable (FR-44).
func NewClient(cfg *config.Config) *redis.Client {
	client := redis.NewClient(&redis.Options{
		Addr:         cfg.RedisAddr,
		Password:     cfg.RedisPassword,
		PoolSize:     cfg.RedisPoolSize,
		MinIdleConns: cfg.RedisMinIdle,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		log.Fatalf("Redis unreachable at %s: %v", cfg.RedisAddr, err)
	}
	log.Printf("Redis connected: %s (pool=%d, minIdle=%d)", cfg.RedisAddr, cfg.RedisPoolSize, cfg.RedisMinIdle)
	return client
}

func SetJSON(ctx context.Context, rdb *redis.Client, key string, value []byte, ttl time.Duration) error {
	if err := rdb.Set(ctx, key, value, ttl).Err(); err != nil {
		return fmt.Errorf("redis SET %s: %w", key, err)
	}
	return nil
}

func GetJSON(ctx context.Context, rdb *redis.Client, key string) ([]byte, error) {
	val, err := rdb.Get(ctx, key).Bytes()
	if err != nil {
		return nil, fmt.Errorf("redis GET %s: %w", key, err)
	}
	return val, nil
}

func Del(ctx context.Context, rdb *redis.Client, keys ...string) error {
	return rdb.Del(ctx, keys...).Err()
}
