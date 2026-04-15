package com.eaa.recruit.dto.auth;

public record RegistrationResponse(
        Long userId,
        String email,
        String message
) {}
