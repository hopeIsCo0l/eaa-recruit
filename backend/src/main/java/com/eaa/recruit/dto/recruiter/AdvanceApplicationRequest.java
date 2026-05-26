package com.eaa.recruit.dto.recruiter;

import jakarta.validation.constraints.NotBlank;

public record AdvanceApplicationRequest(
        @NotBlank(message = "Target status is required")
        String targetStatus,   // SHORTLISTED, SELECTED, REJECTED, WAITLISTED

        String notes           // optional decision notes
) {}
