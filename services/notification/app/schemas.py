from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class NotificationCreate(BaseModel):
    user_id: str = Field(min_length=1)
    title: str | None = None
    body: str | None = None
    channel: str | None = None
    context: dict[str, Any] | None = None
    event_id: str | None = None


class NotificationUpdate(BaseModel):
    title: str | None = None
    body: str | None = None
    channel: str | None = None
    context: dict[str, Any] | None = None
    read: bool | None = None


class NotificationOut(BaseModel):
    id: str
    user_id: str
    title: str | None
    body: str | None
    channel: str | None
    context: dict[str, Any]
    read: bool
    event_id: str | None
    created_at: datetime
    updated_at: datetime
    source: str | None = None
