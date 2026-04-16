package com.eaa.recruit.dto.application;

import com.eaa.recruit.entity.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

public record DecisionRequest(

        @NotNull(message = "decision is required")
        ApplicationStatus decision,

        String notes
) {}
