package com.eaa.recruit.dto.admin;

import java.util.List;
import java.util.Map;

/**
 * FR-38: System health snapshot. Each sub-resource carries a {@link Status}
 * level so dashboards can alert without re-interpreting raw metrics.
 */
public record SystemHealthResponse(
        Status           overall,
        DatabaseHealth   database,
        RedisHealth      redis,
        KafkaHealth      kafka,
        long             uptimeSeconds
) {

    public enum Status { OK, WARNING, CRITICAL }

    public record DatabaseHealth(
            Status status,
            boolean up,
            int activeConnections,
            int idleConnections,
            int totalConnections,
            int maxPoolSize) {}

    public record RedisHealth(
            Status status,
            boolean up,
            Long   keyspaceHits,
            Long   keyspaceMisses,
            Double hitRatio,
            String details) {}

    public record KafkaHealth(
            Status          status,
            boolean         up,
            int             brokerCount,
            long            totalConsumerLag,
            List<TopicLag>  topicLags,
            String          details) {

        public record TopicLag(String topic, String consumerGroup, Map<Integer, Long> partitionLag, long total) {}
    }
}
