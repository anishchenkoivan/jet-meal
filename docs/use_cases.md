## Описание взаимодействия сервисах в различных юзкейсах и sequence diagrams

### Создание заказа

#### Happy path

```mermaid
sequenceDiagram
    participant User
    participant OrderService
    participant PaymentService
    participant RestaurantService
    participant NotificationService
    participant Kafka

    User->>OrderService: POST /order
    OrderService->>OrderService: Create order (pending)
    OrderService->>PaymentService: POST /pay (userId, amount)
    PaymentService->>PaymentService: Process payment (PG sharded)
    PaymentService-->>OrderService: PaymentOK
    OrderService->>OrderService: Update order (confirmed)
    OrderService->>RestaurantService: Notify restaurant (new order)
    OrderService->>NotificationService: Notify user
    OrderService->>Kafka: Order confirmed
    NotificationService-->>User: Order confirmed
    OrderService-->>User: HTTP 200 + order details
```

#### Payment service недоступен

```mermaid
sequenceDiagram
    participant User
    participant OrderService
    participant PaymentService
    participant NotificationService

    User->>OrderService: POST /order
    OrderService->>OrderService: Create order (pending)

    OrderService->>PaymentService: POST /pay (userId, amount)
    Note over PaymentService: Сервис недоступен<br/>(таймаут / 5xx)
    PaymentService--xOrderService: Timeout / HTTP 503

    loop Retry x3 с экспоненциальной задержкой
        OrderService->>PaymentService: POST /pay (retry)
        PaymentService--xOrderService: Ошибка
    end

    OrderService->>OrderService: Update order → payment_failed
    OrderService->>NotificationService: Send payment failure notification
    NotificationService-->>User: Уведомление "Оплата не прошла, попробуйте позже"
    OrderService-->>User: HTTP 402 / 500 + error details
```

### Треккинг

#### Happy path

```mermaid
sequenceDiagram
    participant User
    participant OrderService
    participant Redis as Redis (active orders)
    participant TrackingService as TrackingService (ClickHouse)

    User->>OrderService: GET /order/{id}
    OrderService->>Redis: Get order status
    Redis-->>OrderService: status: "preparing"
    OrderService->>TrackingService: Fetch courier latest checkpoint
    TrackingService-->>OrderService: lat, lng (if assigned)
    OrderService-->>User: OrderWithETA + courier location
```

#### Redis заблокировали в России

```mermaid
sequenceDiagram
    participant User
    participant OrderService
    participant Redis
    participant DB as Primary Database
    participant TrackingService

    User->>OrderService: GET /order/{id}
    OrderService->>Redis: Get order status
    Note over Redis: Недоступен<br/>(сетевой сбой)
    Redis--xOrderService: Connection timeout

    OrderService->>DB: SELECT status FROM orders WHERE id = ?
    DB-->>OrderService: status = "preparing"

    OrderService->>TrackingService: Fetch courier checkpoint
    Note over TrackingService: (опционально) тоже может<br/>упасть, но не критично

    alt TrackingService доступен
        TrackingService-->>OrderService: lat, lng
    else TrackingService недоступен
        OrderService->>OrderService: пропустить геоданные
    end

    OrderService-->>User: OrderWithETA (без координат курьера)<br/>+ предупреждение "Данные о местоположении временно недоступны"
```

### Оплата

#### Happy path

```mermaid
sequenceDiagram
    participant OrderService
    participant PaymentService as PaymentService (PG sharded)
    participant Kafka as EventBus / Kafka

    OrderService->>PaymentService: Charge(userId, amount, idempotentKey)
    PaymentService->>PaymentService: Validate + reserve
    PaymentService->>Kafka: OrderPaidEvent
    PaymentService-->>OrderService: PaymentConfirmed
    Note over OrderService,PaymentService: On failure
    PaymentService-->>OrderService: InsufficientFunds
    loop Retry x3
        OrderService->>PaymentService: Retry charge
    end
```

#### Ошибка сети + недостаточно средств

```mermaid
sequenceDiagram
    participant OrderService
    participant PaymentService
    participant Kafka

    Note over OrderService,PaymentService: --- Сценарий 1: недостаточно средств (без повторов) ---
    OrderService->>PaymentService: Charge(userId, amount, idempotentKey)
    PaymentService-->>OrderService: InsufficientFunds
    OrderService->>OrderService: Order status → payment_failed
    OrderService-->>User: Ошибка "Недостаточно средств"

    Note over OrderService,PaymentService: --- Сценарий 2: временный сетевой сбой → retry успешен ---
    OrderService->>PaymentService: Charge (1)
    Note over PaymentService: Сетевой таймаут
    PaymentService--xOrderService: Timeout

    loop Retry x3
        OrderService->>PaymentService: Charge (retry 2)
        PaymentService-->>OrderService: PaymentConfirmed
    end

    OrderService->>Kafka: OrderPaidEvent
    OrderService->>OrderService: Order status → confirmed
```

### Поиск курьера

#### Happy path

Запускается на OrderPaidEvent

```mermaid
sequenceDiagram
    participant Kafka as OrderPaidEvent (Kafka)
    participant GeoService as GeoService (PostGIS)
    participant CourierApp
    participant Redis as Redis (live location)
    participant ClickHouse as ClickHouse (history)

    Kafka->>GeoService: Find nearest courier (lat, lng, radius)
    GeoService->>GeoService: Query spatial index
    GeoService-->>Kafka: courier_id
    Kafka->>CourierApp: Assign order (push notification)
    loop Every 5 seconds
        CourierApp->>Redis: Update live location (lat, lng, status)
        CourierApp->>ClickHouse: Append checkpoint for history
    end
```

#### Недоступность geo service

```mermaid
sequenceDiagram
    participant Kafka as OrderPaidEvent (Kafka)
    participant GeoService
    participant CourierApp
    participant OrderService
    participant DeadLetter as DLQ / Retry Queue

    Kafka->>GeoService: Find nearest courier (lat, lng, radius)
    Note over GeoService: PostGIS недоступен<br/>(сбой соединения с БД)
    GeoService--xKafka: Timeout / SQL Error

    alt Конфигурация с мгновенным retry
        loop Retry 3 раза с задержкой 1,2,4 сек
            Kafka->>GeoService: Find nearest courier
            GeoService--xKafka: Ошибка
        end
        Kafka->>DeadLetter: Сохранить событие для ручного<br/>или отложенного повтора
        Kafka->>OrderService: Уведомить, что назначение курьера отложено
        OrderService->>OrderService: Status → courier_assignment_pending
    else Асинхронный планировщик
        Kafka->>DeadLetter: Отправить в очередь повторных попыток (retry через 1 минуту)
    end
```

#### Отсутсвие подходящих курьеров

```mermaid
sequenceDiagram
    participant Kafka as OrderPaidEvent (Kafka)
    participant GeoService as GeoService (PostGIS)
    participant OrderService
    participant CourierApp
    participant NotificationService
    participant User

    Kafka->>GeoService: Find nearest courier (lat, lng, radius=R0)
    GeoService->>GeoService: Query spatial index
    GeoService-->>Kafka: courier_id = null (нет свободных курьеров в радиусе R0)

    alt Расширение зоны поиска (ретарджи)
        loop Увеличивать радиус R0 → R1, R2, R3
            Kafka->>GeoService: Find nearest courier (radius=R1)
            GeoService-->>Kafka: courier_id = null
        end
        Note over Kafka,GeoService: После максимального радиуса Rmax<br/>всё ещё нет курьеров
    end

    Kafka->>OrderService: No courier available
    OrderService->>OrderService: Order status → waiting_for_courier
    OrderService->>NotificationService: Notify user about delay (no courier)
    NotificationService-->>User: "Ищем курьера, ожидайте"
    OrderService->>OrderService: Schedule retry (например, через 1, 2, 5 минут)

    loop Каждые N минут (макс. количество попыток)
        OrderService->>GeoService: Find nearest courier (radius=Rmax)
        alt Курьер появился
            GeoService-->>OrderService: courier_id
            OrderService->>CourierApp: Assign order
            OrderService->>OrderService: status → courier_assigned
            OrderService->>NotificationService: Notify user about courier assigned
            NotificationService-->>User: Курьер назначен
        else Курьера всё нет
            OrderService->>OrderService: Increase timeout / escalate
        end
    end

    alt Превышено время ожидания (timeout)
        OrderService->>OrderService: status → no_courier_timeout
        OrderService->>NotificationService: Notify user / restaurant about failure
        NotificationService-->>User: "К сожалению, курьеры не найдены, заказ отменён"
        OrderService->>OrderService: Trigger refund (optional)
    end
```

### Рестаран, подтверждение/отклонение заказа

Запускается на OrderPaidEvent

#### Happy path

```mermaid
sequenceDiagram
    participant RestaurantApp
    participant OrderService
    participant NotificationService
    participant User
    participant PaymentService

    RestaurantApp->>OrderService: Accept(orderId)
    OrderService->>OrderService: Update status → accepted
    OrderService->>NotificationService: Send push/SMS
    NotificationService-->>User: Order accepted
    OrderService-->>RestaurantApp: OK

    RestaurantApp->>OrderService: Reject(orderId)
    OrderService->>OrderService: Update status → rejected
    OrderService->>PaymentService: Refund (userId, amount)
    OrderService->>NotificationService: Notify user of rejection
    NotificationService-->>User: Order rejected + refund info
    OrderService-->>RestaurantApp: OK
```

#### NotificationService не доступен

```mermaid
sequenceDiagram
    participant RestaurantApp
    participant OrderService
    participant NotificationService
    participant User
    participant RetryQueue

    RestaurantApp->>OrderService: Accept(orderId)
    OrderService->>OrderService: Update status → accepted

    OrderService->>NotificationService: Send push/SMS (user, "Order accepted")
    Note over NotificationService: Сервис уведомлений недоступен
    NotificationService--xOrderService: HTTP 500 / timeout

    OrderService->>RetryQueue: Сохранить задачу на отправку уведомления (retry через 30 сек)
    OrderService-->>RestaurantApp: OK (200)

    Note over User: Пользователь не получает push/SMS мгновенно,<br/>но при запросе статуса увидит "accepted"

    alt Ресторан отклоняет заказ (Reject)
        RestaurantApp->>OrderService: Reject(orderId)
        OrderService->>OrderService: Update → rejected
        OrderService->>PaymentService: Refund (userId, amount)
        Note over PaymentService: Допустим, PaymentService работает
        PaymentService-->>OrderService: RefundOK
        OrderService->>NotificationService: Notify rejection
        NotificationService--xOrderService: Опять недоступен
        OrderService->>RetryQueue: Сохранить уведомление об отмене
        OrderService-->>RestaurantApp: OK
    end
```

### Жизненный цикл заказа, асинхронный Сценарий

```mermaid
sequenceDiagram
    participant User
    participant OrderService
    participant PaymentService
    participant Kafka as Kafka (OrderPaidEvent)
    participant RestaurantService
    participant CourierService (GeoService)
    participant NotificationService

    Note over User,OrderService: 1. Создание заказа (синхронно)
    User->>OrderService: POST /order
    OrderService->>OrderService: Create order (pending)
    OrderService->>PaymentService: POST /pay (userId, amount)
    alt Успешная оплата
        PaymentService-->>OrderService: PaymentConfirmed
        OrderService->>OrderService: Update order → confirmed
        OrderService->>NotificationService: Notify user (order confirmed)
        NotificationService-->>User: "Заказ подтверждён, оплачен"
        OrderService->>Kafka: Publish OrderPaidEvent
        OrderService-->>User: HTTP 200 (order details)

        Note over Kafka,RestaurantService: 2. Фоновая обработка (подписчики на Kafka)
        par Асинхронно: Ресторан
            Kafka-->>RestaurantService: OrderPaidEvent
            RestaurantService->>RestaurantService: Проверить возможность приготовления
            alt Ресторан принимает
                RestaurantService->>OrderService: PUT /order/accept
                OrderService->>OrderService: status → accepted
                OrderService->>NotificationService: Send "Restaurant accepted"
                NotificationService-->>User: "Ресторан принял заказ"
            else Ресторан отклоняет
                RestaurantService->>OrderService: PUT /order/reject
                OrderService->>OrderService: status → rejected
                OrderService->>PaymentService: Refund(userId, amount)   <-- компенсация (saga)
                PaymentService-->>OrderService: RefundOK
                OrderService->>NotificationService: Send "Order rejected + refund"
                NotificationService-->>User: "Ресторан отклонил заказ, деньги возвращены"
            end
        and Асинхронно: Поиск курьера
            Kafka-->>CourierService: OrderPaidEvent
            CourierService->>CourierService: Find nearest courier (PostGIS)
            alt Курьер найден
                CourierService->>OrderService: Assign courier
                OrderService->>OrderService: status → courier_assigned
                OrderService->>NotificationService: Send "Courier assigned"
                NotificationService-->>User: "Курьер назначен"
            else Курьер не найден (сценарий из предыдущего ответа)
                CourierService->>OrderService: No courier available
                OrderService->>OrderService: status → waiting_for_courier
                OrderService->>NotificationService: Send "Looking for courier"
                NotificationService-->>User: "Ищем курьера, ожидайте"
            end
        end

    else Ошибка оплаты (InsufficientFunds / Payment timeout)
        PaymentService-->>OrderService: PaymentFailed
        OrderService->>OrderService: status → payment_failed
        OrderService->>NotificationService: Send "Payment failed"
        NotificationService-->>User: "Оплата не прошла, попробуйте позже"
        OrderService-->>User: HTTP 402 / 500
        Note over OrderService: Заказ не создаётся,<br/>событие в Kafka не публикуется
    end
```
