package com.dhara.analysis.dto;

import java.util.List;

public record VerifyResponse(
        String documentType,
        VerifySummary summary,
        VerifyResults results
) {
    public record VerifySummary(int valid, int warnings, int issues) {}

    public record VerifyResults(
            List<VerifyItem> valid,
            List<VerifyItem> warnings,
            List<VerifyItem> issues
    ) {}

    public record VerifyItem(
            String section,
            String text,
            String law,
            String lawSection,
            String suggestion
    ) {}
}
