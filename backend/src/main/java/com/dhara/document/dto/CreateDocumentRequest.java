package com.dhara.document.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateDocumentRequest(
        @NotBlank @Size(max = 500) String title,
        String category,
        Long templateId,
        String content,
        String[] tags
) {}
