package com.eaa.recruit.controller;

import com.eaa.recruit.dto.ApiResponse;
import com.eaa.recruit.dto.auth.CandidateRegistrationRequest;
import com.eaa.recruit.dto.auth.OtpVerificationRequest;
import com.eaa.recruit.dto.auth.RegistrationResponse;
import com.eaa.recruit.service.CandidateRegistrationService;
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

    public AuthController(CandidateRegistrationService registrationService) {
        this.registrationService = registrationService;
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
}
