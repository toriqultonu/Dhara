package com.dhara.auth;

import com.dhara.auth.dto.AuthResponse;
import com.dhara.auth.dto.LoginRequest;
import com.dhara.auth.dto.RegisterRequest;
import com.dhara.auth.exception.AuthException;
import com.dhara.entity.User;
import com.dhara.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new AuthException("Email already registered");
        }

        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setBarCouncilId(request.barCouncilId());
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new AuthException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new AuthException("Invalid credentials");
        }

        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        var userInfo = new AuthResponse.UserInfo(user.getId(), user.getEmail(), user.getName(), user.getRole());
        return new AuthResponse(accessToken, refreshToken, userInfo);
    }
}
