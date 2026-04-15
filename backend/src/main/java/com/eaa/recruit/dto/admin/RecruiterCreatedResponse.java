package com.eaa.recruit.dto.admin;

public record RecruiterCreatedResponse(
        Long   userId,
        String email,
        String fullName,
        String message
) {}
