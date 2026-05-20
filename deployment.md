# jet-meal

Платформа доставки еды: каталог ресторанов и меню, заказы, пользователи, биллинг, уведомления. Клиенты заходят с веба и с мобильных приложений.

---

## 1.1. Описание развёртывания

### Система и нагрузка

Kubernetes-кластер с неймспейсами приложений `frontend` и `jet-meal`, инфраструктурными неймспейсами `kafka`, `s3`, `monitoring`. Внешний трафик принимает **NGINX Ingress** с TLS (`jet-meal-tls`), хост **jet-meal.ru**.

Нагрузка преобладает на чтение: каталог ресторанов и карточки меню, пики в обед и вечером. Записи сосредоточены в order-service: PostgreSQL, Redis-кэш активных заказов, события в Kafka.

### Сервисы

| Компонент | Ответственность | Stateful | Публичный |
|---|---|---|---|
| auth-ssr x2 | Аутентификация, профиль, `/account`, `/my`, `/admin`, `/` | Нет | Через Ingress |
| delivery-ssr x2 | Интерфейс заказов `/my/orders`, `/my/order`, `/admin/delivery` | Нет | Через Ingress |
| restaurant-ssr x2 | Витрина `/restaurants`, `/catalog`, `/admin/restaurants` | Нет | Через Ingress |
| businesses-service x2 | Рестораны и меню, GraphQL | Нет | Нет |
| order-service x2 | Заказы, Liquibase-миграции, Redis-кэш, producer `order.changed` | Нет | Нет |
| user-service x2 | Пользователи | Нет | Нет |
| billing-service x2 | Биллинг | Нет | Нет |
| shdb-service x1 | BLOB-хранилище на файловом томе | Да (PVC) | Нет |
| redis x1 | Кэш активных заказов | Да (PVC) | Нет |
| PostgreSQL StatefulSet x1 на сервис | Персистентность businesses, order, user, billing | Да (PVC) | Нет |
| Kafka x3 брокера | Топик `order.changed`, режим KRaft | Да (PVC) | Нет |
| MinIO x1 | Объектное хранилище, S3 API, неймспейс `s3` | Да (PVC) | Нет |
| Prometheus x1 | TSDB метрик, scrape по аннотации `prometheus.io/scrape` | Да (emptyDir) | Через monitoring Ingress |
| Grafana | Дашборды | Нет | Через monitoring Ingress |
| kube-state-metrics, node-exporter | Экспортёры кластера и нод | Нет | Нет |
| notification (Docker Compose) | Consumer `order.changed`, Telegram-уведомления, MongoDB | Да (volume MongoDB) | Порт 8081 на хосте |

Топик **order.changed**: producer - order-service в кластере, consumer - notification в Docker Compose (собственный Kafka-брокер внутри Compose).

---

## 1.2. Стратегия деплоя

### auth-ssr, delivery-ssr, restaurant-ssr: Canary

На каждое приложение два Deployment (`*-stable` и `*-canary`) и два ClusterIP Service. Основной Ingress направляет трафик на stable-Service. Второй Ingress на тот же хост и path содержит аннотации `nginx.ingress.kubernetes.io/canary: "true"` и `nginx.ingress.kubernetes.io/canary-weight` с долей трафика на новую сборку. При деградации по ошибкам или задержкам `canary-weight` выставляют в `0`. После стабильных метрик вес поднимают до 100; в следующем релизе canary-Deployment переименовывают в единственный stable.

### businesses-service, user-service, billing-service: Rolling Update

Deployment с двумя репликами, стратегия `RollingUpdate`. Новые поды проходят readiness-пробу, затем Endpoints обновляется и старые поды снимаются. Две версии кода кратко сосуществуют на одной схеме, миграции PostgreSQL только в стиле expand-contract.

### order-service: Rolling Update

Deployment с двумя репликами. Liquibase применяет миграции при старте пода (`SPRING_LIQUIBASE_CHANGE_LOG`); каждый шаг схемы совместим со старой версией приложения. События `order.changed` версионируются независимо от SQL.

### Kafka: StatefulSet, обновление по одному брокеру

Три брокера в StatefulSet, режим KRaft. Обновление образа идёт по очереди с сохранением PVC и кворума.

### PostgreSQL: обслуживание

Один StatefulSet на сервис. Обновление образа и DDL-операции вне цикла expand-contract выполняют в запланированном окне обслуживания.

### redis, shdb-service, MinIO: Rolling (одиночный Pod)

По одному Pod. Замена образа вызывает rolling этого пода; доступность прерывается до готовности нового пода.

### Zero-downtime: пробы и завершение

Readiness-проба снимает Pod с балансировки, пока сервис не готов. Liveness-проба перезапускает зависший процесс.

| Компонент | Liveness | Readiness |
|---|---|---|
| businesses-service | HTTP GET `/health` :8080 | HTTP GET `/health` :8080 |
| user-service | HTTP GET `/health` :8080 | HTTP GET `/health` :8080 |
| billing-service | HTTP GET `/health` :8080 | HTTP GET `/health` :8080 |
| shdb-service | HTTP GET `/health` :8080 | HTTP GET `/health` :8080 |
| order-service | TCP :8080 | TCP :8080 |
| auth-ssr / delivery-ssr / restaurant-ssr | HTTP GET `/` :3000 | HTTP GET `/` :3000 |
| redis | TCP :6379 | exec `redis-cli ping` |
| Kafka | exec `nc -z localhost 9092` | exec `kafka-broker-api-versions.sh` |
| notification (Compose) | нет | HTTP GET `/health/live` :8080 |

По SIGTERM приложение прекращает приём новых запросов, завершает открытые соединения к PostgreSQL и Kafka и выходит. Время ожидания задаёт `terminationGracePeriodSeconds`.

### Миграции БД: expand-contract

1. Выкатить миграцию: добавить новые поля или таблицы, совместимые со старым кодом.
2. Rolling-обновление сервиса.
3. Отдельный шаг: удалить устаревшие объекты схемы.

События Kafka версионируются отдельно и остаются обратно совместимыми на переходный период.

---

## 1.3. Observability

### Четыре алерта по Golden Signals (critical path)

Critical path: пользователь -> NGINX Ingress -> SSR -> businesses-service / order-service -> PostgreSQL, Redis, Kafka.

| # | Сигнал | Метрика | Порог | Окно |
|---|---|---|---|---|
| 1 | Latency | p99 времени ответа Ingress по `jet-meal.ru` | > 500 ms | 5 мин |
| 2 | Errors | Доля HTTP 5xx от всех ответов Ingress | > 1 % | 5 мин |
| 3 | Traffic | RPS на Ingress ниже 50% от медианы предыдущего часа | - | 15 мин |
| 4 | Saturation | Consumer lag топика `order.changed` | > 1000 сообщений | 15 мин |

Загрузка CPU нод и пула коннектов PostgreSQL смотрят на дашборде "Разбор", без отдельного дежурного алерта.

### Дашборды

- **Обзор:** ошибки, задержки, RPS на Ingress, lag `order.changed`, статус Deployment по ключевым сервисам.
- **Сервис:** CPU и память по Pod, рестарты контейнеров, JVM-метрики order-service.
- **Разбор:** диск и память нод, lag по partition Kafka, медленные запросы PostgreSQL, поиск по `trace_id` в логах.

Prometheus собирает метрики через аннотацию `prometheus.io/scrape: "true"` на Pod (SSR-сервисы) и через статические таргеты: node-exporter `:9100`, kube-state-metrics `:8080`.

### Логи

Формат JSON, время UTC. Обязательные поля: `level`, `service`, `trace_id`; для HTTP-запросов - `method`, `route`, `status`. В лог попадают ошибки обращений к PostgreSQL и Kafka и значимые бизнес-события. Секреты, токены и персональные данные в лог не пишутся.
