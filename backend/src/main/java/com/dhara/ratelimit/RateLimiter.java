package com.dhara.ratelimit;

public interface RateLimiter {
    boolean isAllowed(Long userId, String userTier);
    int remainingQueries(Long userId, String userTier);
}
