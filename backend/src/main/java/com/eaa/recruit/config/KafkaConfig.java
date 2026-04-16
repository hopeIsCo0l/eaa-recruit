package com.eaa.recruit.config;

import com.eaa.recruit.messaging.KafkaTopics;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Value("${spring.kafka.producer.acks:all}")
    private String acks;

    @Value("${spring.kafka.producer.retries:3}")
    private int retries;

    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        // Strongest durability: wait for all in-sync replicas to ack
        props.put(ProducerConfig.ACKS_CONFIG, acks);
        // Retry on transient broker errors
        props.put(ProducerConfig.RETRIES_CONFIG, retries);
        props.put(ProducerConfig.RETRY_BACKOFF_MS_CONFIG, 500);
        // Idempotent producer: exactly-once delivery per session
        props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
        // Include type header so consumers can deserialise without explicit type mapping
        props.put(JsonSerializer.ADD_TYPE_INFO_HEADERS, true);
        return new DefaultKafkaProducerFactory<>(props);
    }

    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }

    // ── Topic declarations (auto-created on startup if broker allows) ────────

    @Bean
    public NewTopic cvUploadedTopic() {
        return TopicBuilder.name(KafkaTopics.CV_UPLOADED)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic examBatchReadyTopic() {
        return TopicBuilder.name(KafkaTopics.EXAM_BATCH_READY)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic examCompletedTopic() {
        return TopicBuilder.name(KafkaTopics.EXAM_COMPLETED)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic examSubmittedTopic() {
        return TopicBuilder.name(KafkaTopics.EXAM_SUBMITTED)
                .partitions(3)
                .replicas(1)
                .build();
    }

    // FR-38: admin client for health monitoring
    @Bean(destroyMethod = "close")
    public AdminClient kafkaAdminClient() {
        Map<String, Object> config = new HashMap<>();
        config.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        config.put(AdminClientConfig.REQUEST_TIMEOUT_MS_CONFIG, 5000);
        config.put(AdminClientConfig.DEFAULT_API_TIMEOUT_MS_CONFIG, 5000);
        return AdminClient.create(config);
    }
}
