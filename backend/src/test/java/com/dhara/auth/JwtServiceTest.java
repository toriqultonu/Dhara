package com.dhara.auth;

import com.dhara.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private static final String SECRET =
            "test-secret-key-for-dhara-jwt-that-is-long-enough-0123456789";
    private static final String OTHER_SECRET =
            "another-secret-key-for-dhara-jwt-also-long-enough-9876543210";

    private JwtService jwtService;
    private User user;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(SECRET, Duration.ofMinutes(15), Duration.ofDays(7));
        user = new User();
        user.setId(42L);
        user.setEmail("rahim@example.com");
        user.setName("Rahim Uddin");
        user.setRole("USER");
    }

    @Test
    void generateAccessToken_validateRoundtrip_returnsOriginalClaims() {
        String token = jwtService.generateAccessToken(user);

        Claims claims = jwtService.validateToken(token);

        assertThat(claims.getSubject()).isEqualTo("42");
        assertThat(claims.get("email", String.class)).isEqualTo("rahim@example.com");
        assertThat(claims.get("role", String.class)).isEqualTo("USER");
        assertThat(claims.getExpiration()).isAfter(claims.getIssuedAt());
    }

    @Test
    void generateRefreshToken_validateRoundtrip_returnsSubject() {
        String token = jwtService.generateRefreshToken(user);

        Claims claims = jwtService.validateToken(token);

        assertThat(claims.getSubject()).isEqualTo("42");
    }

    @Test
    void getUserIdFromToken_validToken_returnsUserId() {
        String token = jwtService.generateAccessToken(user);

        assertThat(jwtService.getUserIdFromToken(token)).isEqualTo(42L);
    }

    @Test
    void validateToken_expiredToken_throwsExpiredJwtException() {
        JwtService expiredIssuer = new JwtService(SECRET, Duration.ofSeconds(-60), Duration.ofDays(7));
        String expiredToken = expiredIssuer.generateAccessToken(user);

        assertThatThrownBy(() -> jwtService.validateToken(expiredToken))
                .isInstanceOf(ExpiredJwtException.class);
    }

    @Test
    void validateToken_wrongSignature_throwsJwtException() {
        JwtService otherIssuer = new JwtService(OTHER_SECRET, Duration.ofMinutes(15), Duration.ofDays(7));
        String foreignToken = otherIssuer.generateAccessToken(user);

        assertThatThrownBy(() -> jwtService.validateToken(foreignToken))
                .isInstanceOf(JwtException.class);
    }

    @Test
    void validateToken_malformedToken_throwsJwtException() {
        assertThatThrownBy(() -> jwtService.validateToken("not.a.jwt"))
                .isInstanceOf(JwtException.class);
    }
}
