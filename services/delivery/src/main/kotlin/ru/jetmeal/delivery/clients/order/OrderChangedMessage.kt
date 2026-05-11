package ru.jetmeal.delivery.clients.order

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.annotation.JsonProperty
import ru.jetmeal.delivery.generated.model.Point
import java.math.BigDecimal
import java.time.Instant
import kotlin.uuid.Uuid

enum class OrderEventType {
	CREATED,
	UPDATED,
	CANCELLED,
	FINISHED,
}

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
data class OrderChangedMessage(
	@JsonProperty("event_type") val eventType: OrderEventType?,
	@JsonProperty("order_id") val orderId: Uuid?,
	@JsonProperty("user_id") val userId: String?,
	@JsonProperty("restaurant_id") val restaurantId: String?,
	@JsonProperty("location") val location: Point?,
	@JsonProperty("courier_id") val courierId: Uuid?,
	@JsonProperty("total_cost") val totalCost: BigDecimal?,
	@JsonProperty("menu_items") val menuItems: Map<String, Int>?,
	@JsonProperty("comment") val comment: String?,
	@JsonProperty("timestamp") val timestamp: Instant?
)
