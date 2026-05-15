package ru.jetmeal.order.service;

import java.math.BigDecimal;
import java.util.Map;

/** Resolves line totals for an order from the restaurant (businesses) menu catalog. */
public interface RestaurantMenuPricingPort {

    BigDecimal totalForMenu(String restaurantId, Map<String, Integer> menuItems);
}
