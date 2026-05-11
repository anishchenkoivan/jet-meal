@file:Suppress("SpringJavaInjectionPointsAutowiringInspection")

package ru.jetmeal.delivery.clients.order

import com.fasterxml.jackson.databind.ObjectMapper
import org.apache.kafka.common.serialization.StringDeserializer
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.kafka.core.DefaultKafkaConsumerFactory
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.kafka.test.EmbeddedKafkaBroker
import org.springframework.kafka.test.utils.KafkaTestUtils
import ru.jetmeal.delivery.integration.IntegrationTestBase
import ru.jetmeal.delivery.repositories.CourierRepository
import ru.jetmeal.delivery.services.geo.model.Point
import ru.jetmeal.delivery.utils.createCourier
import ru.jetmeal.delivery.utils.createOrder
import java.time.Duration
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue
import ru.jetmeal.delivery.generated.model.Point as PointDto

class OrderEventsKafkaListenerTest : IntegrationTestBase() {
    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var kafkaTemplate: KafkaTemplate<String, String>

    @Autowired
    private lateinit var embeddedKafka: EmbeddedKafkaBroker

    @Autowired
    private lateinit var courierRepository: CourierRepository

    @Value($$"${delivery.kafka.order-events-topic}")
    private lateinit var orderEventsTopic: String

    @Test
    fun createdEvent_assignsClosestFreeCourier_andPublishesCallback() {
        val orderLocation = PointDto(lat = 55.0, lon = 37.0)

        val closestFreeCourier = createCourier(location = Point(lat = 55.0, lon = 37.0), assigned = false)
        val fartherFreeCourier = createCourier(location = Point(lat = 55.5, lon = 37.5), assigned = false)
        val busyCourier = createCourier(location = Point(lat = 55.1, lon = 37.1), assigned = true)

        courierRepository.save(closestFreeCourier)
        courierRepository.save(fartherFreeCourier)
        courierRepository.save(busyCourier)

        val orderMessage = createOrder(location = orderLocation)
        val payload = objectMapper.writeValueAsString(orderMessage)

        val consumerProps = KafkaTestUtils.consumerProps(
            "order-events-listener-test",
            "true",
            embeddedKafka,
        )
        consumerProps["auto.offset.reset"] = "latest"
        val consumer = DefaultKafkaConsumerFactory<String, String>(
            consumerProps,
            StringDeserializer(),
            StringDeserializer(),
        ).createConsumer()
        consumer.subscribe(listOf(orderEventsTopic))

        try {
            kafkaTemplate.send(orderEventsTopic, payload)

            val deadline = System.currentTimeMillis() + 5_000
            var callback: OrderChangedMessage? = null
            while (System.currentTimeMillis() < deadline && callback == null) {
                val records = consumer.poll(Duration.ofMillis(250))
                for (record in records) {
                    val message = objectMapper.readValue(record.value(), OrderChangedMessage::class.java)
                    if (message.courierId != null) {
                        callback = message
                        break
                    }
                }
            }

            assertNotNull(callback, "Expected a callback message with assigned courier")
            assertEquals(closestFreeCourier.id, callback.courierId)
            assertEquals(orderMessage.orderId, callback.orderId)

            val closestStored = courierRepository.findById(closestFreeCourier.id)
            val fartherStored = courierRepository.findById(fartherFreeCourier.id)
            val busyStored = courierRepository.findById(busyCourier.id)

            assertNotNull(closestStored)
            assertNotNull(fartherStored)
            assertNotNull(busyStored)

            assertTrue(closestStored.assigned)
            assertTrue(!fartherStored.assigned)
            assertTrue(busyStored.assigned)
        } finally {
            consumer.close()
        }
    }
}
