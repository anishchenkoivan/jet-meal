from datetime import datetime, timezone
from typing import Any

from pymongo import MongoClient
from pymongo.collection import Collection

from app.config import Settings


class NotificationRepository:
    def __init__(self, settings: Settings) -> None:
        self._client = MongoClient(settings.mongo_uri)
        self._collection: Collection = self._client[settings.mongo_db][settings.mongo_collection]
        self._collection.create_index("event_id", unique=True, sparse=True)

    def save_event(self, payload: dict[str, Any]) -> None:
        if "received_at" not in payload:
            payload["received_at"] = datetime.now(timezone.utc).isoformat()
        self._collection.insert_one(payload)

    def ping(self) -> bool:
        try:
            self._client.admin.command("ping")
            return True
        except Exception:
            return False

    def close(self) -> None:
        self._client.close()
