package com.dhara.document.dto;

import com.dhara.entity.UserDocument;

import java.time.Instant;

public record DocumentListResponse(
        Long id,
        String title,
        String category,
        String status,
        String[] tags,
        Boolean shared,
        Instant createdAt,
        Instant modifiedAt
) {
    public static DocumentListResponse from(UserDocument d) {
        return new DocumentListResponse(
                d.getId(),
                d.getTitle(),
                d.getCategory(),
                d.getStatus(),
                d.getTags(),
                d.getShared(),
                d.getCreatedAt(),
                d.getUpdatedAt()
        );
    }
}
