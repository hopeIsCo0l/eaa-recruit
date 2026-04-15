package com.eaa.recruit.cache;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import redis.embedded.RedisServer;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration test against a real embedded Redis.
 * Verifies OTP store/validate round-trip and TTL enforcement.
 */
@SpringBootTest
@ActiveProfiles("test")
class OtpCacheIntegrationTest {

    private static RedisServer redisServer;
    private static int redisPort;

    @BeforeAll
    static void startRedis() throws Exception {
        redisPort = findFreePort();
        redisServer = new RedisServer(redisPort);
        redisServer.start();
    }

    @AfterAll
    static void stopRedis() throws Exception {
        if (redisServer != null && redisServer.isActive()) {
            redisServer.stop();
        }
    }

    @DynamicPropertySource
    static void redisProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.data.redis.host", () -> "127.0.0.1");
        registry.add("spring.data.redis.port", () -> redisPort);
        registry.add("otp.ttl-seconds", () -> "2"); // short TTL for expiry test
    }

    @Autowired OtpCacheService otpCacheService;

    @Test
    void storeAndValidateOtp_roundTrip() {
        Optional<String> otp = otpCacheService.generateAndStore("test@example.com");

        assertThat(otp).isPresent();
        assertThat(otpCacheService.validateAndConsume("test@example.com", otp.get())).isTrue();
        // key deleted after consume — second attempt fails
        assertThat(otpCacheService.validateAndConsume("test@example.com", otp.get())).isFalse();
    }

    @Test
    void expiredOtp_isRejected() throws InterruptedException {
        Optional<String> otp = otpCacheService.generateAndStore("expire@example.com");
        assertThat(otp).isPresent();

        // Wait for TTL=2s to expire
        Thread.sleep(3_000);

        assertThat(otpCacheService.validateAndConsume("expire@example.com", otp.get())).isFalse();
    }

    @Test
    void remainingTtl_isPositiveRightAfterStore() {
        otpCacheService.generateAndStore("ttl@example.com");
        Optional<Long> ttl = otpCacheService.getRemainingTtl("ttl@example.com");

        assertThat(ttl).isPresent();
        assertThat(ttl.get()).isGreaterThan(0L);
    }

    @Test
    void invalidate_removesKey() {
        otpCacheService.generateAndStore("invalidate@example.com");
        otpCacheService.invalidate("invalidate@example.com");

        assertThat(otpCacheService.validateAndConsume("invalidate@example.com", "000000")).isFalse();
    }

    // ── utility ──────────────────────────────────────────────────────────────

    private static int findFreePort() throws Exception {
        try (java.net.ServerSocket socket = new java.net.ServerSocket(0)) {
            return socket.getLocalPort();
        }
    }
}
