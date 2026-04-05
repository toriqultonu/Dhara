package com.dhara.search.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record SearchRequest(
        @NotBlank @Size(max = 1000) String query,
        String language,
        List<String> filters,
        int topK
) {
    public SearchRequest {
        if (language == null) language = "bn";
        if (filters == null) filters = List.of("statutes", "judgments", "sros");
        if (topK <= 0) topK = 10;
    }
}
