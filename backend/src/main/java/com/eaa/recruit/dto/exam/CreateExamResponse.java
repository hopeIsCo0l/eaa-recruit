package com.eaa.recruit.dto.exam;

public record CreateExamResponse(
        Long    examId,
        Long    jobId,
        String  title,
        Integer durationMinutes,
        int     questionCount
) {}
