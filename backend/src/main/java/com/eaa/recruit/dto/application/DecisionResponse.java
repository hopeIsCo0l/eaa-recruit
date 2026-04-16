package com.eaa.recruit.dto.application;

import com.eaa.recruit.entity.ApplicationStatus;

import java.time.Instant;

public record DecisionResponse(
        Long applicationId,
        ApplicationStatus status,
        String notes,
        Instant decidedAt
) {}
