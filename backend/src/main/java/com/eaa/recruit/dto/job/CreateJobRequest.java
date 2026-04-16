package com.eaa.recruit.dto.job;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record CreateJobRequest(

        @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Title must not exceed 255 characters")
        String title,

        @NotBlank(message = "Description is required")
        String description,

        @NotNull(message = "Minimum height is required")
        @Positive(message = "Minimum height must be positive")
        Integer minHeightCm,

        @NotNull(message = "Minimum weight is required")
        @Positive(message = "Minimum weight must be positive")
        Integer minWeightKg,

        @NotBlank(message = "Required degree is required")
        @Size(max = 100, message = "Required degree must not exceed 100 characters")
        String requiredDegree,

        @NotNull(message = "Open date is required")
        @FutureOrPresent(message = "Open date must not be in the past")
        LocalDate openDate,

        @NotNull(message = "Close date is required")
        LocalDate closeDate,

        @NotNull(message = "Exam date is required")
        LocalDate examDate
) {}
