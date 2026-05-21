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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CandidateRegistrationService {

    private static final Logger log = LoggerFactory.getLogger(CandidateRegistrationService.class);

    private final UserRepository   userRepository;
    private final PasswordEncoder  passwordEncoder;
    private final OtpService       otpService;
    private final AuditLogService  auditLogService;

    public CandidateRegistrationService(UserRepository userRepository,
                                        PasswordEncoder passwordEncoder,
                                        OtpService otpService,
                                        AuditLogService auditLogService) {
        this.userRepository  = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.otpService      = otpService;
        this.auditLogService = auditLogService;
    }

    /**
     * Registers a new candidate account in INACTIVE state and dispatches an OTP.
     *
     * @throws ConflictException if email already exists
     * @throws BusinessException if OTP dispatch fails (Redis / notification unavailable)
     */
    @Transactional
    public RegistrationResponse register(CandidateRegistrationRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email is already registered: " + request.email());
        }

        String passwordHash = passwordEncoder.encode(request.password());
        User user = User.create(request.email(), passwordHash, Role.CANDIDATE, request.fullName());
        user = userRepository.save(user);

        log.info("Candidate account created id={} email='{}'", user.getId(), user.getEmail());
        auditLogService.log("USER", user.getId(), null, "REGISTERED", user, null);

        // Send OTP to email; phone support is future work
        boolean sent = otpService.sendOtp(request.email());
        if (!sent) {
            // Roll back the user row — can't leave an INACTIVE account with no way to verify
            throw new BusinessException(
                    "Registration failed: could not send verification code. Please try again.");
        }

        return new RegistrationResponse(
                user.getId(),
                user.getEmail(),
                "Registration successful. A verification code has been sent to " + request.email()
        );
    }

    /**
     * Issues a fresh OTP, invalidating any prior one. User must already exist and be INACTIVE.
     *
     * @throws BusinessException if no pending account is found or notification dispatch fails
     */
    public void resendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("No pending registration found for: " + email));

        if (user.isActive()) {
            throw new BusinessException("Account is already verified");
        }

        boolean sent = otpService.resendOtp(email);
        if (!sent) {
            throw new BusinessException(
                    "Could not send verification code. Please try again later.");
        }
        log.info("OTP resent for email='{}'", email);
    }

    /**
     * Verifies the OTP and activates the candidate account.
     *
     * @throws BusinessException for expired / invalid / unavailable OTP
     */
    @Transactional
    public void verifyOtp(String email, String otp) {
        OtpVerificationResult result = otpService.verify(email, otp);

        if (!result.isSuccess()) {
            throw new BusinessException(result.message());
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Account not found for email: " + email));

        user.activate();
        log.info("Candidate account activated id={} email='{}'", user.getId(), email);
        auditLogService.log("USER", user.getId(), "INACTIVE", "ACTIVE", user, "Email verified");
    }
}
