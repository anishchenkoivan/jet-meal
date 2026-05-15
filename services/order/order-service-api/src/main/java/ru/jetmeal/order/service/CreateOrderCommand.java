package ru.jetmeal.order.service;

import java.util.Map;
import ru.jetmeal.order.domain.OrderStatus;

public record CreateOrderCommand(
        String userId, String restaurantId, OrderStatus status, Map<String, Integer> menuItems, String comment) {}
