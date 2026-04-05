package com.dhara.subscription.dto;

import com.dhara.entity.UserSubscription;

import java.time.Instant;

public record SubscriptionResponse(
        Long id, String planName, String status, Instant startedAt, Instant expiresAt
) {
    public static SubscriptionResponse from(UserSubscription e) {
        return new SubscriptionResponse(e.getId(), e.getPlan().getName(), e.getStatus(),
                e.getStartedAt(), e.getExpiresAt());
    }
}
