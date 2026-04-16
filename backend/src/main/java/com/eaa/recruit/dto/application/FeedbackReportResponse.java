package com.eaa.recruit.dto.application;

import com.eaa.recruit.entity.ApplicationStatus;

public record FeedbackReportResponse(
        Long applicationId,
        String jobTitle,
        ApplicationStatus status,
        Double cvRelevanceScore,
        Double examScore,
        Boolean hardFilterPassed,
        Double finalScore,
        String xaiReportUrl,
        String decisionNotes
) {}
