package com.eaa.recruit.dto.job;

import com.eaa.recruit.entity.JobPostingStatus;

import java.time.LocalDate;

public record CreateJobResponse(
        Long id,
        String title,
        JobPostingStatus status,
        LocalDate openDate,
        LocalDate closeDate,
        LocalDate examDate
) {}
