package com.dhara.ratelimit;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RedisRateLimiterTest {

    private static final Long USER_ID = 42L;

    @Mock
    private RedisTemplate<String, String> redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private RedisRateLimiter rateLimiter;

    @Test
    void isAllowed_underLimit_allowsAndIncrementsCounter() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenReturn("2");

        boolean allowed = rateLimiter.isAllowed(USER_ID, "FREE");

        assertThat(allowed).isTrue();
        verify(valueOperations).increment(anyString());
        verify(redisTemplate).expire(anyString(), eq(Duration.ofDays(1)));
    }

    @Test
    void isAllowed_noPreviousUsage_allows() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenReturn(null);

        assertThat(rateLimiter.isAllowed(USER_ID, "FREE")).isTrue();
        verify(valueOperations).increment(anyString());
    }

    @Test
    void isAllowed_atFreeLimit_blocks() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenReturn("5");

        boolean allowed = rateLimiter.isAllowed(USER_ID, "FREE");

        assertThat(allowed).isFalse();
        verify(valueOperations, never()).increment(anyString());
    }

    @Test
    void isAllowed_studentUnderLimit_allows() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenReturn("29");

        assertThat(rateLimiter.isAllowed(USER_ID, "STUDENT")).isTrue();
    }

    @Test
    void isAllowed_studentAtLimit_blocks() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenReturn("30");

        assertThat(rateLimiter.isAllowed(USER_ID, "STUDENT")).isFalse();
    }

    @Test
    void isAllowed_professionalTier_alwaysAllowedWithoutRedis() {
        assertThat(rateLimiter.isAllowed(USER_ID, "PROFESSIONAL")).isTrue();
        verifyNoInteractions(redisTemplate);
    }

    @Test
    void isAllowed_firmTier_alwaysAllowedWithoutRedis() {
        assertThat(rateLimiter.isAllowed(USER_ID, "FIRM")).isTrue();
        verifyNoInteractions(redisTemplate);
    }

    @Test
    void isAllowed_unknownTier_defaultsToFreeLimit() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenReturn("5");

        assertThat(rateLimiter.isAllowed(USER_ID, "UNKNOWN")).isFalse();
    }

    @Test
    void remainingQueries_freeTierWithUsage_returnsDifference() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenReturn("3");

        assertThat(rateLimiter.remainingQueries(USER_ID, "FREE")).isEqualTo(2);
    }

    @Test
    void remainingQueries_overLimit_returnsZero() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenReturn("9");

        assertThat(rateLimiter.remainingQueries(USER_ID, "FREE")).isZero();
    }

    @Test
    void remainingQueries_unlimitedTier_returnsMaxValue() {
        assertThat(rateLimiter.remainingQueries(USER_ID, "PROFESSIONAL"))
                .isEqualTo(Integer.MAX_VALUE);
        verifyNoInteractions(redisTemplate);
    }
}
