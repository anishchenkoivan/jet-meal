import json
import logging
import threading
from dataclasses import dataclass, field
from typing import Any

from kafka import KafkaConsumer
from pydantic import ValidationError

from app.config import Settings
from app.order_changed_message import OrderChangedMessage
from app.order_notification_text import format_order_changed_telegram
from app.storage import NotificationContextRepository
from app.telegram_notifier import TelegramNotifierError, extract_telegram_chat_id, send_message

logger = logging.getLogger(__name__)


@dataclass
class ConsumerState:
    running: bool = False
    processed_messages: int = 0
    failed_messages: int = 0
    telegram_sent: int = 0
    telegram_skipped: int = 0
    telegram_failed: int = 0
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
                "telegram_sent": self.telegram_sent,
                "telegram_skipped": self.telegram_skipped,
                "telegram_failed": self.telegram_failed,
                "last_error": self.last_error,
            }


class NotificationConsumer:
    def __init__(self, settings: Settings, repository: NotificationContextRepository) -> None:
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

            msg = OrderChangedMessage.model_validate(payload)
            logger.debug(
                "OrderChangedMessage event_type=%s order_id=%s user_id=%s",
                msg.event_type,
                msg.order_id,
                msg.user_id,
            )
            self._send_telegram_if_configured(msg)

            snapshot = self._state.snapshot()
            self._state.update(
                processed_messages=snapshot["processed_messages"] + 1,
                last_error=None,
            )
        except ValidationError as exc:
            logger.warning("Kafka payload does not match OrderChangedMessage: %s", exc)
            snapshot = self._state.snapshot()
            self._state.update(
                failed_messages=snapshot["failed_messages"] + 1,
                last_error=str(exc),
            )
        except Exception as exc:
            logger.warning("Failed to process message: %s", exc)
            snapshot = self._state.snapshot()
            self._state.update(
                failed_messages=snapshot["failed_messages"] + 1,
                last_error=str(exc),
            )

    def _send_telegram_if_configured(self, msg: OrderChangedMessage) -> None:
        token = self._settings.telegram_bot_token.strip()
        if not token:
            snap = self._state.snapshot()
            self._state.update(telegram_skipped=snap["telegram_skipped"] + 1)
            logger.debug("TELEGRAM_BOT_TOKEN not set; skip Telegram for user_id=%s", msg.user_id)
            return

        doc = self._repository.get(msg.user_id)
        if not doc:
            snap = self._state.snapshot()
            self._state.update(telegram_skipped=snap["telegram_skipped"] + 1)
            logger.info("No notification context for user_id=%s; skip Telegram", msg.user_id)
            return

        chat_id = extract_telegram_chat_id(doc.get("channels"))
        if not chat_id:
            snap = self._state.snapshot()
            self._state.update(telegram_skipped=snap["telegram_skipped"] + 1)
            logger.info("No telegram.chat_id in context for user_id=%s; skip Telegram", msg.user_id)
            return

        text = format_order_changed_telegram(msg)
        try:
            send_message(
                bot_token=token,
                chat_id=chat_id,
                text=text,
                timeout_sec=self._settings.telegram_http_timeout_sec,
            )
            snap = self._state.snapshot()
            self._state.update(telegram_sent=snap["telegram_sent"] + 1)
            logger.info("Telegram sent for user_id=%s order_id=%s", msg.user_id, msg.order_id)
        except TelegramNotifierError as exc:
            snap = self._state.snapshot()
            self._state.update(
                telegram_failed=snap["telegram_failed"] + 1,
                last_error=str(exc),
            )
            logger.warning("Telegram send failed for user_id=%s: %s", msg.user_id, exc)
