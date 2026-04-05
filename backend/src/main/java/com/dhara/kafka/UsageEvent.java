package com.dhara.kafka;

import java.math.BigDecimal;
import java.time.Instant;

public record UsageEvent(
        Long userId,
        String actionType,
        String queryText,
        Integer tokensUsed,
        String llmProvider,
        BigDecimal costUsd,
        Instant timestamp
) {}
