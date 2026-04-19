package com.dhara.document.dto;

import com.dhara.entity.UserDocument;

import java.time.Instant;

public record DocumentResponse(
        Long id,
        String title,
        String category,
        String status,
        String content,
        String[] tags,
        Boolean shared,
        String shareUrl,
        Long templateId,
        Instant createdAt,
        Instant modifiedAt
) {
    public static DocumentResponse from(UserDocument d) {
        return new DocumentResponse(
                d.getId(),
                d.getTitle(),
                d.getCategory(),
                d.getStatus(),
                d.getContent(),
                d.getTags(),
                d.getShared(),
                d.getShareUrl(),
                d.getTemplate() != null ? d.getTemplate().getId() : null,
                d.getCreatedAt(),
                d.getUpdatedAt()
        );
    }
}
