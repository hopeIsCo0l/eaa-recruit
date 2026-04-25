package com.eaa.recruit.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank @Email
        String email,

        @NotBlank
        String otp,

        @NotBlank
        @Size(min = 8, max = 72, message = "Password must be 8-72 characters")
        String newPassword
) {}
