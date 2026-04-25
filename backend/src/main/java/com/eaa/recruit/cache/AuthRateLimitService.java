package com.eaa.recruit.cache;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Redis sliding-window rate limiter for auth endpoints.
 *
 * Key schema : rl:{ip}:{endpoint-bucket}
 * Window     : 60 seconds
 * Limits     : 10 req/min for /login; 5 req/min for all other auth endpoints
 *
 * Fails open (returns false) when Redis is unavailable to avoid blocking users
 * during infrastructure issues.
 */
@Service
public class AuthRateLimitService {

    private static final Logger   log    = LoggerFactory.getLogger(AuthRateLimitService.class);
    private static final String   PREFIX = "rl:";
    private static final Duration WINDOW = Duration.ofMinutes(1);

    private static final int LIMIT_LOGIN   = 10;
    private static final int LIMIT_DEFAULT = 5;

    private final StringRedisTemplate redis;

    public AuthRateLimitService(StringRedisTemplate redis) {
        this.redis = redis;
    }

    /**
     * Returns true if the IP has exceeded the per-endpoint rate limit.
     *
     * @param ip   client IP address
     * @param path request URI (used to determine the limit bucket)
     */
    public boolean isRateLimited(String ip, String path) {
        try {
            String key   = PREFIX + ip + ":" + bucket(path);
            Long   count = redis.opsForValue().increment(key);
            if (count != null && count == 1L) {
                redis.expire(key, WINDOW);
            }
            int limit = path.contains("/login") ? LIMIT_LOGIN : LIMIT_DEFAULT;
            return count != null && count > limit;
        } catch (DataAccessException ex) {
            log.warn("Redis unavailable for rate-limit check ip={} path={} — failing open", ip, path);
            return false;
        }
    }

    private static String bucket(String path) {
        int q     = path.indexOf('?');
        String p  = q >= 0 ? path.substring(0, q) : path;
        int slash = p.lastIndexOf('/');
        return slash >= 0 ? p.substring(slash + 1) : p;
    }
}
