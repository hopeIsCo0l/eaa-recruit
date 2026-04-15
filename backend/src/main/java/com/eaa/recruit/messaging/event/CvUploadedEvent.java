package com.eaa.recruit.messaging.event;

import java.time.Instant;

/**
 * Published to CV_UPLOADED after a candidate's CV is stored.
 * Consumed by the Python AI service for screening.
 */
public record CvUploadedEvent(
        Long   applicationId,
        Long   candidateId,
        Long   jobId,
        String cvStoragePath,
        Instant occurredAt
) {
    public static CvUploadedEvent of(Long applicationId, Long candidateId,
                                     Long jobId, String cvStoragePath) {
        return new CvUploadedEvent(applicationId, candidateId, jobId,
                                   cvStoragePath, Instant.now());
    }
}
