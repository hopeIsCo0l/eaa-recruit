package com.eaa.recruit.controller;

import com.eaa.recruit.dto.ApiResponse;
import com.eaa.recruit.dto.auth.CandidateRegistrationRequest;
import com.eaa.recruit.dto.auth.ForgotPasswordRequest;
import com.eaa.recruit.dto.auth.LoginRequest;
import com.eaa.recruit.dto.auth.LoginResponse;
import com.eaa.recruit.dto.auth.OtpVerificationRequest;
import com.eaa.recruit.dto.auth.RegistrationResponse;
import com.eaa.recruit.dto.auth.ResetPasswordRequest;
import com.eaa.recruit.service.CandidateRegistrationService;
import com.eaa.recruit.service.LoginService;
import com.eaa.recruit.service.PasswordResetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final CandidateRegistrationService registrationService;
    private final LoginService                 loginService;
    private final PasswordResetService         passwordResetService;

    public AuthController(CandidateRegistrationService registrationService,
                          LoginService loginService,
                          PasswordResetService passwordResetService) {
        this.registrationService  = registrationService;
        this.loginService         = loginService;
        this.passwordResetService = passwordResetService;
    }

    /**
     * POST /api/v1/auth/register/candidate
     *
     * Accepts: fullName, email, password, phone
     * Creates an INACTIVE candidate account and dispatches an OTP.
     */
    @PostMapping("/register/candidate")
    public ResponseEntity<ApiResponse<RegistrationResponse>> registerCandidate(
            @Valid @RequestBody CandidateRegistrationRequest request) {

        RegistrationResponse response = registrationService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", response));
    }

    /**
     * POST /api/v1/auth/verify-otp
     *
     * Accepts: email, otp
     * Activates the account when OTP matches and has not expired.
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verifyOtp(
            @Valid @RequestBody OtpVerificationRequest request) {

        registrationService.verifyOtp(request.email(), request.otp());
        return ResponseEntity.ok(ApiResponse.success("Account verified successfully"));
    }

    /**
     * POST /api/v1/auth/login
     *
     * Accepts: email, password
     * Returns a signed JWT for use in subsequent authenticated requests.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(ApiResponse.success(loginService.login(request)));
    }

    /**
     * POST /api/v1/auth/forgot-password
     *
     * Sends a password-reset OTP. Always returns 200 to prevent user enumeration.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        passwordResetService.sendResetOtp(request);
        return ResponseEntity.ok(ApiResponse.success("If that email exists, a reset code has been sent"));
    }

    /**
     * POST /api/v1/auth/reset-password
     *
     * Verifies OTP and sets a new password.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        passwordResetService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully"));
    }
}
