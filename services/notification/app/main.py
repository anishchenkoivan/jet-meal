import logging
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI

from app.config import Settings
from app.consumer import NotificationConsumer
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
