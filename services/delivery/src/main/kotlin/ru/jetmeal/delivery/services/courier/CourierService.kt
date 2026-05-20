package ru.jetmeal.delivery.services.courier

import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import ru.jetmeal.delivery.repositories.CourierRepository
import ru.jetmeal.delivery.clients.order.OrderChangedMessage
import ru.jetmeal.delivery.clients.order.OrderEventType
import ru.jetmeal.delivery.clients.order.OrderEventsPublisher
import ru.jetmeal.delivery.services.geo.PositionService
import ru.jetmeal.delivery.services.geo.model.Point
import java.util.UUID
import kotlin.uuid.Uuid

@Service
class CourierService(
    private val courierRepository: CourierRepository,
    private val positionService: PositionService,
    private val orderEventsPublisher: OrderEventsPublisher
) {
    private val logger = LoggerFactory.getLogger(CourierService::class.java)

    fun getCourierById(id: Uuid): ru.jetmeal.delivery.models.Courier? {
        return courierRepository.findById(id)
    }

    fun registerCourier(userId: Uuid): ru.jetmeal.delivery.models.Courier {
        val existing = courierRepository.findByUserId(userId)
        if (existing != null) {
            return existing
        }

        val courier = ru.jetmeal.delivery.models.Courier(
            id = Uuid.parse(UUID.randomUUID().toString()),
            userId = userId,
            location = Point(lat = 0.0, lon = 0.0),
            lastUpdated = System.currentTimeMillis(),
            assigned = false,
        )

        courierRepository.save(courier)
        return courier
    }

    fun updateCourier(userId: Uuid): ru.jetmeal.delivery.models.Courier? {
        val existing = courierRepository.findByUserId(userId) ?: return null
        val updated = existing.copy(lastUpdated = System.currentTimeMillis())
        courierRepository.save(updated)
        return updated
    }

    fun assignCourierToOrder(orderChangedMessage: OrderChangedMessage) {
        val orderLocation = orderChangedMessage.location?.let {
            Point(
                lon = it.lon,
                lat = it.lat,
            )
        }
        if (orderLocation == null) {
            logger.warn("Order {} has no location; skipping courier assignment", orderChangedMessage.orderId)
            return
        }

        val courier = positionService.findClosestAvailableCourier(orderLocation)
        if (courier == null) {
            logger.info("No available couriers for order {}", orderChangedMessage.orderId)
            return
        }

        courierRepository.save(courier.copy(assigned = true))
        logger.info("Assigned courier {} to order {}", courier.id, orderChangedMessage.orderId)

        orderEventsPublisher.publish(orderChangedMessage.copy(
            eventType = OrderEventType.UPDATED,
            courierId = courier.id,
        ))
    }

    fun freeCourier(orderCHangedMessage: OrderChangedMessage) {
        val courierId = orderCHangedMessage.courierId ?: return
        courierRepository.findById(courierId)?.let {
            courierRepository.save(it.copy(assigned = false))
            logger.info("Freed courier {} from order {}", courierId, orderCHangedMessage.orderId)
        }
    }
}