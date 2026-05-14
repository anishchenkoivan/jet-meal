from datetime import datetime, timezone
from typing import Any

from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo import ReturnDocument

from app.config import Settings


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _serialize(doc: dict[str, Any]) -> dict[str, Any]:
    return {
        "user_id": doc["user_id"],
        "channels": doc.get("channels") or {},
        "created_at": doc["created_at"],
        "updated_at": doc["updated_at"],
    }


class NotificationContextRepository:
    """Per-user notification preferences: which channels are available / enabled."""

    def __init__(self, settings: Settings) -> None:
        self._client = MongoClient(settings.mongo_uri)
        self._collection: Collection = self._client[settings.mongo_db][settings.mongo_context_collection]
        self._collection.create_index("user_id", unique=True)

    def get(self, user_id: str) -> dict[str, Any] | None:
        doc = self._collection.find_one({"user_id": user_id})
        return _serialize(doc) if doc else None

    def create(self, user_id: str, channels: dict[str, Any]) -> None:
        now = _utcnow()
        self._collection.insert_one(
            {
                "user_id": user_id,
                "channels": dict(channels),
                "created_at": now,
                "updated_at": now,
            }
        )

    def replace(self, user_id: str, channels: dict[str, Any]) -> dict[str, Any] | None:
        now = _utcnow()
        doc = self._collection.find_one_and_update(
            {"user_id": user_id},
            {"$set": {"channels": dict(channels), "updated_at": now}},
            return_document=ReturnDocument.AFTER,
        )
        return _serialize(doc) if doc else None

    def patch_merge_channels(self, user_id: str, partial: dict[str, Any]) -> dict[str, Any] | None:
        doc = self._collection.find_one({"user_id": user_id})
        if not doc:
            return None
        merged = {**(doc.get("channels") or {}), **partial}
        now = _utcnow()
        updated = self._collection.find_one_and_update(
            {"user_id": user_id},
            {"$set": {"channels": merged, "updated_at": now}},
            return_document=ReturnDocument.AFTER,
        )
        return _serialize(updated) if updated else None

    def delete(self, user_id: str) -> bool:
        result = self._collection.delete_one({"user_id": user_id})
        return result.deleted_count > 0

    def ping(self) -> bool:
        try:
            self._client.admin.command("ping")
            return True
        except Exception:
            return False

    def close(self) -> None:
        self._client.close()
