package com.dhara.auth;

import com.dhara.auth.dto.AuthResponse;
import com.dhara.auth.dto.LoginRequest;
import com.dhara.auth.dto.RegisterRequest;
import com.dhara.auth.exception.AuthException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private GoogleOAuthService googleOAuthService;

    @MockitoBean
    private JwtService jwtService; // required by the component-scanned JwtAuthFilter

    private AuthResponse authResponse() {
        return new AuthResponse("access-token", "refresh-token",
                new AuthResponse.UserInfo(42L, "rahim@example.com", "Rahim Uddin", "USER"));
    }

    @Test
    void register_validRequest_returnsTokens() throws Exception {
        when(userService.register(any(RegisterRequest.class))).thenReturn(authResponse());

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Rahim Uddin\",\"email\":\"rahim@example.com\","
                                + "\"password\":\"secret123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("access-token"))
                .andExpect(jsonPath("$.data.user.email").value("rahim@example.com"));
    }

    @Test
    void register_duplicateEmail_returns401WithError() throws Exception {
        when(userService.register(any(RegisterRequest.class)))
                .thenThrow(new AuthException("Email already registered"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Rahim Uddin\",\"email\":\"rahim@example.com\","
                                + "\"password\":\"secret123\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Email already registered"));
    }

    @Test
    void register_invalidBody_returns400ValidationError() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Rahim\",\"email\":\"not-an-email\",\"password\":\"123\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void login_validCredentials_returnsTokens() throws Exception {
        when(userService.login(any(LoginRequest.class))).thenReturn(authResponse());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"rahim@example.com\",\"password\":\"secret123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.refreshToken").value("refresh-token"))
                .andExpect(jsonPath("$.data.user.id").value(42));
    }

    @Test
    void login_badCredentials_returns401() throws Exception {
        when(userService.login(any(LoginRequest.class)))
                .thenThrow(new AuthException("Invalid credentials"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"rahim@example.com\",\"password\":\"wrong\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Invalid credentials"));
    }

    @Test
    void googleLogin_validToken_returnsTokens() throws Exception {
        when(googleOAuthService.loginWithGoogle("google-id-token")).thenReturn(authResponse());

        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"idToken\":\"google-id-token\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("access-token"));
    }

    @Test
    void googleLogin_invalidToken_returns401() throws Exception {
        when(googleOAuthService.loginWithGoogle("bad-token"))
                .thenThrow(new AuthException("Invalid Google ID token"));

        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"idToken\":\"bad-token\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid Google ID token"));
    }
}
