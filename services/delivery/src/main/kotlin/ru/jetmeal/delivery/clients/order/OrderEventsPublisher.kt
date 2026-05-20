package ru.jetmeal.delivery.clients.order

import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.stereotype.Component

@Component
class OrderEventsPublisher(
    private val kafkaTemplate: KafkaTemplate<String, String>,
    private val objectMapper: ObjectMapper,
    @Value($$"${delivery.kafka.order-events-topic}") private val orderEventsTopic: String,
) {
	private val logger = LoggerFactory.getLogger(OrderEventsPublisher::class.java)

	fun publish(message: OrderChangedMessage) {
		val payload = try {
			objectMapper.writeValueAsString(message)
		} catch (ex: Exception) {
			logger.warn("Failed to serialize order event: {}", message, ex)
			return
		}

		kafkaTemplate.send(orderEventsTopic, payload)
	}
}
