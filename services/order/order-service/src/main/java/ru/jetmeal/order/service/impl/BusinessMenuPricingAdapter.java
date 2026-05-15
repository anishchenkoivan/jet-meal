package ru.jetmeal.order.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.jetmeal.business.client.ApiException;
import ru.jetmeal.business.client.api.DefaultApi;
import ru.jetmeal.business.client.model.Meal;
import ru.jetmeal.business.client.model.V1ListMealsRequest;
import ru.jetmeal.order.service.RestaurantMenuPricingPort;
import ru.jetmeal.order.service.exception.MenuPricingException;

@Component
@RequiredArgsConstructor
public class BusinessMenuPricingAdapter implements RestaurantMenuPricingPort {

    private final DefaultApi businessApi;

    @Override
    public BigDecimal totalForMenu(String restaurantId, Map<String, Integer> menuItems) {
        if (menuItems == null || menuItems.isEmpty()) {
            throw new MenuPricingException("menuItems must not be empty");
        }
        var request = new V1ListMealsRequest();
        request.setBusinessId(restaurantId);
        try {
            var response = businessApi.searchMeals(request);
            var prices = new HashMap<String, BigDecimal>();
            for (Meal meal : response.getMeals()) {
                prices.put(meal.getMealId(), meal.getPrice());
            }
            BigDecimal total = BigDecimal.ZERO;
            for (var e : menuItems.entrySet()) {
                BigDecimal unit = prices.get(e.getKey());
                if (unit == null) {
                    throw new MenuPricingException("Unknown menu item id: " + e.getKey());
                }
                total = total.add(unit.multiply(BigDecimal.valueOf(e.getValue())));
            }
            return total.setScale(2, RoundingMode.HALF_UP);
        } catch (ApiException e) {
            throw new MenuPricingException("Failed to load menu prices: HTTP " + e.getCode(), e);
        }
    }
}
