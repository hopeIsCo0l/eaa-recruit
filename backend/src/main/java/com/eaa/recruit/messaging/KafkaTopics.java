package com.eaa.recruit.messaging;

/**
 * Central registry of all Kafka topic names.
 * Use these constants everywhere — never inline topic strings.
 */
public final class KafkaTopics {

    private KafkaTopics() {}

    public static final String CV_UPLOADED       = "CV_UPLOADED";
    public static final String EXAM_BATCH_READY  = "EXAM_BATCH_READY";
    public static final String EXAM_COMPLETED    = "EXAM_COMPLETED";
    public static final String EXAM_SUBMITTED    = "EXAM_SUBMITTED";
}
