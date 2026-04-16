package com.eaa.recruit.dto.application;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AiScoreCallbackRequest(

        @NotNull(message = "cvRelevanceScore is required")
        @DecimalMin(value = "0.0", message = "cvRelevanceScore must be >= 0")
        @DecimalMax(value = "1.0", message = "cvRelevanceScore must be <= 1")
        Double cvRelevanceScore,

        @NotBlank(message = "xaiReportUrl is required")
        String xaiReportUrl
) {}
