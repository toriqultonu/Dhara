package com.dhara.legal.statute.dto;

import com.dhara.entity.Statute;

public record StatuteListResponse(
        Long id, String actNumber, String titleEn, String titleBn,
        Integer year, String category, String status
) {
    public static StatuteListResponse from(Statute e) {
        return new StatuteListResponse(e.getId(), e.getActNumber(), e.getTitleEn(), e.getTitleBn(),
                e.getYear(), e.getCategory(), e.getStatus());
    }
}
