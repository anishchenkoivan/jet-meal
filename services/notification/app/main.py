import logging
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException
from pymongo.errors import DuplicateKeyError

from app.config import Settings
from app.consumer import NotificationConsumer
from app.schemas import (
    NotificationContextCreate,
    NotificationContextOut,
    NotificationContextPatch,
    NotificationContextReplace,
)
from app.storage import NotificationContextRepository

settings = Settings()

logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)

repository = NotificationContextRepository(settings)
consumer = NotificationConsumer(settings)


def _require_nonempty_user_id(user_id: str) -> str:
    uid = user_id.strip()
    if not uid:
        raise HTTPException(status_code=422, detail="user_id must not be empty")
    return uid


@asynccontextmanager
async def lifespan(_: FastAPI):
    consumer.start()
    yield
    consumer.stop()
    repository.close()


_OPENAPI_TAGS = [
    {"name": "Health", "description": "Liveness and readiness probes."},
    {
        "name": "Operations",
        "description": "Kafka consumer diagnostics (subscribes to the order lifecycle topic, configurable via KAFKA_TOPIC).",
    },
    {
        "name": "Notification context",
        "description": (
            "Per-user notification preferences (which channels are enabled, addresses, etc.). "
        ),
    },
]

app = FastAPI(
    title="Notification Service",
    version="0.1.0",
    lifespan=lifespan,
    openapi_tags=_OPENAPI_TAGS,
    description=(
        "REST API for the notification microservice. "
        "Checked-in contract: `services/notification/docs/api.yaml`. "
        "Live schema: [/openapi.json](/openapi.json), Swagger UI: [/docs](/docs)."
    ),
)


@app.get("/health/live", tags=["Health"])
def liveness() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/health/ready", tags=["Health"])
def readiness() -> dict[str, Any]:
    consumer_state = consumer.state.snapshot()
    mongo_ok = repository.ping()
    status = "ok" if consumer_state["running"] and mongo_ok else "degraded"
    return {
        "status": status,
        "mongo_ok": mongo_ok,
        "consumer": consumer_state,
    }


@app.get("/stats", tags=["Operations"])
def stats() -> dict[str, Any]:
    return consumer.state.snapshot()


@app.post(
    "/users/{user_id}/notification-context",
    response_model=NotificationContextOut,
    status_code=201,
    tags=["Notification context"],
)
def create_notification_context(user_id: str, body: NotificationContextCreate) -> NotificationContextOut:
    user_id = _require_nonempty_user_id(user_id)
    try:
        repository.create(user_id, body.channels)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=409,
            detail="Notification context already exists for this user; use PUT or PATCH",
        ) from None
    doc = repository.get(user_id)
    if not doc:
        raise HTTPException(status_code=500, detail="Failed to read created context") from None
    return NotificationContextOut(**doc)


@app.get(
    "/users/{user_id}/notification-context",
    response_model=NotificationContextOut,
    tags=["Notification context"],
)
def get_notification_context(user_id: str) -> NotificationContextOut:
    user_id = _require_nonempty_user_id(user_id)
    doc = repository.get(user_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Notification context not found")
    return NotificationContextOut(**doc)


@app.put(
    "/users/{user_id}/notification-context",
    response_model=NotificationContextOut,
    tags=["Notification context"],
)
def replace_notification_context(user_id: str, body: NotificationContextReplace) -> NotificationContextOut:
    user_id = _require_nonempty_user_id(user_id)
    doc = repository.replace(user_id, body.channels)
    if not doc:
        raise HTTPException(
            status_code=404,
            detail="Notification context not found; create it with POST first",
        )
    return NotificationContextOut(**doc)


@app.patch(
    "/users/{user_id}/notification-context",
    response_model=NotificationContextOut,
    tags=["Notification context"],
)
def patch_notification_context(user_id: str, body: NotificationContextPatch) -> NotificationContextOut:
    user_id = _require_nonempty_user_id(user_id)
    doc = repository.patch_merge_channels(user_id, body.channels)
    if not doc:
        raise HTTPException(
            status_code=404,
            detail="Notification context not found; create it with POST first",
        )
    return NotificationContextOut(**doc)


@app.delete("/users/{user_id}/notification-context", status_code=204, tags=["Notification context"])
def delete_notification_context(user_id: str) -> None:
    user_id = _require_nonempty_user_id(user_id)
    if not repository.delete(user_id):
        raise HTTPException(status_code=404, detail="Notification context not found")
