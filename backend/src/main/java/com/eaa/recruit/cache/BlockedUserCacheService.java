package com.eaa.recruit.cache;

import com.eaa.recruit.security.JwtProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Tracks deactivated user IDs in Redis so that valid JWTs are immediately
 * rejected without waiting for token expiry.
 *
 * Key schema : blocked_user:{userId}
 * TTL        : jwt.expiration-ms  (key auto-evicts once no live token can exist)
 */
@Service
public class BlockedUserCacheService {

    private static final Logger log = LoggerFactory.getLogger(BlockedUserCacheService.class);
    private static final String KEY_PREFIX = "blocked_user:";

    private final StringRedisTemplate redis;
    private final JwtProperties       jwtProperties;

    public BlockedUserCacheService(StringRedisTemplate redis, JwtProperties jwtProperties) {
        this.redis         = redis;
        this.jwtProperties = jwtProperties;
    }

    /** Marks a user as blocked for the lifetime of any currently-valid JWT. */
    public void block(Long userId) {
        try {
            Duration ttl = Duration.ofMillis(jwtProperties.getExpirationMs());
            redis.opsForValue().set(KEY_PREFIX + userId, "1", ttl);
            log.info("User id={} added to blocked list (ttl={}ms)", userId, jwtProperties.getExpirationMs());
        } catch (DataAccessException ex) {
            log.error("Redis unavailable — could not block user id={}: {}", userId, ex.getMessage(), ex);
        }
    }

    /** Removes a user from the blocked list (restores access). */
    public void unblock(Long userId) {
        try {
            redis.delete(KEY_PREFIX + userId);
            log.info("User id={} removed from blocked list", userId);
        } catch (DataAccessException ex) {
            log.error("Redis unavailable — could not unblock user id={}: {}", userId, ex.getMessage(), ex);
        }
    }

    /**
     * Returns true if the user is blocked.
     * Fails open (returns false) when Redis is unavailable — existing tokens
     * remain usable rather than causing an outage. Logged as a warning.
     */
    public boolean isBlocked(Long userId) {
        try {
            return Boolean.TRUE.equals(redis.hasKey(KEY_PREFIX + userId));
        } catch (DataAccessException ex) {
            log.warn("Redis unavailable — cannot verify block status for user id={}, failing open", userId);
            return false;
        }
    }
}
