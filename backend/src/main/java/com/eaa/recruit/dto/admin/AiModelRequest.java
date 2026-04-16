package com.eaa.recruit.dto.admin;

import jakarta.validation.constraints.NotBlank;

public record AiModelRequest(

        @NotBlank(message = "modelVersion is required")
        String modelVersion,

        String description
) {}
