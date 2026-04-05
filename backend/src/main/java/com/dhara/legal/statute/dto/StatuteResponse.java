package com.dhara.legal.statute.dto;

import com.dhara.entity.Statute;

import java.time.Instant;
import java.time.LocalDate;

public record StatuteResponse(
        Long id, String actNumber, String titleEn, String titleBn,
        Integer year, String category, String status,
        LocalDate effectiveDate, String sourceUrl, Instant createdAt
) {
    public static StatuteResponse from(Statute e) {
        return new StatuteResponse(e.getId(), e.getActNumber(), e.getTitleEn(), e.getTitleBn(),
                e.getYear(), e.getCategory(), e.getStatus(),
                e.getEffectiveDate(), e.getSourceUrl(), e.getCreatedAt());
    }
}
