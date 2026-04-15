package com.eaa.recruit.messaging;

import com.eaa.recruit.messaging.event.CvUploadedEvent;
import com.eaa.recruit.messaging.event.ExamBatchReadyEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
public class KafkaEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(KafkaEventPublisher.class);

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public KafkaEventPublisher(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    /**
     * Publishes a CV_UPLOADED event.
     * Key = applicationId (string) — ensures all events for the same application
     * land on the same partition, preserving order.
     */
    public void publishCvUploaded(CvUploadedEvent event) {
        String key = String.valueOf(event.applicationId());
        send(KafkaTopics.CV_UPLOADED, key, event);
    }

    /**
     * Publishes an EXAM_BATCH_READY event.
     * Key = batchId (string).
     */
    public void publishExamBatchReady(ExamBatchReadyEvent event) {
        String key = String.valueOf(event.batchId());
        send(KafkaTopics.EXAM_BATCH_READY, key, event);
    }

    // ── Internal send with structured logging ────────────────────────────────

    private void send(String topic, String key, Object payload) {
        CompletableFuture<SendResult<String, Object>> future =
                kafkaTemplate.send(topic, key, payload);

        future.whenComplete((result, ex) -> {
            if (ex != null) {
                log.error("Failed to publish event to topic='{}' key='{}' payload='{}': {}",
                        topic, key, payload, ex.getMessage(), ex);
            } else {
                log.debug("Published event to topic='{}' partition={} offset={} key='{}'",
                        topic,
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset(),
                        key);
            }
        });
    }
}
