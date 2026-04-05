package com.dhara.legal.judgment.dto;

import com.dhara.entity.Judgment;

import java.time.LocalDate;

public record JudgmentListResponse(
        Long id, String caseName, String citation, String court,
        LocalDate judgmentDate, String status
) {
    public static JudgmentListResponse from(Judgment e) {
        return new JudgmentListResponse(e.getId(), e.getCaseName(), e.getCitation(),
                e.getCourt(), e.getJudgmentDate(), e.getStatus());
    }
}
