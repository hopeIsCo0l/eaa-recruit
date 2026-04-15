package com.eaa.recruit.dto.availability;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record AvailabilitySlotBatchRequest(

        @NotEmpty(message = "At least one slot is required")
        @Valid
        List<AvailabilitySlotRequest> slots
) {}
