package ru.jetmeal.order.kafka;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import lombok.Builder;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder
public record OrderChangedMessage(
        @JsonProperty("event_type") OrderChangedEventType eventType,
        @JsonProperty("order_id") UUID orderId,
        @JsonProperty("user_id") String userId,
        @JsonProperty("restaurant_id") String restaurantId,
        @JsonProperty("courier_id") UUID courierId,
        @JsonProperty("total_cost") BigDecimal totalCost,
        @JsonProperty("menu_items") Map<String, Integer> menuItems,
        @JsonProperty("comment") String comment,
        @JsonProperty("timestamp") Instant timestamp) {}
