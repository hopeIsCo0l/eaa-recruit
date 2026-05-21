package com.eaa.recruit.dto.internal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.time.Instant;

/**
 * Body of POST /api/v1/internal/exam-completed — sent by the Go exam engine over HTTP.
 * Fields are strings because exam-engine uses string IDs everywhere; the controller parses them.
 */
public record ExamCompletedRequest(

        @NotNull(message = "candidateId is required")
        String candidateId,

        @NotNull(message = "jobId is required")
        String jobId,

        String examId,

        @NotNull(message = "examScore is required")
        @DecimalMin(value = "0.0", message = "examScore must be >= 0")
        @DecimalMax(value = "100.0", message = "examScore must be <= 100")
        Double examScore,

        @NotNull(message = "completedAt is required")
        @PastOrPresent(message = "completedAt must not be in the future")
        Instant completedAt
) {}
