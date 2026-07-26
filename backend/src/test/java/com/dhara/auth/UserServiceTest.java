package com.dhara.auth;

import com.dhara.auth.dto.AuthResponse;
import com.dhara.auth.dto.LoginRequest;
import com.dhara.auth.dto.RegisterRequest;
import com.dhara.auth.exception.AuthException;
import com.dhara.entity.User;
import com.dhara.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private UserService userService;

    @Test
    void register_newEmail_encodesPasswordAndReturnsTokens() {
        RegisterRequest request = new RegisterRequest(
                "Rahim Uddin", "rahim@example.com", "secret123", "BAR-99");
        when(userRepository.existsByEmail("rahim@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("$2a$hashed");
        when(jwtService.generateAccessToken(any(User.class))).thenReturn("access-token");
        when(jwtService.generateRefreshToken(any(User.class))).thenReturn("refresh-token");

        AuthResponse response = userService.register(request);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User saved = captor.getValue();
        assertThat(saved.getPasswordHash()).isEqualTo("$2a$hashed");
        assertThat(saved.getEmail()).isEqualTo("rahim@example.com");
        assertThat(saved.getName()).isEqualTo("Rahim Uddin");
        assertThat(saved.getBarCouncilId()).isEqualTo("BAR-99");

        assertThat(response.accessToken()).isEqualTo("access-token");
        assertThat(response.refreshToken()).isEqualTo("refresh-token");
        assertThat(response.user().email()).isEqualTo("rahim@example.com");
    }

    @Test
    void register_duplicateEmail_throwsAuthException() {
        RegisterRequest request = new RegisterRequest(
                "Rahim Uddin", "rahim@example.com", "secret123", null);
        when(userRepository.existsByEmail("rahim@example.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.register(request))
                .isInstanceOf(AuthException.class)
                .hasMessage("Email already registered");

        verify(userRepository, never()).save(any());
    }

    @Test
    void login_correctPassword_returnsTokens() {
        User user = new User();
        user.setId(42L);
        user.setEmail("rahim@example.com");
        user.setName("Rahim Uddin");
        user.setPasswordHash("$2a$hashed");
        when(userRepository.findByEmail("rahim@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret123", "$2a$hashed")).thenReturn(true);
        when(jwtService.generateAccessToken(user)).thenReturn("access-token");
        when(jwtService.generateRefreshToken(user)).thenReturn("refresh-token");

        AuthResponse response = userService.login(new LoginRequest("rahim@example.com", "secret123"));

        assertThat(response.accessToken()).isEqualTo("access-token");
        assertThat(response.user().id()).isEqualTo(42L);
    }

    @Test
    void login_wrongPassword_throwsAuthException() {
        User user = new User();
        user.setPasswordHash("$2a$hashed");
        when(userRepository.findByEmail("rahim@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "$2a$hashed")).thenReturn(false);

        assertThatThrownBy(() -> userService.login(new LoginRequest("rahim@example.com", "wrong")))
                .isInstanceOf(AuthException.class)
                .hasMessage("Invalid credentials");
    }

    @Test
    void login_unknownEmail_throwsAuthException() {
        when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.login(new LoginRequest("ghost@example.com", "pw")))
                .isInstanceOf(AuthException.class)
                .hasMessage("Invalid credentials");
    }
}
