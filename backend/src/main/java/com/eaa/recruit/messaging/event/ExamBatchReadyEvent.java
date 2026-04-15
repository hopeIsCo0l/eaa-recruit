package com.eaa.recruit.messaging.event;

import java.time.Instant;
import java.util.List;

/**
 * Published to EXAM_BATCH_READY when a recruiter authorises an exam batch.
 * Consumed by the Go Exam Engine to initialise concurrent exam sessions.
 */
public record ExamBatchReadyEvent(
        Long        batchId,
        Long        jobId,
        List<Long>  candidateIds,
        Integer     durationMinutes,
        Instant     scheduledAt,
        Instant     occurredAt
) {
    public static ExamBatchReadyEvent of(Long batchId, Long jobId,
                                         List<Long> candidateIds,
                                         Integer durationMinutes,
                                         Instant scheduledAt) {
        return new ExamBatchReadyEvent(batchId, jobId, candidateIds,
                                       durationMinutes, scheduledAt, Instant.now());
    }
}
