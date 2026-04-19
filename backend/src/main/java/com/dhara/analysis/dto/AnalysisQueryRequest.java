package com.dhara.analysis.dto;

public record AnalysisQueryRequest(
        String sessionId,
        String query,
        String language
) {}
