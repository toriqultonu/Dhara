package com.dhara.template.dto;

import com.dhara.entity.DocumentTemplate;

public record TemplateListResponse(
        Long id,
        String title,
        String category,
        String description,
        Integer popularity,
        String preview
) {
    public static TemplateListResponse from(DocumentTemplate t) {
        return new TemplateListResponse(
                t.getId(),
                t.getTitle(),
                t.getCategory(),
                t.getDescription(),
                t.getPopularity(),
                t.getPreview()
        );
    }
}
