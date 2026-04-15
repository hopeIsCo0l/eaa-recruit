package com.eaa.recruit.otp;

import com.eaa.recruit.cache.OtpCacheService;
import com.eaa.recruit.cache.OtpProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OtpServiceTest {

    @Mock OtpCacheService otpCacheService;
    @Mock OtpNotificationPort notificationPort;
    @Mock StringRedisTemplate redis;

    OtpService otpService;

    @BeforeEach
    void setUp() {
        OtpProperties props = new OtpProperties();
        props.setTtlSeconds(300);
        props.setLength(6);
        props.setKeyPrefix("otp:");
        otpService = new OtpService(otpCacheService, notificationPort, redis, props);
    }

    // ── sendOtp ──────────────────────────────────────────────────────────────

    @Test
    void sendOtp_storesAndNotifies_returnsTrue() {
        when(otpCacheService.generateAndStore("alice@example.com"))
                .thenReturn(Optional.of("123456"));

        boolean result = otpService.sendOtp("alice@example.com");

        assertThat(result).isTrue();
        verify(notificationPort).send("alice@example.com", "123456");
    }

    @Test
    void sendOtp_returnsFalse_whenRedisUnavailable() {
        when(otpCacheService.generateAndStore(anyString())).thenReturn(Optional.empty());

        assertThat(otpService.sendOtp("alice@example.com")).isFalse();
        verifyNoInteractions(notificationPort);
    }

    @Test
    void sendOtp_returnsTrue_evenIfNotificationFails() {
        when(otpCacheService.generateAndStore(anyString())).thenReturn(Optional.of("654321"));
        doThrow(new RuntimeException("SMTP down")).when(notificationPort).send(anyString(), anyString());

        // OTP is stored — sendOtp should still return true
        assertThat(otpService.sendOtp("alice@example.com")).isTrue();
    }

    // ── verify ───────────────────────────────────────────────────────────────

    @Test
    void verify_returnsSuccess_whenOtpMatches() {
        when(otpCacheService.getRemainingTtl("alice@example.com")).thenReturn(Optional.of(180L));
        when(otpCacheService.validateAndConsume("alice@example.com", "123456")).thenReturn(true);

        OtpVerificationResult result = otpService.verify("alice@example.com", "123456");

        assertThat(result).isInstanceOf(OtpVerificationResult.Success.class);
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.message()).isEqualTo("OTP verified successfully");
    }

    @Test
    void verify_returnsInvalid_whenOtpMismatches() {
        when(otpCacheService.getRemainingTtl("alice@example.com")).thenReturn(Optional.of(120L));
        when(otpCacheService.validateAndConsume("alice@example.com", "000000")).thenReturn(false);

        OtpVerificationResult result = otpService.verify("alice@example.com", "000000");

        assertThat(result).isInstanceOf(OtpVerificationResult.Invalid.class);
        assertThat(result.message()).isEqualTo("OTP is incorrect");
    }

    @Test
    void verify_returnsExpired_whenKeyMissing() {
        when(otpCacheService.getRemainingTtl("alice@example.com")).thenReturn(Optional.of(-2L));

        OtpVerificationResult result = otpService.verify("alice@example.com", "123456");

        assertThat(result).isInstanceOf(OtpVerificationResult.Expired.class);
        assertThat(result.message()).contains("expired");
        verifyNoMoreInteractions(otpCacheService);
    }

    @Test
    void verify_returnsServiceUnavailable_whenRedisDown() {
        when(otpCacheService.getRemainingTtl(anyString())).thenReturn(Optional.empty());

        OtpVerificationResult result = otpService.verify("alice@example.com", "123456");

        assertThat(result).isInstanceOf(OtpVerificationResult.ServiceUnavailable.class);
        assertThat(result.isSuccess()).isFalse();
    }

    // ── resendOtp ─────────────────────────────────────────────────────────────

    @Test
    void resendOtp_invalidatesOldAndSendsNew() {
        when(otpCacheService.generateAndStore("alice@example.com"))
                .thenReturn(Optional.of("999999"));

        boolean result = otpService.resendOtp("alice@example.com");

        assertThat(result).isTrue();
        verify(otpCacheService).invalidate("alice@example.com");
        verify(notificationPort).send("alice@example.com", "999999");
    }

    // ── OtpVerificationResult messages ───────────────────────────────────────

    @Test
    void verificationResultMessages_areCorrect() {
        assertThat(new OtpVerificationResult.Success().message())
                .isEqualTo("OTP verified successfully");
        assertThat(new OtpVerificationResult.Expired().message())
                .contains("expired");
        assertThat(new OtpVerificationResult.Invalid().message())
                .isEqualTo("OTP is incorrect");
        assertThat(new OtpVerificationResult.ServiceUnavailable().message())
                .contains("unavailable");
    }
}
