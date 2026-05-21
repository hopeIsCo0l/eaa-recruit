package com.eaa.recruit.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ResendOtpRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        String email
) {}
