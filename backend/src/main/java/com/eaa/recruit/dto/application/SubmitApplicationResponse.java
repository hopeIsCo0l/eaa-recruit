package com.eaa.recruit.dto.application;

import com.eaa.recruit.entity.ApplicationStatus;

import java.time.Instant;

public record SubmitApplicationResponse(
        Long              id,
        Long              jobId,
        ApplicationStatus status,
        Instant           submittedAt
) {}
