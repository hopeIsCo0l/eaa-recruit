package com.eaa.recruit.dto.admin;

import java.time.Instant;

public record AiModelResponse(
        Long id,
        String modelVersion,
        String description,
        boolean active,
        Instant activatedAt,
        Instant createdAt
) {}
