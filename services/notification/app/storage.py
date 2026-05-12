from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from bson.errors import InvalidId
from pymongo import ASCENDING, DESCENDING, MongoClient, ReturnDocument
from pymongo.collection import Collection

from app.config import Settings

_KNOWN_PAYLOAD_KEYS = frozenset(
    {"event_id", "user_id", "channel", "message", "title", "received_at", "read"}
)


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def notification_from_kafka_payload(payload: dict[str, Any]) -> dict[str, Any]:
    user_id = payload.get("user_id")
    if not user_id or not isinstance(user_id, str):
        raise ValueError("user_id is required and must be a non-empty string")

    message = payload.get("message")
    title = payload.get("title")
    if title is None and isinstance(message, str):
        title = message[:200] if len(message) > 200 else message

    context = {k: v for k, v in payload.items() if k not in _KNOWN_PAYLOAD_KEYS}
    read_val = payload.get("read")
    read = bool(read_val) if read_val is not None else False

    doc: dict[str, Any] = {
        "user_id": user_id,
        "title": title if isinstance(title, str) else None,
        "body": message if isinstance(message, str) else None,
        "channel": payload.get("channel") if isinstance(payload.get("channel"), str) else None,
        "context": context,
        "read": read,
        "event_id": payload.get("event_id") if isinstance(payload.get("event_id"), str) else None,
        "source": "kafka",
    }
    return doc


def _serialize(doc: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(doc["_id"]),
        "user_id": doc["user_id"],
        "title": doc.get("title"),
        "body": doc.get("body"),
        "channel": doc.get("channel"),
        "context": doc.get("context") or {},
        "read": bool(doc.get("read", False)),
        "event_id": doc.get("event_id"),
        "created_at": doc["created_at"],
        "updated_at": doc["updated_at"],
        "source": doc.get("source"),
    }


class NotificationRepository:
    def __init__(self, settings: Settings) -> None:
        self._client = MongoClient(settings.mongo_uri)
        self._events: Collection = self._client[settings.mongo_db][settings.mongo_collection]
        self._notifications: Collection = self._client[settings.mongo_db][
            settings.mongo_notifications_collection
        ]
        self._events.create_index("event_id", unique=True, sparse=True)
        self._notifications.create_index("event_id", unique=True, sparse=True)
        self._notifications.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])

    def save_event(self, payload: dict[str, Any]) -> None:
        if "received_at" not in payload:
            payload = {**payload, "received_at": _utcnow().isoformat()}
        self._events.insert_one(payload)

    def save_notification_from_kafka(self, payload: dict[str, Any]) -> None:
        now = _utcnow()
        base = notification_from_kafka_payload(payload)
        doc = {
            **base,
            "created_at": now,
            "updated_at": now,
        }
        self._notifications.insert_one(doc)

    def create_notification(self, data: dict[str, Any]) -> str:
        now = _utcnow()
        doc = {
            "user_id": data["user_id"],
            "title": data.get("title"),
            "body": data.get("body"),
            "channel": data.get("channel"),
            "context": data.get("context") or {},
            "read": False,
            "event_id": data.get("event_id"),
            "source": "api",
            "created_at": now,
            "updated_at": now,
        }
        result = self._notifications.insert_one(doc)
        return str(result.inserted_id)

    def get_notification(self, notification_id: str) -> dict[str, Any] | None:
        oid = _parse_oid(notification_id)
        if oid is None:
            return None
        doc = self._notifications.find_one({"_id": oid})
        return _serialize(doc) if doc else None

    def list_notifications_for_user(
        self, user_id: str, *, skip: int = 0, limit: int = 50
    ) -> list[dict[str, Any]]:
        cursor = (
            self._notifications.find({"user_id": user_id})
            .sort("created_at", DESCENDING)
            .skip(max(0, skip))
            .limit(min(max(1, limit), 200))
        )
        return [_serialize(d) for d in cursor]

    def update_notification(self, notification_id: str, patch: dict[str, Any]) -> dict[str, Any] | None:
        oid = _parse_oid(notification_id)
        if oid is None:
            return None
        set_fields: dict[str, Any] = {"updated_at": _utcnow()}
        for key in ("title", "body", "channel", "read", "context"):
            if key in patch:
                set_fields[key] = patch[key]
        if len(set_fields) == 1:
            doc = self._notifications.find_one({"_id": oid})
            return _serialize(doc) if doc else None

        doc = self._notifications.find_one_and_update(
            {"_id": oid},
            {"$set": set_fields},
            return_document=ReturnDocument.AFTER,
        )
        return _serialize(doc) if doc else None

    def delete_notification(self, notification_id: str) -> bool:
        oid = _parse_oid(notification_id)
        if oid is None:
            return False
        result = self._notifications.delete_one({"_id": oid})
        return result.deleted_count > 0

    def ping(self) -> bool:
        try:
            self._client.admin.command("ping")
            return True
        except Exception:
            return False

    def close(self) -> None:
        self._client.close()


def _parse_oid(notification_id: str) -> ObjectId | None:
    try:
        return ObjectId(notification_id)
    except InvalidId:
        return None
