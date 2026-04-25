package com.eaa.recruit.dto.application;

import com.eaa.recruit.entity.Application;
import com.eaa.recruit.entity.ApplicationStatus;

import java.time.Instant;

public record ApplicationResponse(
        Long              id,
        Long              jobId,
        String            jobTitle,
        ApplicationStatus status,
        Double            cvRelevanceScore,
        Double            examScore,
        Boolean           hardFilterPassed,
        Double            finalScore,
        Instant           submittedAt,
        String            interviewSlotDate,
        String            interviewSlotTime
) {
    public static ApplicationResponse from(Application app) {
        String slotDate = app.getInterviewSlot() != null
                ? app.getInterviewSlot().getSlotDate().toString() : null;
        String slotTime = app.getInterviewSlot() != null
                ? app.getInterviewSlot().getStartTime().toString() : null;

        return new ApplicationResponse(
                app.getId(),
                app.getJob().getId(),
                app.getJob().getTitle(),
                app.getStatus(),
                app.getCvRelevanceScore(),
                app.getExamScore(),
                app.getHardFilterPassed(),
                app.getFinalScore(),
                app.getSubmittedAt(),
                slotDate,
                slotTime
        );
    }
}
