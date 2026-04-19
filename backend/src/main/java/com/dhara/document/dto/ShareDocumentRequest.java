package com.dhara.document.dto;

public record ShareDocumentRequest(
        String permission,
        String email
) {}
