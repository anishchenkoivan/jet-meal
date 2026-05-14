from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class OrderChangedMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")

    event_type: str = Field(..., alias="event_type")
    order_id: UUID = Field(..., alias="order_id")
    user_id: str = Field(..., alias="user_id")
    restaurant_id: str | None = Field(default=None, alias="restaurant_id")
    courier_id: UUID | None = Field(default=None, alias="courier_id")
    total_cost: Decimal | None = Field(default=None, alias="total_cost")
    menu_items: dict[str, int] | None = Field(default=None, alias="menu_items")
    comment: str | None = None
    timestamp: datetime | None = None
