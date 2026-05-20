# JetMeal — Доступность сервиса

## 1. Целевая доступность системы

| Компонент | Uptime | Допустимый простой/год |
|-----------|--------|----------------------|
| Оплата | 99.9% | ~8.7 часов |
| Подтверждение заказа | 99.9% | ~8.7 часов |
| Уведомления | 99.5% | ~43 часа |
| Формирование заказа | 99.0% | ~87 часов |
| Поиск ресторанов | 99.0% | ~87 часов |
| Трекинг курьера | 99.0% | ~87 часов |

> **Почему не 99.99%?**
> Команда 5 человек, MVP, ограниченный бюджет.
> 99.9% — разумный баланс между стоимостью и надёжностью на старте.

---

## 2. RPO и RTO для критичных компонентов

**RPO (Recovery Point Objective)** — допустимая потеря данных (сколько времени назад).
**RTO (Recovery Time Objective)** — время восстановления после сбоя.

| Компонент | RPO | RTO | Обоснование |
|-----------|-----|-----|-------------|
| Order Service | 0 сек | < 30 сек | Потеря оплаченного заказа — прямой финансовый ущерб. < 0.000001% |
| Payment Service | 0 сек | < 30 сек | Финансовые данные — нельзя потерять ни одну запись |
| User/Auth Service | 1 мин | < 1 мин | Без авторизации не работает ни один сервис |
| Business/Menu Service | 5 мин | < 2 мин | Меню меняется редко, небольшая потеря допустима |
| Tracking/Delivery | 30 сек | < 1 мин | Активные заказы критичны, история — нет |
| Geo Service | 5 мин | < 2 мин | Данные маршрутов восстановимы пересчётом |
| Notifications Service | 5 мин | < 5 мин | Уведомление с задержкой — не катастрофа |
| Statistics Service | 1 час | < 1 часа | Аналитика некритична для работы бизнеса |

---

## 3. Стратегия резервирования

### 3.1 Сводная таблица

| Компонент               | Стратегия              | Геораспределение | Причина |
|-------------------------|------------------------|------------------|--------------------------------------------------|
| Order Service           | Active/Active          | Этап 2+          | Stateless логика, состояние в PG и Redis |
| Payment Service         | Active/Standby (hot)   | Этап 2+          | Риск двойного списания при split-brain |
| User/Auth Service       | Active/Active          | Этап 2+          | Stateless JWT-токены, PG — A/S |
| Business/Menu Service   | Active/Active          | Этап 2+          | Read-heavy, данные кешируются в Redis |
| Tracking/Delivery       | A/A (Redis) + A/S (PG) | Этап 2+          | Горячий путь через Redis, история в PG |
| Geo Service             | Active/Active          | Этап 2+          | Stateless вычисления маршрутов |
| Notifications Service   | Active/Active          | Этап 2+          | Idempotent отправка, потеря одного уведомления допустима |
| Statistics Service      | Active/Standby (warm)  | Этап 3           | Некритичный сервис, экономия на инфре |

---

### 3.2 Payment Service — Active/Standby

Выбрана стратегия **Active/Standby**, потому что Active/Active создаёт риск split-brain
и двойного списания средств с карты пользователя.

```mermaid
flowchart TD
    U([Пользователи]) --> VIP[VIP: 10.0.0.1]

    VIP --> PA

    subgraph Резервирование
        PA[Payment Active\n10.0.0.2\nпринимает платежи]
        PS[Payment Standby\n10.0.0.3\nhot standby]
        PA -- синхронная репликация\nRPO = 0 --> PS
        PA -- heartbeat --> PS
    end

    PA --> PG[(PostgreSQL\nPrimary)]
    PS -. failover\nRTO less than 30s .-> PG
```

Механизм переключения:

1. Standby отслеживает heartbeat от Active каждые 5 секунд
2. После 30 секунд без ответа — инициирует failover
3. VIP переезжает на Standby — пользователи продолжают работу
4. Бывший Active при восстановлении становится новым Standby


### 3.3 Order Service — Active/Active

Бизнес-логика stateless (оркестрация через Kafka), состояние хранится в PostgreSQL и Redis.
При падении одного пода Load Balancer мгновенно переключает трафик — failover не нужен.

```mermaid
flowchart TD
    U([Пользователи]) --> LB[Load Balancer]

    LB --> O1[Order Pod 1]
    LB --> O2[Order Pod 2]
    LB --> O3[Order Pod 3]

    O1 & O2 & O3 --> R[(Redis\nActive/Active\nактуальные заказы)]
    O1 & O2 & O3 --> PG[(PostgreSQL\nActive/Standby\nпersistent хранилище)]
    O1 & O2 & O3 --> K[[Kafka\nасинхронные события]]
```

### 3.4 Tracking Service — гибридная стратегия

Высокий RPS на чтение статуса заказа (5500 RPS) требует разделения:

- Redis A/A — горячий путь, актуальные координаты курьера (RPO = 30 сек)
- PostgreSQL A/S — история чекпоинтов, данные о курьерах (async репликация)

### 3.5 Геораспределённость

Этап 1 — MVP (Q1–Q2): один регион

```mermaid
flowchart TD
    U([Пользователи]) --> DC

    subgraph DC[Москва — единственный регион]
        LB[Load Balancer]
        APP[Микросервисы\nK8s кластер]
        PG[(PostgreSQL\nPrimary + Standby)]
        RD[(Redis)]
        CDN[CDN\nкартинки из S3]

        LB --> APP
        APP --> PG & RD
    end

    U --> CDN
```

Почему один регион достаточно на старте:

>   Москва — 80% целевой аудитории (из допущений)
>   Команда 5 человек: геораспределение кратно увеличивает сложность
>   99.9% uptime достижимо в одном ЦОД с резервированием
>   Бюджет ограничен

Что не покрывает один регион:

- Авария/пожар в ЦОД
- Региональный сбой облачного провайдера
- Высокая latency для пользователей из других регионов


Этап 2 — Рост (Q3–Q4): read-реплики и CDN

```mermaid
flowchart TD
    U([Пользователи]) --> DNS[DNS / Geo-балансировщик]

    DNS --> LB_A & LB_B

    subgraph A[Регион А — Москва]
        LB_A[Load Balancer]
        APP_A[Микросервисы]
        PGM[(PostgreSQL\nPrimary\nзапись)]
        RDA[(Redis Primary)]
        LB_A --> APP_A
        APP_A --> PGM & RDA
    end

    subgraph B[Регион Б — Екатеринбург]
        LB_B[Load Balancer]
        APP_B[Микросервисы\nread-only режим]
        PGR[(PostgreSQL\nReplica\nтолько чтение)]
        RDB[(Redis Replica)]
        LB_B --> APP_B
        APP_B --> PGR & RDB
    end

    PGM -- async репликация --> PGR
    RDA -- репликация --> RDB

    U --> CDN[CDN\nкартинки глобально]
```

Правила маршрутизации:

- Запись (создать заказ, оплата) → всегда Регион А (Москва)
- Чтение (меню, история заказов, статус) → ближайший регион
- Картинки → CDN глобально, без обращения к бэкенду

Этап 3 — СНГ: полная геораспределённость

```mermaid
flowchart TD
    U([Пользователи]) --> GTM[Global Traffic Manager]

    GTM --> RU & KZ & BY

    subgraph RU[🇷🇺 Россия\nМосква]
        APP_RU[Микросервисы]
        DB_RU[(PostgreSQL\nPrimary)]
    end

    subgraph KZ[🇰🇿 Казахстан\nАлматы]
        APP_KZ[Микросервисы]
        DB_KZ[(PostgreSQL\nLocal Primary)]
    end

    subgraph BY[🇧🇾 Беларусь\nМинск]
        APP_BY[Микросервисы]
        DB_BY[(PostgreSQL\nLocal Primary)]
    end

    DB_RU -- репликация метаданных --> DB_KZ & DB_BY
```

Причины отдельных инстансов:

> Локальные платёжные системы (Kaspi, ЕРИП)
> Data sovereignty — данные граждан хранятся локально
> Снижение latency для пользователей


## 4. Maintenance Window

## 4. Maintenance Window

### 4.1 Нужен ли он?

| Этап | Maintenance Window | Причина |
|------|--------------------|---------|
| MVP (Q1–Q2) | Да, еженедельно | Нет зрелого CI/CD, миграции БД требуют контроля |
| Рост (Q3) | Раз в месяц | Автоматизация миграций, Blue/Green deploy |
| Масштаб (Q4+) | Только экстренно | Zero-downtime как стандарт |

---

### 4.2 Расписание на период MVP

**Почему воскресенье 03:00–05:00:**
- Пиковая нагрузка (НФТ-003): 13:00–16:00 и 19:00–21:00
- Воскресная ночь — минимальное количество активных заказов
- 2-часовой запас перед возможным утренним трафиком

| Время | Действие |
|-------|----------|
| 03:00 | Остановка входящего трафика |
| 03:05 | Резервное копирование БД |
| 03:20 | Применение миграций схемы БД |
| 03:50 | Обновление сервисов |
| 04:30 | Smoke-тесты и проверка работоспособности |
| 04:50 | Открытие трафика |
| 05:00 | Наблюдение за метриками (60 мин) |

---

### 4.3 Что делается в окно

```mermaid
flowchart TD
    START([Начало окна 03:00]) --> NOTIFY[Уведомить on-call инженера]
    NOTIFY --> STOP[Остановить входящий трафик\nчерез Load Balancer]
    STOP --> BACKUP[Сделать snapshot БД]
    BACKUP --> MIGRATE{Есть миграции\nсхемы БД?}

    MIGRATE -- Да --> DDL[Применить DDL миграции\nLiquibase / Flyway]
    MIGRATE -- Нет --> UPDATE

    DDL --> UPDATE[Обновить Docker-образы\nсервисов в K8s]
    UPDATE --> TEST[Smoke-тесты:\nосновные сценарии]
    TEST --> OK{Всё OK?}

    OK -- Да --> OPEN[Открыть трафик]
    OK -- Нет --> ROLLBACK[Откат к предыдущей версии]

    ROLLBACK --> RESTORE[Восстановить БД из snapshot]
    RESTORE --> OPEN

    OPEN --> MONITOR[Мониторинг 60 мин]
    MONITOR --> END([Конец окна])
```


### 4.4 Как минимизируем простой уже сейчас

Stateless сервисы — Rolling Update без остановки трафика

```mermaid
sequenceDiagram
    participant LB as Load Balancer
    participant P1 as Pod 1 (v1.0)
    participant P2 as Pod 2 (v1.0)
    participant P1N as Pod 1 (v1.1)
    participant P2N as Pod 2 (v1.1)

    Note over LB,P2: Нормальная работа
    LB->>P1: трафик
    LB->>P2: трафик

    Note over LB,P2N: Rolling Update начался
    LB--xP1: остановить трафик
    LB->>P2: весь трафик сюда
    P1->>P1N: обновление
    LB->>P1N: трафик восстановлен
    LB--xP2: остановить трафик
    P2->>P2N: обновление
    LB->>P2N: трафик восстановлен

    Note over LB,P2N: Оба пода обновлены, простоя не было
```

### 4.5 Дорожная карта к нулевому простою

```mermaid
timeline
    title Эволюция стратегии обновлений

    section Q1-Q2 MVP
        Maintenance window еженедельно         : Вс 03:00-05:00
        Rolling update для stateless сервисов  : Без простоя
        Ручной контроль миграций БД            : Только в окно

    section Q3 Оптимизация
        Blue/Green deploy                      : Для критичных сервисов
        Автоматизация миграций                 : Liquibase / Flyway
        Maintenance window раз в месяц         : Только DDL

    section Q4 Масштаб
        Canary deployments                     : 5% трафика на новую версию
        Zero-downtime migrations               : Стандарт для всех изменений
        Maintenance window                     : Только экстренные случаи
```
