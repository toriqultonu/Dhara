package com.dhara.search.dto;

import java.util.List;
import java.util.Map;

public record SearchResponse(
        List<SearchResultItem> results,
        String aiAnswer,
        float searchTimeMs,
        List<CitationDto> citations
) {
    public SearchResponse(List<SearchResultItem> results, String aiAnswer, float searchTimeMs) {
        this(results, aiAnswer, searchTimeMs, List.of());
    }

    public record SearchResultItem(
            String sourceType, Long sourceId, String title,
            String snippet, float score, Map<String, String> metadata
    ) {}

    public record CitationDto(
            String sourceType, Long sourceId, String title,
            String sectionNumber, String snippet
    ) {}
}
