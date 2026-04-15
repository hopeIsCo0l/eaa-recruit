package com.eaa.recruit.otp;

import com.eaa.recruit.cache.OtpCacheService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Orchestrates the full OTP lifecycle:
 *   1. generate + store in Redis (via OtpCacheService)
 *   2. dispatch to user (via OtpNotificationPort)
 *   3. verify submission and return a typed result
 *
 * Uses OtpCacheService's getRemainingTtl to distinguish "expired"
 * from "never existed / already consumed" for a clearer UX message.
 */
@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);

    private final OtpCacheService otpCacheService;
    private final OtpNotificationPort notificationPort;
    private final StringRedisTemplate redis;
    private final com.eaa.recruit.cache.OtpProperties props;

    public OtpService(OtpCacheService otpCacheService,
                      OtpNotificationPort notificationPort,
                      StringRedisTemplate redis,
                      com.eaa.recruit.cache.OtpProperties props) {
        this.otpCacheService  = otpCacheService;
        this.notificationPort = notificationPort;
        this.redis            = redis;
        this.props            = props;
    }

    /**
     * Generates, stores, and dispatches a new OTP to the given recipient.
     *
     * @param recipient email or phone — used as the Redis key and delivery address
     * @return true if the OTP was stored and dispatched successfully
     */
    public boolean sendOtp(String recipient) {
        Optional<String> otp = otpCacheService.generateAndStore(recipient);

        if (otp.isEmpty()) {
            log.error("OTP generation failed for recipient='{}' — Redis may be unavailable", recipient);
            return false;
        }

        try {
            notificationPort.send(recipient, otp.get());
        } catch (Exception ex) {
            // Notification failure should not block the flow — OTP is stored,
            // user can request resend. Log and continue.
            log.error("OTP notification failed for recipient='{}': {}", recipient, ex.getMessage(), ex);
        }

        return true;
    }

    /**
     * Verifies a submitted OTP against the stored value.
     *
     * Returns a typed {@link OtpVerificationResult} distinguishing:
     * - Success        — code matched and was consumed
     * - Expired        — key existed before TTL but is now gone (inferred via TTL check)
     * - Invalid        — key present but code wrong
     * - ServiceUnavailable — Redis unavailable
     */
    public OtpVerificationResult verify(String recipient, String submittedOtp) {
        // Peek at TTL to differentiate expired vs never-sent / already-consumed
        Optional<Long> ttl = otpCacheService.getRemainingTtl(recipient);

        if (ttl.isEmpty()) {
            return new OtpVerificationResult.ServiceUnavailable();
        }

        // -2 means the key doesn't exist (expired or never set)
        if (ttl.get() == -2L) {
            log.debug("OTP key missing for recipient='{}' — likely expired or already used", recipient);
            return new OtpVerificationResult.Expired();
        }

        boolean matched = otpCacheService.validateAndConsume(recipient, submittedOtp);

        if (matched) {
            log.info("OTP verified successfully for recipient='{}'", recipient);
            return new OtpVerificationResult.Success();
        } else {
            log.debug("OTP mismatch for recipient='{}'", recipient);
            return new OtpVerificationResult.Invalid();
        }
    }

    /**
     * Resends OTP — invalidates any existing code and issues a fresh one.
     */
    public boolean resendOtp(String recipient) {
        otpCacheService.invalidate(recipient);
        return sendOtp(recipient);
    }
}
