package com.eaa.recruit.messaging;

import com.eaa.recruit.messaging.event.CvUploadedEvent;
import com.eaa.recruit.messaging.event.ExamBatchReadyEvent;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.listener.ContainerProperties;
import org.springframework.kafka.listener.KafkaMessageListenerContainer;
import org.springframework.kafka.listener.MessageListener;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.kafka.test.EmbeddedKafkaBroker;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.kafka.test.utils.ContainerTestUtils;
import org.springframework.kafka.test.utils.KafkaTestUtils;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@DirtiesContext
@EmbeddedKafka(
    partitions = 1,
    topics = {KafkaTopics.CV_UPLOADED, KafkaTopics.EXAM_BATCH_READY},
    brokerProperties = {
        "listeners=PLAINTEXT://localhost:${random.int[10000,20000]}",
        "auto.create.topics.enable=true"
    }
)
class KafkaEventPublisherTest {

    @Autowired KafkaEventPublisher publisher;
    @Autowired EmbeddedKafkaBroker embeddedKafka;

    private KafkaMessageListenerContainer<String, Object> container;
    private BlockingQueue<ConsumerRecord<String, Object>> records;

    @BeforeEach
    void setUp() {
        records = new LinkedBlockingQueue<>();

        Map<String, Object> consumerProps = KafkaTestUtils.consumerProps(
                "test-group", "true", embeddedKafka);
        consumerProps.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG,
                StringDeserializer.class);
        consumerProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG,
                JsonDeserializer.class);
        consumerProps.put(JsonDeserializer.TRUSTED_PACKAGES, "com.eaa.recruit.*");
        consumerProps.put(JsonDeserializer.USE_TYPE_INFO_HEADERS, true);

        DefaultKafkaConsumerFactory<String, Object> cf =
                new DefaultKafkaConsumerFactory<>(consumerProps);

        ContainerProperties containerProps = new ContainerProperties(
                KafkaTopics.CV_UPLOADED, KafkaTopics.EXAM_BATCH_READY);
        container = new KafkaMessageListenerContainer<>(cf, containerProps);
        container.setupMessageListener((MessageListener<String, Object>) records::add);
        container.start();

        ContainerTestUtils.waitForAssignment(container, embeddedKafka.getPartitionsPerTopic());
    }

    @AfterEach
    void tearDown() {
        container.stop();
    }

    @Test
    void publishCvUploaded_messageArrivesOnTopic() throws InterruptedException {
        CvUploadedEvent event = CvUploadedEvent.of(10L, 5L, 3L, "/storage/cv/10.pdf");

        publisher.publishCvUploaded(event);

        ConsumerRecord<String, Object> received = records.poll(5, TimeUnit.SECONDS);
        assertThat(received).isNotNull();
        assertThat(received.topic()).isEqualTo(KafkaTopics.CV_UPLOADED);
        assertThat(received.key()).isEqualTo("10");

        CvUploadedEvent payload = (CvUploadedEvent) received.value();
        assertThat(payload.applicationId()).isEqualTo(10L);
        assertThat(payload.candidateId()).isEqualTo(5L);
        assertThat(payload.jobId()).isEqualTo(3L);
        assertThat(payload.cvStoragePath()).isEqualTo("/storage/cv/10.pdf");
        assertThat(payload.occurredAt()).isNotNull();
    }

    @Test
    void publishExamBatchReady_messageArrivesOnTopic() throws InterruptedException {
        ExamBatchReadyEvent event = ExamBatchReadyEvent.of(
                99L, 7L, List.of(1L, 2L, 3L), 60, Instant.now());

        publisher.publishExamBatchReady(event);

        ConsumerRecord<String, Object> received = records.poll(5, TimeUnit.SECONDS);
        assertThat(received).isNotNull();
        assertThat(received.topic()).isEqualTo(KafkaTopics.EXAM_BATCH_READY);
        assertThat(received.key()).isEqualTo("99");

        ExamBatchReadyEvent payload = (ExamBatchReadyEvent) received.value();
        assertThat(payload.batchId()).isEqualTo(99L);
        assertThat(payload.jobId()).isEqualTo(7L);
        assertThat(payload.candidateIds()).containsExactly(1L, 2L, 3L);
        assertThat(payload.durationMinutes()).isEqualTo(60);
    }

    @Test
    void cvUploadedKey_isApplicationId() throws InterruptedException {
        CvUploadedEvent event = CvUploadedEvent.of(42L, 1L, 1L, "/cv/42.pdf");
        publisher.publishCvUploaded(event);

        ConsumerRecord<String, Object> received = records.poll(5, TimeUnit.SECONDS);
        assertThat(received).isNotNull();
        assertThat(received.key()).isEqualTo("42");
    }

    @Test
    void examBatchKey_isBatchId() throws InterruptedException {
        ExamBatchReadyEvent event = ExamBatchReadyEvent.of(
                77L, 1L, List.of(10L), 90, Instant.now());
        publisher.publishExamBatchReady(event);

        ConsumerRecord<String, Object> received = records.poll(5, TimeUnit.SECONDS);
        assertThat(received).isNotNull();
        assertThat(received.key()).isEqualTo("77");
    }
}
