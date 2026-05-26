package com.eaa.recruit.dto.recruiter;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

public record RecruiterApplicationResponse(
        Long        id,
        Long        jobId,
        String      jobTitle,
        String      candidateName,
        String      candidateEmail,
        String      status,
        Double      cvRelevanceScore,
        Double      examScore,
        Double      finalScore,
        Boolean     hardFilterPassed,
        Instant     submittedAt,
        LocalDate   interviewDate,
        LocalTime   interviewTime,
        String      xaiReportUrl,
        String      decisionNotes
) {}
