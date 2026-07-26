package com.dhara.document.dto;

import jakarta.validation.constraints.Size;

public record UpdateDocumentRequest(
        @Size(max = 500) String title,
        String category,
        String content,
        String status,
        String[] tags
) {}
