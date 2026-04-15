package com.eaa.recruit.service;

import com.eaa.recruit.dto.auth.CandidateRegistrationRequest;
import com.eaa.recruit.dto.auth.RegistrationResponse;
import com.eaa.recruit.entity.Role;
import com.eaa.recruit.entity.User;
import com.eaa.recruit.exception.BusinessException;
import com.eaa.recruit.exception.ConflictException;
import com.eaa.recruit.otp.OtpService;
import com.eaa.recruit.otp.OtpVerificationResult;
import com.eaa.recruit.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CandidateRegistrationServiceTest {

    @Mock UserRepository   userRepository;
    @Mock PasswordEncoder  passwordEncoder;
    @Mock OtpService       otpService;

    CandidateRegistrationService service;

    @BeforeEach
    void setUp() {
        service = new CandidateRegistrationService(userRepository, passwordEncoder, otpService);
    }

    private static CandidateRegistrationRequest validRequest() {
        return new CandidateRegistrationRequest(
                "Alice Smith", "alice@example.com", "secret123", "+601234567890");
    }

    private static User savedUser() {
        return User.create("alice@example.com", "$2a$hashed", Role.CANDIDATE, "Alice Smith");
    }

    // ── register ─────────────────────────────────────────────────────────────

    @Test
    void register_createsInactiveUser_andSendsOtp() {
        when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("$2a$hashed");
        when(userRepository.save(any(User.class))).thenReturn(savedUser());
        when(otpService.sendOtp("alice@example.com")).thenReturn(true);

        RegistrationResponse response = service.register(validRequest());

        assertThat(response.email()).isEqualTo("alice@example.com");
        assertThat(response.message()).contains("verification code");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().isActive()).isFalse();
        assertThat(captor.getValue().getRole()).isEqualTo(Role.CANDIDATE);
        assertThat(captor.getValue().getPasswordHash()).isEqualTo("$2a$hashed");
    }

    @Test
    void register_throwsConflict_onDuplicateEmail() {
        when(userRepository.existsByEmail("alice@example.com")).thenReturn(true);

        assertThatThrownBy(() -> service.register(validRequest()))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("already registered");

        verifyNoInteractions(passwordEncoder, otpService);
        verify(userRepository, never()).save(any());
    }

    @Test
    void register_throwsBusiness_whenOtpFails() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$hashed");
        when(userRepository.save(any())).thenReturn(savedUser());
        when(otpService.sendOtp(anyString())).thenReturn(false);

        assertThatThrownBy(() -> service.register(validRequest()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("could not send verification code");
    }

    @Test
    void register_passwordIsHashed_neverPlaintext() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("$2a$10$bcrypt");
        when(userRepository.save(any())).thenReturn(savedUser());
        when(otpService.sendOtp(anyString())).thenReturn(true);

        service.register(validRequest());

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getPasswordHash()).isNotEqualTo("secret123");
        assertThat(captor.getValue().getPasswordHash()).startsWith("$2a$");
    }

    // ── verifyOtp ─────────────────────────────────────────────────────────────

    @Test
    void verifyOtp_activatesAccount_onSuccess() {
        User user = savedUser();
        when(otpService.verify("alice@example.com", "123456"))
                .thenReturn(new OtpVerificationResult.Success());
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));

        service.verifyOtp("alice@example.com", "123456");

        assertThat(user.isActive()).isTrue();
    }

    @Test
    void verifyOtp_throwsBusiness_whenExpired() {
        when(otpService.verify("alice@example.com", "123456"))
                .thenReturn(new OtpVerificationResult.Expired());

        assertThatThrownBy(() -> service.verifyOtp("alice@example.com", "123456"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("expired");
    }

    @Test
    void verifyOtp_throwsBusiness_whenInvalid() {
        when(otpService.verify("alice@example.com", "000000"))
                .thenReturn(new OtpVerificationResult.Invalid());

        assertThatThrownBy(() -> service.verifyOtp("alice@example.com", "000000"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("incorrect");
    }
}
