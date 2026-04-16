package com.eaa.recruit.dto.recruiter;

public record DashboardEntryResponse(
        Long   jobId,
        String jobTitle,
        Long   totalApplications,
        Long   screeningCount,
        Long   examCount,
        Long   interviewCount,
        Long   decidedCount
) {}
