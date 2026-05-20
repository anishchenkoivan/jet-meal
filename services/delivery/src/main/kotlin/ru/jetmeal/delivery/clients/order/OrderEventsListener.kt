package ru.jetmeal.delivery.clients.order

import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory
import org.springframework.kafka.annotation.KafkaListener
import org.springframework.stereotype.Component
import ru.jetmeal.delivery.services.courier.CourierService

@Component
class OrderEventsListener(
	private val objectMapper: ObjectMapper,
	private val courierService: CourierService,
) {
	private val logger = LoggerFactory.getLogger(OrderEventsListener::class.java)

	@KafkaListener(topics = ["\${delivery.kafka.order-events-topic}"])
	fun onOrderChanged(rawMessage: String) {
		val message = try {
			objectMapper.readValue(rawMessage, OrderChangedMessage::class.java)
		} catch (ex: Exception) {
			logger.warn("Failed to parse order event payload: {}", rawMessage, ex)
			return
		}

		when (message.eventType) {
			OrderEventType.CREATED -> if (message.courierId == null) {
				courierService.assignCourierToOrder(message)
			}
			OrderEventType.CANCELLED -> courierService.freeCourier(message)
			OrderEventType.FINISHED -> courierService.freeCourier(message)
			else -> {}
		}
	}
}
