from __future__ import annotations

from app.order_changed_message import OrderChangedMessage


def format_order_changed_telegram(msg: OrderChangedMessage) -> str:
    lines = [
        f"Заказ: обновление",
        f"Событие: {msg.event_type}",
        f"Номер заказа: {msg.order_id}",
        f"Пользователь: {msg.user_id}",
    ]
    if msg.restaurant_id:
        lines.append(f"Ресторан: {msg.restaurant_id}")
    if msg.courier_id is not None:
        lines.append(f"Курьер: {msg.courier_id}")
    if msg.total_cost is not None:
        lines.append(f"Сумма: {msg.total_cost}")
    if msg.menu_items:
        lines.append(f"Позиции: {msg.menu_items}")
    if msg.comment:
        lines.append(f"Комментарий: {msg.comment}")
    if msg.timestamp is not None:
        lines.append(f"Время события: {msg.timestamp.isoformat()}")
    return "\n".join(lines)
