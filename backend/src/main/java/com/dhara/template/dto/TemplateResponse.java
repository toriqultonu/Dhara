package com.dhara.template.dto;

import com.dhara.entity.DocumentTemplate;

public record TemplateResponse(
        Long id,
        String title,
        String category,
        String description,
        Integer popularity,
        String content,
        String preview
) {
    public static TemplateResponse from(DocumentTemplate t) {
        return new TemplateResponse(
                t.getId(),
                t.getTitle(),
                t.getCategory(),
                t.getDescription(),
                t.getPopularity(),
                t.getContent(),
                t.getPreview()
        );
    }
}
