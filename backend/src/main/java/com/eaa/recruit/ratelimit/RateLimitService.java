package com.eaa.recruit.ratelimit;

import com.eaa.recruit.exception.TooManyRequestsException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * Redis-backed fixed-window rate limiter.
 *
 * Key shape: rl:{scope}:{identifier}
 * Counter incremented per call; TTL set on first hit. When counter > max,
 * throws TooManyRequestsException with seconds remaining in the window.
 *
 * Fails open on Redis errors (logs warning) — better to serve traffic than
 * lock everyone out if the cache is unreachable.
 */
@Service
public class RateLimitService {

    private static final Logger log = LoggerFactory.getLogger(RateLimitService.class);
    private static final String KEY_PREFIX = "rl:";

    private final StringRedisTemplate redis;

    public RateLimitService(StringRedisTemplate redis) {
        this.redis = redis;
    }

    /**
     * @param scope      bucket name, e.g. "login", "otp-send"
     * @param identifier per-caller key, e.g. client IP or email
     * @param bucket     limits (max + window)
     * @throws TooManyRequestsException if quota exhausted in current window
     */
    public void check(String scope, String identifier, RateLimitProperties.Bucket bucket) {
        if (identifier == null || identifier.isBlank()) {
            return;
        }
        String key = KEY_PREFIX + scope + ":" + identifier.toLowerCase();

        try {
            Long current = redis.opsForValue().increment(key);
            if (current == null) return;

            if (current == 1L) {
                redis.expire(key, Duration.ofSeconds(bucket.getWindowSeconds()));
            }

            if (current > bucket.getMax()) {
                Long ttl = redis.getExpire(key, TimeUnit.SECONDS);
                long retry = (ttl != null && ttl > 0) ? ttl : bucket.getWindowSeconds();
                throw new TooManyRequestsException(
                        "Too many requests. Try again in " + retry + " seconds.",
                        retry);
            }
        } catch (TooManyRequestsException tmre) {
            throw tmre;
        } catch (Exception ex) {
            log.warn("Rate limit check failed for scope='{}' id='{}': {}",
                    scope, identifier, ex.getMessage());
        }
    }
}
