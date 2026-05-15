from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from app.order_changed_message import OrderChangedMessage

_EVENT_TITLES: dict[str, tuple[str, str | None]] = {
    "created": ("Заказ оформлен", "Мы приняли заказ и передали его в обработку."),
    "updated": ("Обновление по заказу", None),
    "cancelled": ("Заказ отменён", "Если оплата уже прошла, средства вернутся на карту."),
    "order_status_changed": ("Обновление по заказу", None),
}


def format_order_changed_telegram(msg: OrderChangedMessage) -> str:
    title, subtitle = _resolve_heading(msg)
    lines: list[str] = [title]
    if subtitle:
        lines.append(subtitle)

    lines.append("")
    lines.append(f"Заказ №{_order_short_id(msg.order_id)}")

    if msg.total_cost is not None:
        lines.append(f"Сумма: {_format_money(msg.total_cost)}")

    if msg.menu_items:
        lines.extend(_format_menu_block(msg.menu_items))

    if msg.comment:
        lines.append(f"Комментарий: {msg.comment.strip()}")

    if msg.timestamp is not None:
        lines.append("")
        lines.append(_format_timestamp(msg.timestamp))

    return "\n".join(lines)


def _resolve_heading(msg: OrderChangedMessage) -> tuple[str, str | None]:
    event_key = _normalize_event_type(msg.event_type)
    if msg.courier_id is not None and event_key in {"updated", "order_status_changed"}:
        return "Курьер назначен", "Заказ передан курьеру — скоро будет в пути."
    if event_key in _EVENT_TITLES:
        return _EVENT_TITLES[event_key]
    return "Обновление по заказу", None


def _normalize_event_type(event_type: str) -> str:
    return event_type.strip().lower().replace("-", "_")


def _order_short_id(order_id: UUID) -> str:
    return str(order_id).split("-")[0].upper()


def _format_money(amount: Decimal) -> str:
    normalized = amount.quantize(Decimal("0.01"))
    whole, fraction = divmod(abs(normalized), 1)
    whole_part = f"{int(whole):,}".replace(",", " ")
    cents = int((fraction * 100).to_integral_value())
    sign = "-" if normalized < 0 else ""
    return f"{sign}{whole_part},{cents:02d} ₽"


def _format_timestamp(ts: datetime) -> str:
    return ts.strftime("%d.%m.%Y, %H:%M")


def _format_menu_block(items: dict[str, int]) -> list[str]:
    total_qty = sum(items.values())
    position_word = _pluralize_positions(len(items))
    lines = ["", f"Состав: {total_qty} шт., {len(items)} {position_word}"]
    for qty in sorted(items.values(), reverse=True):
        lines.append(f"  {qty} шт.")
    return lines


def _pluralize_positions(count: int) -> str:
    if count % 10 == 1 and count % 100 != 11:
        return "позиция"
    if count % 10 in {2, 3, 4} and count % 100 not in {12, 13, 14}:
        return "позиции"
    return "позиций"
