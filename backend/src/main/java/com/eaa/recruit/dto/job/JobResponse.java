package com.eaa.recruit.dto.job;

import com.eaa.recruit.entity.JobPostingStatus;

import java.time.LocalDate;

public record JobResponse(
        Long             id,
        String           title,
        String           description,
        Integer          minHeightCm,
        Integer          minWeightKg,
        String           requiredDegree,
        LocalDate        openDate,
        LocalDate        closeDate,
        LocalDate        examDate,
        JobPostingStatus status
) {}
