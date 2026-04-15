package com.eaa.recruit.dto.exam;

import com.eaa.recruit.entity.QuestionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.List;

public record QuestionRequest(

        @NotNull(message = "type is required")
        QuestionType type,

        @NotBlank(message = "questionText is required")
        String questionText,

        /** Required for MCQ questions; each entry is an answer option. */
        List<String> options,

        /** Zero-based index of the correct option. Required for MCQ. */
        Integer correctAnswer,

        @NotNull(message = "marks is required")
        @Positive(message = "marks must be positive")
        Integer marks
) {}
