package com.eaa.recruit.service;

import com.eaa.recruit.dto.admin.SystemHealthResponse;
import com.eaa.recruit.dto.admin.SystemHealthResponse.Status;
import com.zaxxer.hikari.HikariDataSource;
import com.zaxxer.hikari.HikariPoolMXBean;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.ConsumerGroupListing;
import org.apache.kafka.clients.admin.ListConsumerGroupOffsetsSpec;
import org.apache.kafka.clients.admin.ListOffsetsResult;
import org.apache.kafka.clients.admin.OffsetSpec;
import org.apache.kafka.clients.consumer.OffsetAndMetadata;
import org.apache.kafka.common.TopicPartition;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.lang.management.ManagementFactory;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * FR-38: System health — DB pool, Redis hit/miss, Kafka consumer lag, uptime.
 */
@Service
public class SystemHealthService {

    private static final Logger log = LoggerFactory.getLogger(SystemHealthService.class);

    // Thresholds — bump via config if they prove noisy in prod.
    private static final double POOL_WARN_RATIO      = 0.75;   // >75% connections used
    private static final double POOL_CRIT_RATIO      = 0.95;
    private static final double REDIS_WARN_HIT_RATIO = 0.70;   // <70% hits
    private static final double REDIS_CRIT_HIT_RATIO = 0.30;
    private static final long   KAFKA_WARN_LAG       = 1_000;
    private static final long   KAFKA_CRIT_LAG       = 10_000;
    private static final long   KAFKA_ADMIN_TIMEOUT_SECS = 3;

    private final HikariDataSource              dataSource;
    private final RedisTemplate<String, String> redisTemplate;
    private final AdminClient                   kafkaAdminClient;

    public SystemHealthService(HikariDataSource dataSource,
                                RedisTemplate<String, String> redisTemplate,
                                AdminClient kafkaAdminClient) {
        this.dataSource       = dataSource;
        this.redisTemplate    = redisTemplate;
        this.kafkaAdminClient = kafkaAdminClient;
    }

    public SystemHealthResponse getHealth() {
        SystemHealthResponse.DatabaseHealth db    = dbHealth();
        SystemHealthResponse.RedisHealth    redis = redisHealth();
        SystemHealthResponse.KafkaHealth    kafka = kafkaHealth();
        long uptime = uptimeSeconds();

        Status overall = worst(db.status(), redis.status(), kafka.status());

        return new SystemHealthResponse(overall, db, redis, kafka, uptime);
    }

    // ── Database ──────────────────────────────────────────────────────────────

    private SystemHealthResponse.DatabaseHealth dbHealth() {
        try {
            HikariPoolMXBean pool = dataSource.getHikariPoolMXBean();
            int active = pool.getActiveConnections();
            int idle   = pool.getIdleConnections();
            int total  = pool.getTotalConnections();
            int max    = dataSource.getMaximumPoolSize();

            double usage = max == 0 ? 0 : (double) active / max;
            Status status = usage >= POOL_CRIT_RATIO ? Status.CRITICAL
                          : usage >= POOL_WARN_RATIO ? Status.WARNING
                          : Status.OK;

            return new SystemHealthResponse.DatabaseHealth(status, true, active, idle, total, max);
        } catch (Exception e) {
            log.warn("DB health check failed: {}", e.getMessage());
            return new SystemHealthResponse.DatabaseHealth(Status.CRITICAL, false, 0, 0, 0, 0);
        }
    }

    // ── Redis ────────────────────────────────────────────────────────────────

    private SystemHealthResponse.RedisHealth redisHealth() {
        try {
            Properties stats = redisTemplate.getConnectionFactory()
                    .getConnection()
                    .serverCommands()
                    .info("stats");

            if (stats == null) {
                return new SystemHealthResponse.RedisHealth(Status.WARNING, true, null, null, null, "stats unavailable");
            }

            Long hits   = parseLong(stats.getProperty("keyspace_hits"));
            Long misses = parseLong(stats.getProperty("keyspace_misses"));
            Double ratio = null;
            Status status = Status.OK;
            if (hits != null && misses != null) {
                long total = hits + misses;
                if (total > 0) {
                    ratio = (double) hits / total;
                    status = ratio < REDIS_CRIT_HIT_RATIO ? Status.CRITICAL
                           : ratio < REDIS_WARN_HIT_RATIO ? Status.WARNING
                           : Status.OK;
                }
            }

            return new SystemHealthResponse.RedisHealth(status, true, hits, misses, ratio,
                    "hits=" + hits + " misses=" + misses);
        } catch (Exception e) {
            log.warn("Redis health check failed: {}", e.getMessage());
            return new SystemHealthResponse.RedisHealth(Status.CRITICAL, false, null, null, null, e.getMessage());
        }
    }

    // ── Kafka ────────────────────────────────────────────────────────────────

    private SystemHealthResponse.KafkaHealth kafkaHealth() {
        try {
            int brokerCount = kafkaAdminClient.describeCluster()
                    .nodes()
                    .get(KAFKA_ADMIN_TIMEOUT_SECS, TimeUnit.SECONDS)
                    .size();

            List<SystemHealthResponse.KafkaHealth.TopicLag> topicLags = computeConsumerLag();
            long totalLag = topicLags.stream().mapToLong(SystemHealthResponse.KafkaHealth.TopicLag::total).sum();

            Status status = totalLag >= KAFKA_CRIT_LAG ? Status.CRITICAL
                          : totalLag >= KAFKA_WARN_LAG ? Status.WARNING
                          : Status.OK;

            return new SystemHealthResponse.KafkaHealth(status, true, brokerCount, totalLag, topicLags,
                    "brokers=" + brokerCount);
        } catch (Exception e) {
            log.warn("Kafka health check failed: {}", e.getMessage());
            return new SystemHealthResponse.KafkaHealth(Status.CRITICAL, false, 0, 0L, List.of(), e.getMessage());
        }
    }

    private List<SystemHealthResponse.KafkaHealth.TopicLag> computeConsumerLag() throws Exception {
        Collection<ConsumerGroupListing> groups = kafkaAdminClient.listConsumerGroups()
                .all().get(KAFKA_ADMIN_TIMEOUT_SECS, TimeUnit.SECONDS);

        if (groups.isEmpty()) {
            return List.of();
        }

        List<String> groupIds = groups.stream().map(ConsumerGroupListing::groupId).toList();

        Map<String, ListConsumerGroupOffsetsSpec> offsetSpecs = groupIds.stream()
                .collect(Collectors.toMap(g -> g, g -> new ListConsumerGroupOffsetsSpec()));

        Map<String, Map<TopicPartition, OffsetAndMetadata>> committed =
                kafkaAdminClient.listConsumerGroupOffsets(offsetSpecs)
                        .all().get(KAFKA_ADMIN_TIMEOUT_SECS, TimeUnit.SECONDS);

        // Dedup partition set across all groups for a single endOffsets round-trip
        Map<TopicPartition, OffsetSpec> endSpec = new HashMap<>();
        committed.values().forEach(map -> map.keySet().forEach(tp -> endSpec.put(tp, OffsetSpec.latest())));

        if (endSpec.isEmpty()) return List.of();

        Map<TopicPartition, ListOffsetsResult.ListOffsetsResultInfo> endOffsets =
                kafkaAdminClient.listOffsets(endSpec)
                        .all().get(KAFKA_ADMIN_TIMEOUT_SECS, TimeUnit.SECONDS);

        List<SystemHealthResponse.KafkaHealth.TopicLag> result = new ArrayList<>();
        for (Map.Entry<String, Map<TopicPartition, OffsetAndMetadata>> entry : committed.entrySet()) {
            String group = entry.getKey();
            Map<String, Map<Integer, Long>> perTopic = new LinkedHashMap<>();

            for (Map.Entry<TopicPartition, OffsetAndMetadata> e : entry.getValue().entrySet()) {
                TopicPartition tp = e.getKey();
                long committedOffset = e.getValue() == null ? 0 : e.getValue().offset();
                long endOffset = endOffsets.containsKey(tp) ? endOffsets.get(tp).offset() : committedOffset;
                long lag = Math.max(0, endOffset - committedOffset);
                perTopic.computeIfAbsent(tp.topic(), k -> new LinkedHashMap<>())
                        .put(tp.partition(), lag);
            }

            for (Map.Entry<String, Map<Integer, Long>> topicEntry : perTopic.entrySet()) {
                long total = topicEntry.getValue().values().stream().mapToLong(Long::longValue).sum();
                result.add(new SystemHealthResponse.KafkaHealth.TopicLag(
                        topicEntry.getKey(), group, topicEntry.getValue(), total));
            }
        }
        return result;
    }

    // ── Misc ─────────────────────────────────────────────────────────────────

    private long uptimeSeconds() {
        return ManagementFactory.getRuntimeMXBean().getUptime() / 1000;
    }

    private static Status worst(Status... statuses) {
        Status worst = Status.OK;
        for (Status s : statuses) {
            if (s == Status.CRITICAL) return Status.CRITICAL;
            if (s == Status.WARNING)  worst = Status.WARNING;
        }
        return worst;
    }

    private static Long parseLong(String value) {
        if (value == null) return null;
        try { return Long.parseLong(value.trim()); }
        catch (NumberFormatException e) { return null; }
    }
}
