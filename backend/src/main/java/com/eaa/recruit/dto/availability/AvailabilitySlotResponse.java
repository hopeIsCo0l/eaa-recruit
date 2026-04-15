package com.eaa.recruit.dto.availability;

import java.time.LocalDate;
import java.time.LocalTime;

public record AvailabilitySlotResponse(
        Long      id,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        boolean   booked
) {}
