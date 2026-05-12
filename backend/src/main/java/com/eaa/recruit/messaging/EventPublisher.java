package com.eaa.recruit.messaging;

import com.eaa.recruit.messaging.event.CvUploadedEvent;
import com.eaa.recruit.messaging.event.ExamBatchReadyEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * Fire-and-forget HTTP event delivery to downstream services.
 * Failures are logged and swallowed so the calling transaction is never rolled back.
 */
@Service
public class EventPublisher {

    private static final Logger log = LoggerFactory.getLogger(EventPublisher.class);

    private final RestClient aiServiceClient;
    private final RestClient examEngineClient;
    private final String     internalApiKey;

    public EventPublisher(@Value("${app.events.ai-service-url}") String aiServiceUrl,
                          @Value("${app.events.exam-engine-url}") String examEngineUrl,
                          @Value("${internal.api-key}") String internalApiKey) {
        this.aiServiceClient = RestClient.builder().baseUrl(aiServiceUrl).build();
        this.examEngineClient = RestClient.builder().baseUrl(examEngineUrl).build();
        this.internalApiKey  = internalApiKey;
    }

    public void publishCvUploaded(CvUploadedEvent event) {
        try {
            aiServiceClient.post()
                    .uri("/api/v1/score-cv")
                    .header("X-Internal-Api-Key", internalApiKey)
                    .body(event)
                    .retrieve()
                    .toBodilessEntity();
            log.debug("CV_UPLOADED dispatched applicationId={}", event.applicationId());
        } catch (RestClientException ex) {
            log.error("Failed to dispatch CV_UPLOADED for applicationId={}: {}",
                    event.applicationId(), ex.getMessage(), ex);
        }
    }

    public void publishExamBatchReady(ExamBatchReadyEvent event) {
        try {
            examEngineClient.post()
                    .uri("/api/v1/batches/ready")
                    .header("X-Internal-Api-Key", internalApiKey)
                    .body(event)
                    .retrieve()
                    .toBodilessEntity();
            log.debug("EXAM_BATCH_READY dispatched batchId={}", event.batchId());
        } catch (RestClientException ex) {
            log.error("Failed to dispatch EXAM_BATCH_READY for batchId={}: {}",
                    event.batchId(), ex.getMessage(), ex);
        }
    }
}
