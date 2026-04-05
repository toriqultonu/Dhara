package com.dhara.ratelimit;

import com.dhara.common.Constants;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDate;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class RedisRateLimiter implements RateLimiter {

    private final RedisTemplate<String, String> redisTemplate;

    private static final Map<String, Integer> TIER_LIMITS = Map.of(
            Constants.TIER_FREE, 5,
            Constants.TIER_STUDENT, 30,
            Constants.TIER_PROFESSIONAL, Integer.MAX_VALUE,
            Constants.TIER_FIRM, Integer.MAX_VALUE
    );

    @Override
    public boolean isAllowed(Long userId, String userTier) {
        int limit = TIER_LIMITS.getOrDefault(userTier, 5);
        if (limit == Integer.MAX_VALUE) return true;

        String key = rateLimitKey(userId);
        String current = redisTemplate.opsForValue().get(key);
        int count = current != null ? Integer.parseInt(current) : 0;

        if (count >= limit) return false;

        redisTemplate.opsForValue().increment(key);
        redisTemplate.expire(key, Duration.ofDays(1));
        return true;
    }

    @Override
    public int remainingQueries(Long userId, String userTier) {
        int limit = TIER_LIMITS.getOrDefault(userTier, 5);
        if (limit == Integer.MAX_VALUE) return Integer.MAX_VALUE;

        String current = redisTemplate.opsForValue().get(rateLimitKey(userId));
        int count = current != null ? Integer.parseInt(current) : 0;
        return Math.max(0, limit - count);
    }

    private String rateLimitKey(Long userId) {
        return "ratelimit:" + userId + ":" + LocalDate.now();
    }
}
