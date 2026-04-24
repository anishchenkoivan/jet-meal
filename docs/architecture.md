GET /api/v1/restaurants/{restaurant_id}/menu
Описание: Возвращает список доступных блюд с ценами и изображениями для конкретного ресторана. Поддерживает фильтр по категориям
Request:
  {
    "category": "sushi"
  }
Response 200:
  {
    "restaurant_id": "uuid",
    "items": [
      {
        "menu_item_id": "uuid",
        "name": "Филадельфия ролл",
        "description": "Лосось, сливочный сыр, огурец, рис, нори",
        "price": 650.00,
        "currency": "RUB",
        "category": "sushi",
        "image_urls": [
          "https://example.com/images/roll_philadelphia_1.jpg",
          "https://example.com/images/roll_philadelphia_2.jpg"
        ],
        "available": true
      }
    ],
  }
Errors:
  400 - невалидные данные
  404 - ресторан не найден
  429 - rate limit exceeded
  503 - menu сервис недоступен
Подход к версионированию: v1 в URL. При обратной несовместимости (например, изменении структуры image_urls на объекты) создаём /api/v2/.


POST /api/v1/orders
Описание: Создание нового заказа пользователем на основе позиций меню
Request:
  {
    "user_id": "uuid",
    "restaurant_id": "uuid",
    "items": [
      {
        "menu_item_id": "uuid",
        "quantity": 2,
        "comment": "без лука"
      }
    ],
    "delivery_address": {
      "street": "Проспект Андропова, 18",
      "lat": 55.69,
      "lon": 37.66
    },
    "payment_method": "card_online",
    "promo_code": "SPRING10"
  }
Response 201:
  {
    "order_id": "uuid",
    "status": "created",
    "total_amount": 1490.00,
    "currency": "RUB",
    "estimated_delivery": "2026-04-24T19:30:00Z"
  }
Errors:
  400 - невалидные данные заказа
  404 - ресторан или блюдо не найдено
  409 - блюдо недоступно/остаток изменился
  422 - адрес вне зоны доставки
  503 - order service недоступен
Подход к версионированию: v1 в URL; несовместимые изменения в модели items/price breakdown ведут к /api/v2/.


PATCH /api/v1/orders/{order_id}/status
Описание: Обновление статуса заказа системой
Request:
  {
    "status": "courier_assigned",
    "courier_id": "uuid",
    "eta_minutes": 25,
    "updated_by": "tracking_service"
  }
Response 200:
  {
    "order_id": "uuid",
    "previous_status": "preparing",
    "current_status": "courier_assigned",
    "updated_at": "2026-04-24T18:05:00Z"
  }
Errors:
  400 - невалидный статус или тело запроса
  404 - заказ не найден
  409 - недопустимый переход статуса
  423 - заказ заблокирован для изменений
  503 - order service недоступен
Подход к версионированию: v1 в URL; при изменении state machine статусов и правил перехода создаем /api/v2/.


POST /api/v1/notifications
Описание: Отправка уведомления пользователю о смене статуса заказа
Request:
  {
    "user_id": "uuid",
    "channel": "email",
    "template": "order_status_updated",
    "payload": {
      "order_id": "uuid",
      "status": "courier_assigned",
      "eta_minutes": 18
    },
    "idempotency_key": "notif-uuid"
  }
Response 202:
  {
    "notification_id": "uuid",
    "status": "queued"
  }
Errors:
  400 - невалидный канал/шаблон
  404 - пользователь не найден
  409 - duplicate idempotency_key
  429 - rate limit exceeded
  503 - notification service недоступен
Подход к версионированию: v1 в URL; при изменении формата payload и template contracts создаем /api/v2/.
