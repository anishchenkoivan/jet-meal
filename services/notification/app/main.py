import logging
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException, Query
from pymongo.errors import DuplicateKeyError

from app.config import Settings
from app.consumer import NotificationConsumer
from app.schemas import NotificationCreate, NotificationOut, NotificationUpdate
from app.storage import NotificationRepository

settings = Settings()

logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)

repository = NotificationRepository(settings)
consumer = NotificationConsumer(settings, repository)


@asynccontextmanager
async def lifespan(_: FastAPI):
    consumer.start()
    yield
    consumer.stop()
    repository.close()


app = FastAPI(title="Notification Service", version="0.1.0", lifespan=lifespan)


@app.get("/health/live")
def liveness() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/health/ready")
def readiness() -> dict[str, Any]:
    consumer_state = consumer.state.snapshot()
    mongo_ok = repository.ping()
    status = "ok" if consumer_state["running"] and mongo_ok else "degraded"
    return {
        "status": status,
        "mongo_ok": mongo_ok,
        "consumer": consumer_state,
    }


@app.get("/stats")
def stats() -> dict[str, Any]:
    return consumer.state.snapshot()


@app.post("/notifications", response_model=NotificationOut, status_code=201)
def create_notification(body: NotificationCreate) -> NotificationOut:
    data = body.model_dump(exclude_none=True)
    try:
        new_id = repository.create_notification(data)
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="Notification with this event_id already exists") from None
    doc = repository.get_notification(new_id)
    if not doc:
        raise HTTPException(status_code=500, detail="Failed to read created notification") from None
    return NotificationOut(**doc)


@app.get("/notifications/{notification_id}", response_model=NotificationOut)
def get_notification(notification_id: str) -> NotificationOut:
    doc = repository.get_notification(notification_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Notification not found")
    return NotificationOut(**doc)


@app.get("/users/{user_id}/notifications", response_model=list[NotificationOut])
def list_user_notifications(
    user_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
) -> list[NotificationOut]:
    docs = repository.list_notifications_for_user(user_id, skip=skip, limit=limit)
    return [NotificationOut(**d) for d in docs]


@app.patch("/notifications/{notification_id}", response_model=NotificationOut)
def update_notification(notification_id: str, body: NotificationUpdate) -> NotificationOut:
    patch = body.model_dump(exclude_unset=True)
    if not patch:
        doc = repository.get_notification(notification_id)
        if not doc:
            raise HTTPException(status_code=404, detail="Notification not found")
        return NotificationOut(**doc)
    doc = repository.update_notification(notification_id, patch)
    if not doc:
        raise HTTPException(status_code=404, detail="Notification not found")
    return NotificationOut(**doc)


@app.delete("/notifications/{notification_id}", status_code=204)
def delete_notification(notification_id: str) -> None:
    if not repository.delete_notification(notification_id):
        raise HTTPException(status_code=404, detail="Notification not found")
