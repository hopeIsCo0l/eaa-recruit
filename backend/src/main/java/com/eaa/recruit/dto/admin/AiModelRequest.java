package com.eaa.recruit.dto.admin;

import jakarta.validation.constraints.NotBlank;

import java.time.Instant;

public record AiModelRequest(

        @NotBlank(message = "modelVersion is required")
        String modelVersion,

        String description,

        Instant activatedAt
) {}
