package com.dhara.auth;

import com.dhara.auth.dto.AuthResponse;
import com.dhara.auth.exception.AuthException;
import com.dhara.entity.User;
import com.dhara.repository.UserRepository;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

@Service
@Slf4j
public class GoogleOAuthService {

    private static final String TOKENINFO_URL = "https://oauth2.googleapis.com";

    private final String googleClientId;
    private final RestClient restClient;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public GoogleOAuthService(
            @Value("${dhara.google.client-id:}") String googleClientId,
            RestClient.Builder restClientBuilder,
            UserRepository userRepository,
            JwtService jwtService) {
        this.googleClientId = googleClientId;
        this.restClient = restClientBuilder.baseUrl(TOKENINFO_URL).build();
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    /**
     * Verifies a Google ID token against Google's tokeninfo endpoint,
     * finds or creates the matching user, and issues a JWT token pair.
     */
    @Transactional
    public AuthResponse loginWithGoogle(String idToken) {
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new AuthException("Google login is not configured");
        }

        GoogleTokenInfo tokenInfo;
        try {
            tokenInfo = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/tokeninfo")
                            .queryParam("id_token", idToken)
                            .build())
                    .retrieve()
                    .body(GoogleTokenInfo.class);
        } catch (Exception e) {
            log.warn("Google token verification failed: {}", e.getMessage());
            throw new AuthException("Invalid Google ID token");
        }

        if (tokenInfo == null || tokenInfo.email() == null || tokenInfo.sub() == null) {
            throw new AuthException("Invalid Google ID token");
        }
        if (!googleClientId.equals(tokenInfo.aud())) {
            log.warn("Google token audience mismatch: {}", tokenInfo.aud());
            throw new AuthException("Google token was not issued for this application");
        }
        if (!"true".equalsIgnoreCase(tokenInfo.emailVerified())) {
            throw new AuthException("Google account email is not verified");
        }

        User user = userRepository.findByEmail(tokenInfo.email())
                .map(existing -> linkGoogleAccount(existing, tokenInfo))
                .orElseGet(() -> createGoogleUser(tokenInfo));

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        var userInfo = new AuthResponse.UserInfo(
                user.getId(), user.getEmail(), user.getName(), user.getRole());
        return new AuthResponse(accessToken, refreshToken, userInfo);
    }

    private User linkGoogleAccount(User user, GoogleTokenInfo tokenInfo) {
        if (user.getOauthProvider() == null) {
            user.setOauthProvider("google");
            user.setOauthId(tokenInfo.sub());
            userRepository.save(user);
        }
        return user;
    }

    private User createGoogleUser(GoogleTokenInfo tokenInfo) {
        User user = new User();
        user.setEmail(tokenInfo.email());
        user.setName(tokenInfo.name() != null && !tokenInfo.name().isBlank()
                ? tokenInfo.name()
                : tokenInfo.email().split("@")[0]);
        user.setOauthProvider("google");
        user.setOauthId(tokenInfo.sub());
        return userRepository.save(user);
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record GoogleTokenInfo(
            @JsonProperty("aud") String aud,
            @JsonProperty("sub") String sub,
            @JsonProperty("email") String email,
            @JsonProperty("email_verified") String emailVerified,
            @JsonProperty("name") String name,
            @JsonProperty("picture") String picture
    ) {}
}
