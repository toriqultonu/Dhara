package com.dhara.legal.sro.dto;

import com.dhara.entity.Sro;

import java.time.Instant;
import java.time.LocalDate;

public record SroResponse(
        Long id, String sroNumber, String titleEn, String titleBn,
        LocalDate gazetteDate, String issuingMinistry,
        String sourceUrl, String status, Instant createdAt
) {
    public static SroResponse from(Sro e) {
        return new SroResponse(e.getId(), e.getSroNumber(), e.getTitleEn(), e.getTitleBn(),
                e.getGazetteDate(), e.getIssuingMinistry(), e.getSourceUrl(),
                e.getStatus(), e.getCreatedAt());
    }
}
