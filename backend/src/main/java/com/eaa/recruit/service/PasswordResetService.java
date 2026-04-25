package com.eaa.recruit.service;

import com.eaa.recruit.dto.auth.ForgotPasswordRequest;
import com.eaa.recruit.dto.auth.ResetPasswordRequest;
import com.eaa.recruit.entity.User;
import com.eaa.recruit.exception.BusinessException;
import com.eaa.recruit.otp.OtpService;
import com.eaa.recruit.otp.OtpVerificationResult;
import com.eaa.recruit.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PasswordResetService {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService      otpService;

    public PasswordResetService(UserRepository userRepository,
                                PasswordEncoder passwordEncoder,
                                OtpService otpService) {
        this.userRepository  = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.otpService      = otpService;
    }

    /** Silently no-op for unknown emails — prevents user enumeration. */
    public void sendResetOtp(ForgotPasswordRequest request) {
        if (!userRepository.existsByEmail(request.email())) return;
        otpService.sendOtp(request.email());
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        OtpVerificationResult result = otpService.verify(request.email(), request.otp());
        if (!result.isSuccess()) {
            throw new BusinessException(result.message());
        }

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException("Account not found for: " + request.email()));

        user.changePassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }
}
