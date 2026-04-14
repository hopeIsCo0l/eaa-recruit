import json
import logging
import threading
from typing import Callable

from kafka import KafkaConsumer
from kafka.errors import KafkaError
from pydantic import ValidationError

from src.config import settings
from src.models.events import CvUploadedEvent, ExamSubmittedEvent

logger = logging.getLogger(__name__)

TOPIC_CV_UPLOADED = "CV_UPLOADED"
TOPIC_EXAM_SUBMITTED = "EXAM_SUBMITTED"
TOPIC_DEAD_LETTER = "AI_DEAD_LETTER"

_consumer_thread: threading.Thread | None = None


def _make_consumer(topics: list[str]) -> KafkaConsumer:
    return KafkaConsumer(
        *topics,
        bootstrap_servers=settings.kafka_bootstrap_servers,
        group_id="ai-service",
        auto_offset_reset="earliest",
        enable_auto_commit=False,
        value_deserializer=lambda b: b,
    )


def _make_dlq_producer():
    from kafka import KafkaProducer
    return KafkaProducer(
        bootstrap_servers=settings.kafka_bootstrap_servers,
        value_serializer=lambda v: json.dumps(v).encode(),
    )


def _send_to_dlq(producer, topic: str, raw: bytes, reason: str) -> None:
    try:
        producer.send(TOPIC_DEAD_LETTER, {"source_topic": topic, "reason": reason, "payload": raw.decode(errors="replace")})
        producer.flush()
    except KafkaError:
        logger.exception("Failed to send message to dead-letter queue")


def _process_cv_uploaded(event: CvUploadedEvent) -> None:
    logger.info("CV_UPLOADED received: applicationId=%s", event.applicationId)
    from src.utils.text_extractor import extract_text
    from src.utils.nlp_pipeline import preprocess
    from src.utils.pii_masker import mask

    try:
        raw_text = extract_text(event.cvFilePath)
    except Exception as exc:
        logger.error("Text extraction failed for applicationId=%s: %s", event.applicationId, exc)
        # FR-21 callback with failure status wired here in FR-66+
        return

    # FR-75: mask PII before any ML processing or caching
    mask_result = mask(raw_text)
    if mask_result.detections:
        logger.info(
            "PII detections for applicationId=%s: %s",
            event.applicationId,
            ", ".join(f"{lbl}×{cnt}" for lbl, cnt in mask_result.detections),
        )
    # raw_text kept for display-only use (e.g. feedback PDF); masked_text goes to ML
    masked_text = mask_result.masked_text

    preprocessed = preprocess(masked_text)
    logger.info("CV preprocessed: applicationId=%s chars=%d", event.applicationId, len(preprocessed))
    # FR-66 similarity scoring wired here


def _process_exam_submitted(event: ExamSubmittedEvent) -> None:
    logger.info("EXAM_SUBMITTED received: applicationId=%s", event.applicationId)
    # FR-70+ short-answer grading pipeline wired here
    # Placeholder until FR-70/FR-71 are implemented


_HANDLERS: dict[str, tuple[type, Callable]] = {
    TOPIC_CV_UPLOADED: (CvUploadedEvent, _process_cv_uploaded),
    TOPIC_EXAM_SUBMITTED: (ExamSubmittedEvent, _process_exam_submitted),
}


def _consume_loop() -> None:
    consumer = _make_consumer([TOPIC_CV_UPLOADED, TOPIC_EXAM_SUBMITTED])
    dlq = _make_dlq_producer()
    logger.info("Kafka consumer started, topics: %s, %s", TOPIC_CV_UPLOADED, TOPIC_EXAM_SUBMITTED)

    for message in consumer:
        topic = message.topic
        raw: bytes = message.value
        try:
            payload = json.loads(raw)
            model_cls, handler = _HANDLERS[topic]
            event = model_cls(**payload)
            handler(event)
            consumer.commit()
        except (json.JSONDecodeError, ValidationError, KeyError) as exc:
            logger.error("Malformed event on topic %s: %s", topic, exc)
            _send_to_dlq(dlq, topic, raw, str(exc))
            consumer.commit()
        except Exception:
            logger.exception("Unhandled error processing event on topic %s — offset NOT committed", topic)


def start_consumer() -> None:
    global _consumer_thread
    _consumer_thread = threading.Thread(target=_consume_loop, daemon=True, name="kafka-consumer")
    _consumer_thread.start()
    logger.info("Kafka consumer thread started")
