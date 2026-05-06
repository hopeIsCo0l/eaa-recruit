package com.eaa.recruit.dto.admin;

import java.time.Instant;

public record AdminUserResponse(
        Long    id,
        String  email,
        String  fullName,
        String  role,
        boolean active,
        Instant createdAt
) {}
