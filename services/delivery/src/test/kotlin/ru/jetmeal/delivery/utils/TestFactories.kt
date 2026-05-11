package ru.jetmeal.delivery.utils

import ru.jetmeal.delivery.clients.order.OrderChangedMessage
import ru.jetmeal.delivery.clients.order.OrderEventType
import ru.jetmeal.delivery.models.Courier
import ru.jetmeal.delivery.services.geo.model.Point
import java.math.BigDecimal
import java.time.Instant
import java.util.UUID
import kotlin.uuid.Uuid
import ru.jetmeal.delivery.generated.model.Point as PointDto

fun createCourier(
    id: Uuid = Uuid.parse(UUID.randomUUID().toString()),
    userId: Uuid = Uuid.parse(UUID.randomUUID().toString()),
    location: Point = Point(lat = 0.0, lon = 0.0),
    lastUpdated: Long = System.currentTimeMillis(),
    assigned: Boolean = false,
): Courier = Courier(
    id = id,
    userId = userId,
    location = location,
    lastUpdated = lastUpdated,
    assigned = assigned,
)

fun createOrder(
    eventType: OrderEventType = OrderEventType.CREATED,
    orderId: Uuid = Uuid.parse(UUID.randomUUID().toString()),
    userId: String? = "user",
    restaurantId: String? = "restaurant",
    location: PointDto? = null,
    courierId: Uuid? = null,
    totalCost: BigDecimal? = BigDecimal("100.00"),
    menuItems: Map<String, Int>? = mapOf("item" to 1),
    comment: String? = null,
    timestamp: Instant = Instant.now(),
): OrderChangedMessage = OrderChangedMessage(
    eventType = eventType,
    orderId = orderId,
    userId = userId,
    restaurantId = restaurantId,
    location = location,
    courierId = courierId,
    totalCost = totalCost,
    menuItems = menuItems,
    comment = comment,
    timestamp = timestamp,
)
