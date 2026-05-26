package com.eaa.recruit.dto.job;

import jakarta.validation.constraints.NotBlank;

public record ChangeJobStatusRequest(
        @NotBlank(message = "Action is required")
        String action  // "publish", "close", "archive"
) {}
