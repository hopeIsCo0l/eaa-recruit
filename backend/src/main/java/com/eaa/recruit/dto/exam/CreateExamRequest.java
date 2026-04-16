package com.eaa.recruit.dto.exam;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateExamRequest(

        @NotBlank(message = "title is required")
        @Size(max = 255, message = "title must not exceed 255 characters")
        String title,

        @NotNull(message = "durationMinutes is required")
        @Positive(message = "durationMinutes must be positive")
        Integer durationMinutes,

        @NotEmpty(message = "At least one question is required")
        @Valid
        List<QuestionRequest> questions
) {}
