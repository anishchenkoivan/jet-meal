package ru.jetmeal.order.domain;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record Order(
        UUID id,
        String userId,
        String restaurantId,
        UUID courierId,
        OrderStatus status,
        BigDecimal totalCost,
        Map<String, Integer> menuItems,
        String comment,
        Instant createdAt,
        Instant updatedAt) {}
