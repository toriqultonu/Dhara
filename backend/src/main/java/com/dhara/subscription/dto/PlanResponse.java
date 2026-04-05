package com.dhara.subscription.dto;

import com.dhara.entity.SubscriptionPlan;

import java.math.BigDecimal;

public record PlanResponse(
        Long id, String name, String displayNameEn, String displayNameBn,
        BigDecimal priceBdt, Integer aiQueriesPerDay, String features
) {
    public static PlanResponse from(SubscriptionPlan e) {
        return new PlanResponse(e.getId(), e.getName(), e.getDisplayNameEn(), e.getDisplayNameBn(),
                e.getPriceBdt(), e.getAiQueriesPerDay(), e.getFeatures());
    }
}
