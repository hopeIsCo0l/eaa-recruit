package com.eaa.recruit.dto.auth;

public record LoginResponse(
        String token,
        Long   userId,
        String email,
        String role,
        String fullName
) {}
