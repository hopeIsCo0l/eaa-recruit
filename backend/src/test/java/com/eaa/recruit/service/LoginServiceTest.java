package com.eaa.recruit.service;

import com.eaa.recruit.dto.auth.LoginRequest;
import com.eaa.recruit.dto.auth.LoginResponse;
import com.eaa.recruit.entity.Role;
import com.eaa.recruit.entity.User;
import com.eaa.recruit.exception.UnauthorizedException;
import com.eaa.recruit.repository.UserRepository;
import com.eaa.recruit.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoginServiceTest {

    @Mock UserRepository   userRepository;
    @Mock PasswordEncoder  passwordEncoder;
    @Mock JwtTokenProvider jwtTokenProvider;

    LoginService service;

    @BeforeEach
    void setUp() {
        service = new LoginService(userRepository, passwordEncoder, jwtTokenProvider);
    }

    private User activeUser() {
        User u = User.create("user@eaa.com", "hash", Role.CANDIDATE, "Test User");
        u.activate();
        return u;
    }

    @Test
    void login_success_returnsToken() {
        User user = activeUser();
        when(userRepository.findByEmail("user@eaa.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret", "hash")).thenReturn(true);
        when(jwtTokenProvider.generateToken(any(), eq("CANDIDATE"), eq("user@eaa.com")))
                .thenReturn("jwt-token");

        LoginResponse resp = service.login(new LoginRequest("user@eaa.com", "secret"));

        assertThat(resp.token()).isEqualTo("jwt-token");
        assertThat(resp.email()).isEqualTo("user@eaa.com");
        assertThat(resp.role()).isEqualTo("CANDIDATE");
        assertThat(resp.fullName()).isEqualTo("Test User");
    }

    @Test
    void login_wrongPassword_throws() {
        User user = activeUser();
        when(userRepository.findByEmail("user@eaa.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hash")).thenReturn(false);

        assertThatThrownBy(() -> service.login(new LoginRequest("user@eaa.com", "wrong")))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void login_unknownEmail_throws() {
        when(userRepository.findByEmail("ghost@eaa.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.login(new LoginRequest("ghost@eaa.com", "pass")))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void login_inactiveAccount_throws() {
        User user = User.create("user@eaa.com", "hash", Role.CANDIDATE, "Test User");
        when(userRepository.findByEmail("user@eaa.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret", "hash")).thenReturn(true);

        assertThatThrownBy(() -> service.login(new LoginRequest("user@eaa.com", "secret")))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("not yet activated");
    }
}
