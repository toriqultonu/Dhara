package com.dhara.analysis.dto;

public record AnalysisUploadResponse(
        String sessionId,
        String fileName,
        Integer pageCount,
        Integer wordCount,
        String extractedText
) {}
