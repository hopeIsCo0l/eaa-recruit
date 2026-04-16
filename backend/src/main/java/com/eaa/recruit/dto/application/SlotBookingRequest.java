package com.eaa.recruit.dto.application;

import jakarta.validation.constraints.NotNull;

public record SlotBookingRequest(

        @NotNull(message = "slotId is required")
        Long slotId
) {}
