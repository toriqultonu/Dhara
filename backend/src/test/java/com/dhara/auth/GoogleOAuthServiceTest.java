package com.dhara.auth;

import com.dhara.auth.dto.AuthResponse;
import com.dhara.auth.exception.AuthException;
import com.dhara.entity.User;
import com.dhara.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.hamcrest.Matchers.startsWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.queryParam;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withBadRequest;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

@ExtendWith(MockitoExtension.class)
class GoogleOAuthServiceTest {

    private static final String CLIENT_ID = "dhara-client-id.apps.googleusercontent.com";
    private static final String TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo";

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtService jwtService;

    private MockRestServiceServer server;
    private GoogleOAuthService service;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        service = new GoogleOAuthService(CLIENT_ID, builder, userRepository, jwtService);
    }

    private String tokenInfoJson(String aud, String emailVerified) {
        return "{\"aud\":\"" + aud + "\",\"sub\":\"google-sub-123\","
                + "\"email\":\"alice@example.com\",\"email_verified\":\"" + emailVerified + "\","
                + "\"name\":\"Alice Rahman\"}";
    }

    @Test
    void loginWithGoogle_validTokenNewUser_createsUserAndReturnsTokens() {
        server.expect(requestTo(startsWith(TOKENINFO_URL)))
                .andExpect(method(HttpMethod.GET))
                .andExpect(queryParam("id_token", "valid-id-token"))
                .andRespond(withSuccess(tokenInfoJson(CLIENT_ID, "true"), MediaType.APPLICATION_JSON));

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(7L);
            return u;
        });
        when(jwtService.generateAccessToken(any(User.class))).thenReturn("access-token");
        when(jwtService.generateRefreshToken(any(User.class))).thenReturn("refresh-token");

        AuthResponse response = service.loginWithGoogle("valid-id-token");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User created = captor.getValue();
        assertThat(created.getEmail()).isEqualTo("alice@example.com");
        assertThat(created.getName()).isEqualTo("Alice Rahman");
        assertThat(created.getOauthProvider()).isEqualTo("google");
        assertThat(created.getOauthId()).isEqualTo("google-sub-123");

        assertThat(response.accessToken()).isEqualTo("access-token");
        assertThat(response.user().id()).isEqualTo(7L);
    }

    @Test
    void loginWithGoogle_existingUserWithoutOauth_linksGoogleAccount() {
        server.expect(requestTo(startsWith(TOKENINFO_URL)))
                .andRespond(withSuccess(tokenInfoJson(CLIENT_ID, "true"), MediaType.APPLICATION_JSON));

        User existing = new User();
        existing.setId(3L);
        existing.setEmail("alice@example.com");
        existing.setName("Alice Rahman");
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(existing));
        when(jwtService.generateAccessToken(existing)).thenReturn("access-token");
        when(jwtService.generateRefreshToken(existing)).thenReturn("refresh-token");

        AuthResponse response = service.loginWithGoogle("valid-id-token");

        verify(userRepository).save(existing);
        assertThat(existing.getOauthProvider()).isEqualTo("google");
        assertThat(existing.getOauthId()).isEqualTo("google-sub-123");
        assertThat(response.user().id()).isEqualTo(3L);
    }

    @Test
    void loginWithGoogle_audienceMismatch_throwsAuthException() {
        server.expect(requestTo(startsWith(TOKENINFO_URL)))
                .andRespond(withSuccess(tokenInfoJson("other-app-client-id", "true"),
                        MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> service.loginWithGoogle("token-for-other-app"))
                .isInstanceOf(AuthException.class)
                .hasMessageContaining("not issued for this application");

        verify(userRepository, never()).save(any());
    }

    @Test
    void loginWithGoogle_emailNotVerified_throwsAuthException() {
        server.expect(requestTo(startsWith(TOKENINFO_URL)))
                .andRespond(withSuccess(tokenInfoJson(CLIENT_ID, "false"), MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> service.loginWithGoogle("unverified-token"))
                .isInstanceOf(AuthException.class)
                .hasMessageContaining("not verified");
    }

    @Test
    void loginWithGoogle_googleRejectsToken_throwsAuthException() {
        server.expect(requestTo(startsWith(TOKENINFO_URL))).andRespond(withBadRequest());

        assertThatThrownBy(() -> service.loginWithGoogle("bogus-token"))
                .isInstanceOf(AuthException.class)
                .hasMessage("Invalid Google ID token");
    }

    @Test
    void loginWithGoogle_clientIdNotConfigured_throwsWithoutHttpCall() {
        GoogleOAuthService unconfigured = new GoogleOAuthService(
                "", RestClient.builder(), userRepository, jwtService);

        assertThatThrownBy(() -> unconfigured.loginWithGoogle("any-token"))
                .isInstanceOf(AuthException.class)
                .hasMessageContaining("not configured");
    }
}
