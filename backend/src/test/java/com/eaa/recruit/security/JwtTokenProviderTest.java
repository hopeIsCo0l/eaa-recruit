package com.eaa.recruit.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    private JwtTokenProvider provider;

    @BeforeEach
    void setUp() {
        JwtProperties props = new JwtProperties();
        props.setSecret("test-secret-key-that-is-at-least-256-bits-long-for-testing-purposes");
        props.setExpirationMs(3_600_000L); // 1 hour
        provider = new JwtTokenProvider(props);
    }

    @Test
    void generateAndValidate() {
        String token = provider.generateToken(42L, "CANDIDATE", "alice@example.com");
        assertThat(provider.validateToken(token)).isTrue();
    }

    @Test
    void claimsRoundTrip() {
        String token = provider.generateToken(7L, "RECRUITER", "bob@example.com");

        assertThat(provider.extractEmail(token)).isEqualTo("bob@example.com");
        assertThat(provider.extractUserId(token)).isEqualTo(7L);
        assertThat(provider.extractRole(token)).isEqualTo("RECRUITER");
    }

    @Test
    void expiredTokenIsRejected() {
        JwtProperties shortProps = new JwtProperties();
        shortProps.setSecret("test-secret-key-that-is-at-least-256-bits-long-for-testing-purposes");
        shortProps.setExpirationMs(-1L); // already expired
        JwtTokenProvider shortProvider = new JwtTokenProvider(shortProps);

        String token = shortProvider.generateToken(1L, "CANDIDATE", "x@x.com");
        assertThat(shortProvider.validateToken(token)).isFalse();
    }

    @Test
    void tamperedTokenIsRejected() {
        String token = provider.generateToken(1L, "CANDIDATE", "x@x.com");
        String tampered = token.substring(0, token.length() - 4) + "XXXX";
        assertThat(provider.validateToken(tampered)).isFalse();
    }

    @Test
    void emptyTokenIsRejected() {
        assertThat(provider.validateToken("")).isFalse();
        assertThat(provider.validateToken("not.a.jwt")).isFalse();
    }
}
