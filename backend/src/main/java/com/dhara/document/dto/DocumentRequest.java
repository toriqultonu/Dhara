package com.dhara.document.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DocumentRequest(
        @NotBlank @Size(max = 500) String title,
        String category,
        Long templateId,
        String content,
        String status,
        String[] tags
) {}
