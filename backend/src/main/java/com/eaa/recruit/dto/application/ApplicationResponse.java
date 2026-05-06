package com.eaa.recruit.dto.application;

import com.eaa.recruit.entity.ApplicationStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

public record ApplicationResponse(
        Long              id,
        Long              jobId,
        String            jobTitle,
        String            candidateName,
        ApplicationStatus status,
        Double            cvRelevanceScore,
        Double            examScore,
        Boolean           hardFilterPassed,
        Double            finalScore,
        Instant           submittedAt,
        LocalDate         interviewSlotDate,
        LocalTime         interviewSlotTime
) {}
