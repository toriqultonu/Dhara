package com.dhara.document.dto;

public record DocumentStatsResponse(
        long total,
        long drafts,
        long completed,
        long shared
) {}
