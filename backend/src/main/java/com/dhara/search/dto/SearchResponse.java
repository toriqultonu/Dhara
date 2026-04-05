package com.dhara.search.dto;

import java.util.List;
import java.util.Map;

public record SearchResponse(
        List<SearchResultItem> results,
        String aiAnswer,
        float searchTimeMs
) {
    public record SearchResultItem(
            String sourceType, Long sourceId, String title,
            String snippet, float score, Map<String, String> metadata
    ) {}
}
