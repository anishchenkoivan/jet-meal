from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TelegramContext(BaseModel):
    """Telegram Bot API delivery settings for a user."""

    chat_id: str | int = Field(
        ...,
        description="Telegram chat id (user, group, or channel).",
        examples=["1111111111"],
    )


class NotificationChannels(BaseModel):
    """
    Per-channel notification settings stored under "channels" in MongoDB.
    """

    model_config = ConfigDict(extra="allow")

    telegram: TelegramContext | None = None


class NotificationContextCreate(BaseModel):
    """Body for POST: create preferences for this user (409 if already exists)."""

    channels: NotificationChannels = Field(default_factory=NotificationChannels)


class NotificationContextReplace(BaseModel):
    """Body for PUT: replace the whole channel map."""

    channels: NotificationChannels = Field(default_factory=NotificationChannels)


class NotificationContextPatch(BaseModel):
    """Body for PATCH: shallow-merge these keys into existing ``channels``."""

    channels: NotificationChannels = Field(default_factory=NotificationChannels)


class NotificationContextOut(BaseModel):
    user_id: str
    channels: NotificationChannels
    created_at: datetime
    updated_at: datetime
