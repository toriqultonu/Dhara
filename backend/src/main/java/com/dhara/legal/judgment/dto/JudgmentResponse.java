package com.dhara.legal.judgment.dto;

import com.dhara.entity.Judgment;

import java.time.Instant;
import java.time.LocalDate;

public record JudgmentResponse(
        Long id, String caseName, String citation, String court, String bench,
        LocalDate judgmentDate, String headnotesEn, String headnotesBn,
        String fullText, String sourceUrl, String status, Instant createdAt
) {
    public static JudgmentResponse from(Judgment e) {
        return new JudgmentResponse(e.getId(), e.getCaseName(), e.getCitation(), e.getCourt(),
                e.getBench(), e.getJudgmentDate(), e.getHeadnotesEn(), e.getHeadnotesBn(),
                e.getFullText(), e.getSourceUrl(), e.getStatus(), e.getCreatedAt());
    }
}
