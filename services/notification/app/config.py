import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    app_host: str = os.getenv("APP_HOST", "0.0.0.0")
    app_port: int = int(os.getenv("APP_PORT", "8080"))
    log_level: str = os.getenv("LOG_LEVEL", "INFO")

    kafka_bootstrap_servers: str = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092")
    kafka_topic: str = os.getenv("KAFKA_TOPIC", "notifications")
    kafka_group_id: str = os.getenv("KAFKA_GROUP_ID", "notification-service")
    kafka_auto_offset_reset: str = os.getenv("KAFKA_AUTO_OFFSET_RESET", "earliest")
    kafka_poll_timeout_ms: int = int(os.getenv("KAFKA_POLL_TIMEOUT_MS", "1000"))

    mongo_uri: str = os.getenv("MONGO_URI", "mongodb://mongo:27017")
    mongo_db: str = os.getenv("MONGO_DB", "notifications")
    mongo_notifications_collection: str = os.getenv("MONGO_NOTIFICATIONS_COLLECTION", "notifications")
