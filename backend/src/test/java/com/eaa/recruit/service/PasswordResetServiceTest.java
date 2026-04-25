package com.eaa.recruit.service;

import com.eaa.recruit.dto.auth.ForgotPasswordRequest;
import com.eaa.recruit.dto.auth.ResetPasswordRequest;
import com.eaa.recruit.entity.Role;
import com.eaa.recruit.entity.User;
import com.eaa.recruit.exception.BusinessException;
import com.eaa.recruit.otp.OtpService;
import com.eaa.recruit.otp.OtpVerificationResult;
import com.eaa.recruit.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock UserRepository  userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock OtpService      otpService;

    PasswordResetService service;

    @BeforeEach
    void setUp() {
        service = new PasswordResetService(userRepository, passwordEncoder, otpService);
    }

    @Test
    void sendResetOtp_knownEmail_sendsOtp() {
        when(userRepository.existsByEmail("user@eaa.com")).thenReturn(true);

        service.sendResetOtp(new ForgotPasswordRequest("user@eaa.com"));

        verify(otpService).sendOtp("user@eaa.com");
    }

    @Test
    void sendResetOtp_unknownEmail_silentNoOp() {
        when(userRepository.existsByEmail("ghost@eaa.com")).thenReturn(false);

        service.sendResetOtp(new ForgotPasswordRequest("ghost@eaa.com"));

        verify(otpService, never()).sendOtp(any());
    }

    @Test
    void resetPassword_validOtp_updatesPassword() {
        User user = User.create("user@eaa.com", "oldHash", Role.CANDIDATE, "Test");
        when(otpService.verify("user@eaa.com", "123456")).thenReturn(new OtpVerificationResult.Success());
        when(userRepository.findByEmail("user@eaa.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("newPass123")).thenReturn("newHash");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        service.resetPassword(new ResetPasswordRequest("user@eaa.com", "123456", "newPass123"));

        verify(userRepository).save(user);
        verify(passwordEncoder).encode("newPass123");
    }

    @Test
    void resetPassword_invalidOtp_throws() {
        when(otpService.verify("user@eaa.com", "wrong"))
                .thenReturn(new OtpVerificationResult.Invalid());

        assertThatThrownBy(() ->
                service.resetPassword(new ResetPasswordRequest("user@eaa.com", "wrong", "newPass123")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("OTP is incorrect");

        verify(userRepository, never()).save(any());
    }
}
