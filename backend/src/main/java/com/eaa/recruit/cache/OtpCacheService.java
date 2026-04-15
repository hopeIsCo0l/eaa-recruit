package com.eaa.recruit.cache;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.Optional;

/**
 * Manages OTP lifecycle in Redis.
 *
 * Key schema : otp:<identifier>   (identifier = email or phone)
 * TTL        : configurable via otp.ttl-seconds (default 5 min)
 *
 * Graceful degradation: Redis failures are caught, logged, and surfaced
 * as empty Optional / false rather than propagating up to the caller.
 * The registration flow can decide whether to retry or fail fast.
 */
@Service
public class OtpCacheService {

    private static final Logger log = LoggerFactory.getLogger(OtpCacheService.class);

    private final StringRedisTemplate redis;
    private final OtpProperties props;
    private final SecureRandom secureRandom = new SecureRandom();

    public OtpCacheService(StringRedisTemplate redis, OtpProperties props) {
        this.redis = redis;
        this.props = props;
    }

    /**
     * Generates a random OTP, stores it in Redis with TTL, and returns the value.
     *
     * @param identifier unique key (e.g. email address)
     * @return the generated OTP, or empty if Redis is unavailable
     */
    public Optional<String> generateAndStore(String identifier) {
        String otp = generateOtp();
        String key = buildKey(identifier);
        Duration ttl = Duration.ofSeconds(props.getTtlSeconds());

        try {
            redis.opsForValue().set(key, otp, ttl);
            log.debug("OTP stored for identifier='{}' ttl={}s", identifier, props.getTtlSeconds());
            return Optional.of(otp);
        } catch (DataAccessException ex) {
            log.error("Redis unavailable — could not store OTP for identifier='{}': {}",
                    identifier, ex.getMessage(), ex);
            return Optional.empty();
        }
    }

    /**
     * Validates the supplied OTP against the stored value.
     * Deletes the key on match (single-use enforcement).
     *
     * @return true if match, false if mismatch, expired, or Redis unavailable
     */
    public boolean validateAndConsume(String identifier, String candidateOtp) {
        String key = buildKey(identifier);

        try {
            String stored = redis.opsForValue().get(key);
            if (stored == null) {
                log.debug("OTP not found or expired for identifier='{}'", identifier);
                return false;
            }
            if (!stored.equals(candidateOtp)) {
                log.debug("OTP mismatch for identifier='{}'", identifier);
                return false;
            }
            redis.delete(key);
            log.debug("OTP validated and consumed for identifier='{}'", identifier);
            return true;
        } catch (DataAccessException ex) {
            log.error("Redis unavailable — could not validate OTP for identifier='{}': {}",
                    identifier, ex.getMessage(), ex);
            return false;
        }
    }

    /**
     * Explicitly invalidates an OTP (e.g. on max-attempts exceeded).
     */
    public void invalidate(String identifier) {
        try {
            redis.delete(buildKey(identifier));
        } catch (DataAccessException ex) {
            log.warn("Redis unavailable — could not invalidate OTP for identifier='{}': {}",
                    identifier, ex.getMessage());
        }
    }

    /**
     * Returns the remaining TTL in seconds.
     * -2 = key does not exist, -1 = no expiry set, empty = Redis unavailable.
     */
    public Optional<Long> getRemainingTtl(String identifier) {
        try {
            Long seconds = redis.getExpire(buildKey(identifier));
            return Optional.ofNullable(seconds);
        } catch (DataAccessException ex) {
            log.warn("Redis unavailable — could not get TTL for identifier='{}'", identifier);
            return Optional.empty();
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private String buildKey(String identifier) {
        return props.getKeyPrefix() + identifier;
    }

    private String generateOtp() {
        int max = (int) Math.pow(10, props.getLength());
        int value = secureRandom.nextInt(max);
        return String.format("%0" + props.getLength() + "d", value);
    }
}
