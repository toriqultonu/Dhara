package com.dhara.clause.dto;

import com.dhara.entity.LegalClause;

public record ClauseResponse(
        Long id,
        String title,
        String category,
        String content
) {
    public static ClauseResponse from(LegalClause c) {
        return new ClauseResponse(c.getId(), c.getTitle(), c.getCategory(), c.getContent());
    }
}
