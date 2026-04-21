package com.dhara.search.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AskRequest(
        @NotBlank @Size(max = 2000) String question,
        String language,
        String mode,
        String sessionId,
        Long statuteId
) {
    public AskRequest {
        if (language == null) language = "bn";
        if (mode == null) mode = "rag";
    }
}
