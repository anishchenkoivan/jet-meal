package ru.jetmeal.order.cache;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import ru.jetmeal.order.domain.Order;

public interface ActiveOrderCache {

    void put(Order order);

    void remove(UUID id);

    Optional<Order> get(UUID id);

    List<Order> getAllActive();

    void replaceAll(List<Order> orders);
}
