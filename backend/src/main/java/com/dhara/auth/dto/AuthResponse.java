package com.dhara.auth.dto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        UserInfo user
) {
    public record UserInfo(Long id, String email, String name, String role) {}
}
