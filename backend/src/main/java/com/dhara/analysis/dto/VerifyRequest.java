package com.dhara.analysis.dto;

import jakarta.validation.constraints.NotBlank;

public record VerifyRequest(
        @NotBlank String sessionId,
        String documentType
) {
    public VerifyRequest {
        if (documentType == null || documentType.isBlank()) {
            documentType = "other";
        }
    }
}
