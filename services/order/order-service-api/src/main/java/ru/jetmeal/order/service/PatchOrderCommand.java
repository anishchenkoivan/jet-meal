package ru.jetmeal.order.service;

import java.util.Map;
import java.util.UUID;
import ru.jetmeal.order.domain.OrderStatus;

/**
 * Partial update: {@code null} means the field is left unchanged.
 */
public record PatchOrderCommand(
        String userId,
        String restaurantId,
        UUID courierId,
        OrderStatus status,
        Map<String, Integer> menuItems,
        String comment) {}
