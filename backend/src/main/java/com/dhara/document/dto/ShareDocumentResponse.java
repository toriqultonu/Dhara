package com.dhara.document.dto;

import java.time.Instant;

public record ShareDocumentResponse(
        String shareUrl,
        Instant expiresAt
) {}
