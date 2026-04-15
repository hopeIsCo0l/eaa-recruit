package com.eaa.recruit.cache;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OtpCacheServiceTest {

    @Mock StringRedisTemplate redis;
    @Mock ValueOperations<String, String> valueOps;

    OtpCacheService service;

    @BeforeEach
    void setUp() {
        OtpProperties props = new OtpProperties();
        props.setTtlSeconds(300);
        props.setLength(6);
        props.setKeyPrefix("otp:");
        when(redis.opsForValue()).thenReturn(valueOps);
        service = new OtpCacheService(redis, props);
    }

    // ── generateAndStore ─────────────────────────────────────────────────────

    @Test
    void generateAndStore_returnsOtp_andStoresWithTtl() {
        Optional<String> result = service.generateAndStore("alice@example.com");

        assertThat(result).isPresent();
        assertThat(result.get()).matches("\\d{6}");
        verify(valueOps).set(eq("otp:alice@example.com"), eq(result.get()),
                eq(Duration.ofSeconds(300)));
    }

    @Test
    void generateAndStore_returnsEmpty_whenRedisDown() {
        doThrow(new DataAccessResourceFailureException("Redis down"))
                .when(valueOps).set(anyString(), anyString(), any(Duration.class));

        Optional<String> result = service.generateAndStore("alice@example.com");

        assertThat(result).isEmpty();
    }

    // ── validateAndConsume ───────────────────────────────────────────────────

    @Test
    void validateAndConsume_returnsTrue_andDeletesKey_onMatch() {
        when(valueOps.get("otp:bob@example.com")).thenReturn("123456");

        boolean valid = service.validateAndConsume("bob@example.com", "123456");

        assertThat(valid).isTrue();
        verify(redis).delete("otp:bob@example.com");
    }

    @Test
    void validateAndConsume_returnsFalse_onMismatch() {
        when(valueOps.get("otp:bob@example.com")).thenReturn("999999");

        boolean valid = service.validateAndConsume("bob@example.com", "123456");

        assertThat(valid).isFalse();
        verify(redis, never()).delete(anyString());
    }

    @Test
    void validateAndConsume_returnsFalse_whenKeyExpiredOrMissing() {
        when(valueOps.get("otp:bob@example.com")).thenReturn(null);

        boolean valid = service.validateAndConsume("bob@example.com", "123456");

        assertThat(valid).isFalse();
    }

    @Test
    void validateAndConsume_returnsFalse_whenRedisDown() {
        when(valueOps.get(anyString()))
                .thenThrow(new DataAccessResourceFailureException("Redis down"));

        boolean valid = service.validateAndConsume("bob@example.com", "123456");

        assertThat(valid).isFalse();
    }

    // ── invalidate ───────────────────────────────────────────────────────────

    @Test
    void invalidate_deletesKey() {
        service.invalidate("carol@example.com");
        verify(redis).delete("otp:carol@example.com");
    }

    @Test
    void invalidate_doesNotThrow_whenRedisDown() {
        doThrow(new DataAccessResourceFailureException("Redis down"))
                .when(redis).delete(anyString());

        // must not propagate
        service.invalidate("carol@example.com");
    }

    // ── OTP format ───────────────────────────────────────────────────────────

    @Test
    void generatedOtp_isAlwaysSixDigits() {
        for (int i = 0; i < 20; i++) {
            Optional<String> otp = service.generateAndStore("x@x.com");
            assertThat(otp).isPresent();
            assertThat(otp.get()).hasSize(6).matches("\\d{6}");
        }
    }

    // ── getRemainingTtl ──────────────────────────────────────────────────────

    @Test
    void getRemainingTtl_returnsSeconds_whenKeyExists() {
        when(redis.getExpire("otp:x@x.com")).thenReturn(180L);

        Optional<Long> ttl = service.getRemainingTtl("x@x.com");

        assertThat(ttl).hasValue(180L);
    }

    @Test
    void getRemainingTtl_returnsEmpty_whenRedisDown() {
        when(redis.getExpire(anyString()))
                .thenThrow(new DataAccessResourceFailureException("Redis down"));

        assertThat(service.getRemainingTtl("x@x.com")).isEmpty();
    }
}
