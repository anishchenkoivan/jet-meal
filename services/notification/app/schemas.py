from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class NotificationContextCreate(BaseModel):
    """Body for POST: create preferences for this user (409 if already exists)."""

    channels: dict[str, Any] = Field(default_factory=dict)


class NotificationContextReplace(BaseModel):
    """Body for PUT: replace the whole channel map."""

    channels: dict[str, Any] = Field(default_factory=dict)


class NotificationContextPatch(BaseModel):
    """Body for PATCH: shallow-merge these keys into existing ``channels``."""

    channels: dict[str, Any] = Field(default_factory=dict)


class NotificationContextOut(BaseModel):
    user_id: str
    channels: dict[str, Any]
    created_at: datetime
    updated_at: datetime
