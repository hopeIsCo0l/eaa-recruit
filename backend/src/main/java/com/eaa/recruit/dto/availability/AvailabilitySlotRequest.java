package com.eaa.recruit.dto.availability;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record AvailabilitySlotRequest(

        @NotNull(message = "date is required")
        @FutureOrPresent(message = "date must not be in the past")
        LocalDate date,

        @NotNull(message = "startTime is required")
        LocalTime startTime,

        @NotNull(message = "endTime is required")
        LocalTime endTime
) {}
