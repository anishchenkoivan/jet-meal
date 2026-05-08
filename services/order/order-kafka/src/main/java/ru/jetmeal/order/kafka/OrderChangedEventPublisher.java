package ru.jetmeal.order.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import ru.jetmeal.order.domain.Order;
import ru.jetmeal.order.kafka.config.OrderKafkaProperties;

/**
 * Publishes order lifecycle events to Kafka (ADR 01): {@link OrderChangedEventType} serialized as lowercase
 * wire names ({@code created}, {@code updated}, {@code cancelled}, {@code finished}).
 */
@Component
@RequiredArgsConstructor
public class OrderChangedEventPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final OrderKafkaProperties properties;

    public void publishCreated(Order order) {
        send(OrderChangedEventType.CREATED, order);
    }

    public void publishUpdated(Order order) {
        send(OrderChangedEventType.UPDATED, order);
    }

    public void publishCancelled(Order order) {
        send(OrderChangedEventType.CANCELLED, order);
    }

    public void publishFinished(Order order) {
        send(OrderChangedEventType.FINISHED, order);
    }

    private void send(OrderChangedEventType eventType, Order order) {
        var menuItems = new HashMap<>(order.menuItems());
        var message = OrderChangedMessage.builder()
                .eventType(eventType)
                .orderId(order.id())
                .userId(order.userId())
                .restaurantId(order.restaurantId())
                .courierId(order.courierId())
                .totalCost(order.totalCost())
                .menuItems(menuItems)
                .comment(order.comment())
                .timestamp(order.updatedAt())
                .build();
        try {
            String json = objectMapper.writeValueAsString(message);
            kafkaTemplate.send(properties.getTopic(), order.id().toString(), json);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize order changed event", e);
        }
    }
}
