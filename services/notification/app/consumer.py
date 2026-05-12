import json
import logging
import threading
from dataclasses import dataclass, field
from typing import Any

from kafka import KafkaConsumer
from pymongo.errors import DuplicateKeyError

from app.config import Settings
from app.storage import NotificationRepository

logger = logging.getLogger(__name__)


@dataclass
class ConsumerState:
    running: bool = False
    processed_messages: int = 0
    failed_messages: int = 0
    last_error: str | None = None
    _lock: threading.Lock = field(default_factory=threading.Lock, repr=False)

    def update(self, **kwargs: Any) -> None:
        with self._lock:
            for key, value in kwargs.items():
                setattr(self, key, value)

    def snapshot(self) -> dict[str, Any]:
        with self._lock:
            return {
                "running": self.running,
                "processed_messages": self.processed_messages,
                "failed_messages": self.failed_messages,
                "last_error": self.last_error,
            }


class NotificationConsumer:
    def __init__(self, settings: Settings, repository: NotificationRepository) -> None:
        self._settings = settings
        self._repository = repository
        self._state = ConsumerState()
        self._stop_event = threading.Event()
        self._thread: threading.Thread | None = None
        self._consumer: KafkaConsumer | None = None

    @property
    def state(self) -> ConsumerState:
        return self._state

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return

        self._stop_event.clear()
        self._thread = threading.Thread(target=self._run_loop, name="kafka-consumer", daemon=True)
        self._thread.start()

    def stop(self) -> None:
        self._stop_event.set()
        if self._thread:
            self._thread.join(timeout=10)
        if self._consumer:
            self._consumer.close()
        self._state.update(running=False)

    def _run_loop(self) -> None:
        try:
            self._consumer = KafkaConsumer(
                self._settings.kafka_topic,
                bootstrap_servers=self._settings.kafka_bootstrap_servers,
                group_id=self._settings.kafka_group_id,
                auto_offset_reset=self._settings.kafka_auto_offset_reset,
                enable_auto_commit=True,
                value_deserializer=lambda x: x.decode("utf-8"),
            )
            self._state.update(running=True, last_error=None)
            logger.info("Kafka consumer started for topic '%s'", self._settings.kafka_topic)

            while not self._stop_event.is_set():
                polled = self._consumer.poll(timeout_ms=self._settings.kafka_poll_timeout_ms)
                if not polled:
                    continue

                for _, records in polled.items():
                    for record in records:
                        self._handle_message(record.value)
        except Exception as exc:
            logger.exception("Kafka consumer crashed")
            self._state.update(running=False, last_error=str(exc))
        finally:
            self._state.update(running=False)

    def _handle_message(self, raw_message: str) -> None:
        try:
            payload = json.loads(raw_message)
            if not isinstance(payload, dict):
                raise ValueError("Message payload must be a JSON object")

            if payload.get("user_id"):
                try:
                    self._repository.save_notification_from_kafka(payload)
                except DuplicateKeyError:
                    logger.warning("Duplicate user notification skipped (event_id)")
            else:
                logger.debug("Kafka message skipped: no user_id for notification projection")
            snapshot = self._state.snapshot()
            self._state.update(processed_messages=snapshot["processed_messages"] + 1, last_error=None)
        except Exception as exc:
            logger.warning("Failed to process message: %s", exc)
            snapshot = self._state.snapshot()
            self._state.update(
                failed_messages=snapshot["failed_messages"] + 1,
                last_error=str(exc),
            )
