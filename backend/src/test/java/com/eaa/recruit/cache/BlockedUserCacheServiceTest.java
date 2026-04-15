package com.eaa.recruit.cache;

import com.eaa.recruit.security.JwtProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BlockedUserCacheServiceTest {

    @Mock StringRedisTemplate        redis;
    @Mock ValueOperations<String, String> valueOps;

    BlockedUserCacheService service;

    @BeforeEach
    void setUp() {
        JwtProperties props = new JwtProperties();
        props.setExpirationMs(86_400_000L); // 24h
        when(redis.opsForValue()).thenReturn(valueOps);
        service = new BlockedUserCacheService(redis, props);
    }

    @Test
    void block_setsKeyWithJwtTtl() {
        service.block(42L);
        verify(valueOps).set(eq("blocked_user:42"), eq("1"), eq(Duration.ofMillis(86_400_000L)));
    }

    @Test
    void unblock_deletesKey() {
        service.unblock(42L);
        verify(redis).delete("blocked_user:42");
    }

    @Test
    void isBlocked_trueWhenKeyPresent() {
        when(redis.hasKey("blocked_user:42")).thenReturn(true);
        assertThat(service.isBlocked(42L)).isTrue();
    }

    @Test
    void isBlocked_falseWhenKeyAbsent() {
        when(redis.hasKey("blocked_user:42")).thenReturn(false);
        assertThat(service.isBlocked(42L)).isFalse();
    }

    @Test
    void isBlocked_failsOpen_whenRedisDown() {
        when(redis.hasKey(anyString()))
                .thenThrow(new DataAccessResourceFailureException("Redis down"));
        // fail open — should return false, not throw
        assertThat(service.isBlocked(42L)).isFalse();
    }

    @Test
    void block_doesNotThrow_whenRedisDown() {
        doThrow(new DataAccessResourceFailureException("Redis down"))
                .when(valueOps).set(anyString(), anyString(), any(Duration.class));
        service.block(42L); // must not propagate
    }

    @Test
    void unblock_doesNotThrow_whenRedisDown() {
        doThrow(new DataAccessResourceFailureException("Redis down"))
                .when(redis).delete(anyString());
        service.unblock(42L); // must not propagate
    }
}
