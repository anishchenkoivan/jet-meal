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
        "price": {
          "amount": "650.00",
          "currency": "RUB"
        },
        "category": "sushi",
        "images": [
          {
            "media_id": "uuid",
            "url": "https://example.com/images/roll_philadelphia_1.jpg"
          }
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
Подход к версионированию: v1 в URL. При обратной несовместимости (например, изменении структуры поля images) создаём /api/v2/.


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
    "total_price": {
      "amount": "1490.00",
      "currency": "RUB"
    }
  }
Errors:
  400 - невалидные данные заказа
  404 - ресторан или блюдо не найдено
  409 - блюдо недоступно/остаток изменился
  422 - адрес вне зоны доставки
  503 - order service недоступен
Подход к версионированию: v1 в URL; несовместимые изменения в модели items/price breakdown ведут к /api/v2/.


GET /api/v1/users/{user_id}/orders
Описание: Получение списка заказов пользователя
Request:
  {
    "limit": 20,
    "page_token": "opaque-token-1"
  }
Response 200:
  {
    "items": [
      {
        "order_id": "uuid",
        "status": "delivered",
        "created_at": "2026-04-24T17:10:00Z",
        "total_price": {
          "amount": "1490.00",
          "currency": "RUB"
        }
      }
    ],
    "next_page_token": "opaque-token-2"
  }
Errors:
  400 - невалидные параметры пагинации
  404 - пользователь не найден
  429 - rate limit exceeded
  503 - order service недоступен
Подход к версионированию: v1 в URL; при изменении модели пагинации или состава item создаем /api/v2/.

OpenAPI spec: docs/openapi.yaml
