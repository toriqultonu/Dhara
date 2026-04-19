package com.dhara.analysis.dto;

import java.util.List;

public record AnalysisQueryResponse(
        String answer,
        List<LegalReference> references,
        Double confidence
) {
    public record LegalReference(
            String law,
            String section,
            String relevance
    ) {}
}
