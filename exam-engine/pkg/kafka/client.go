package kafka

import (
	"log"

	"github.com/EAA-recruit/exam-engine/internal/config"
	"github.com/IBM/sarama"
)

// NewProducer creates a synchronous Kafka producer with retries (FR-59).
func NewProducer(cfg *config.Config) sarama.SyncProducer {
	saramaCfg := sarama.NewConfig()
	saramaCfg.Producer.Return.Successes = true
	saramaCfg.Producer.RequiredAcks = sarama.WaitForAll
	saramaCfg.Producer.Retry.Max = 5

	producer, err := sarama.NewSyncProducer([]string{cfg.KafkaBroker}, saramaCfg)
	if err != nil {
		log.Fatalf("Kafka producer init failed: %v", err)
	}
	log.Printf("Kafka producer connected: %s", cfg.KafkaBroker)
	return producer
}

// NewConsumerGroup creates a Kafka consumer group for the exam engine (FR-58).
func NewConsumerGroup(cfg *config.Config, groupID string) sarama.ConsumerGroup {
	saramaCfg := sarama.NewConfig()
	saramaCfg.Consumer.Group.Rebalance.GroupStrategies = []sarama.BalanceStrategy{
		sarama.NewBalanceStrategyRoundRobin(),
	}
	saramaCfg.Consumer.Offsets.Initial = sarama.OffsetNewest

	group, err := sarama.NewConsumerGroup([]string{cfg.KafkaBroker}, groupID, saramaCfg)
	if err != nil {
		log.Fatalf("Kafka consumer group init failed: %v", err)
	}
	log.Printf("Kafka consumer group '%s' connected: %s", groupID, cfg.KafkaBroker)
	return group
}
