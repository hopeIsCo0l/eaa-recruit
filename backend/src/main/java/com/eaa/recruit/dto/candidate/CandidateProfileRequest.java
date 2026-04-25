package com.eaa.recruit.dto.candidate;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CandidateProfileRequest(
        @NotNull @Min(100) @Max(250)
        Integer heightCm,

        @NotNull @Min(30) @Max(300)
        Integer weightKg,

        @NotNull @Size(min = 2, max = 100)
        String degree,

        @NotNull @Size(min = 2, max = 150)
        String fieldOfStudy,

        @NotNull @Min(1970) @Max(2100)
        Integer graduationYear,

        @Size(max = 20)
        String phoneNumber
) {}
