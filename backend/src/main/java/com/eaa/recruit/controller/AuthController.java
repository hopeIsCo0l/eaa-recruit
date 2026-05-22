package com.eaa.recruit.controller;

import com.eaa.recruit.dto.ApiResponse;
import com.eaa.recruit.dto.auth.CandidateRegistrationRequest;
import com.eaa.recruit.dto.auth.ChangePasswordRequest;
import com.eaa.recruit.dto.auth.ForgotPasswordRequest;
import com.eaa.recruit.dto.auth.LoginRequest;
import com.eaa.recruit.dto.auth.LoginResponse;
import com.eaa.recruit.dto.auth.OtpVerificationRequest;
import com.eaa.recruit.dto.auth.RegistrationResponse;
import com.eaa.recruit.dto.auth.ResendOtpRequest;
import com.eaa.recruit.dto.auth.ResetPasswordRequest;
import com.eaa.recruit.ratelimit.RateLimitProperties;
import com.eaa.recruit.ratelimit.RateLimitService;
import com.eaa.recruit.security.AuthenticatedUser;
import com.eaa.recruit.service.CandidateRegistrationService;
import com.eaa.recruit.service.LoginService;
import com.eaa.recruit.service.PasswordResetService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    private final RateLimitService             rateLimit;
    private final RateLimitProperties          rateLimitProps;

    public AuthController(CandidateRegistrationService registrationService,
                          LoginService loginService,
                          PasswordResetService passwordResetService,
                          RateLimitService rateLimit,
                          RateLimitProperties rateLimitProps) {
        this.registrationService  = registrationService;
        this.loginService         = loginService;
        this.passwordResetService = passwordResetService;
        this.rateLimit            = rateLimit;
        this.rateLimitProps       = rateLimitProps;
    }

    private static String clientIp(HttpServletRequest req) {
        String xff = req.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            int comma = xff.indexOf(',');
            return (comma > 0 ? xff.substring(0, comma) : xff).trim();
        }
        return req.getRemoteAddr();
    }

    /**
     * POST /api/v1/auth/register/candidate
     *
     * Accepts: fullName, email, password, phone
     * Creates an INACTIVE candidate account and dispatches an OTP.
     */
    @PostMapping("/register/candidate")
    public ResponseEntity<ApiResponse<RegistrationResponse>> registerCandidate(
            @Valid @RequestBody CandidateRegistrationRequest request,
            HttpServletRequest http) {

        rateLimit.check("register", clientIp(http),    rateLimitProps.getRegister());
        rateLimit.check("otp-send", request.email(),   rateLimitProps.getOtpSend());

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

        rateLimit.check("otp-verify", request.email(), rateLimitProps.getOtpVerify());

        registrationService.verifyOtp(request.email(), request.otp());
        return ResponseEntity.ok(ApiResponse.success("Account verified successfully"));
    }

    /**
     * POST /api/v1/auth/resend-otp
     *
     * Accepts: email
     * Invalidates any prior OTP and dispatches a fresh code.
     */
    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<Void>> resendOtp(
            @Valid @RequestBody ResendOtpRequest request) {

        rateLimit.check("otp-resend", request.email(), rateLimitProps.getOtpResend());

        registrationService.resendOtp(request.email());
        return ResponseEntity.ok(ApiResponse.success("A new verification code has been sent"));
    }

    /**
     * POST /api/v1/auth/login
     *
     * Accepts: email, password
     * Returns a signed JWT for use in subsequent authenticated requests.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest http) {

        rateLimit.check("login", clientIp(http),    rateLimitProps.getLogin());
        rateLimit.check("login", request.email(),   rateLimitProps.getLogin());

        return ResponseEntity.ok(ApiResponse.success(loginService.login(request)));
    }

    /**
     * POST /api/v1/auth/forgot-password
     *
     * Sends a password-reset OTP. Always returns 200 to prevent user enumeration.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request,
            HttpServletRequest http) {

        rateLimit.check("forgot-password", clientIp(http),     rateLimitProps.getForgotPassword());
        rateLimit.check("forgot-password", request.email(),    rateLimitProps.getForgotPassword());

        passwordResetService.sendResetOtp(request);
        return ResponseEntity.ok(ApiResponse.success("If that email exists, a reset code has been sent"));
    }

    /**
     * POST /api/v1/auth/change-password
     *
     * Logged-in user changes their own password. Verifies current password first.
     */
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {

        passwordResetService.changePassword(principal.id(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
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
