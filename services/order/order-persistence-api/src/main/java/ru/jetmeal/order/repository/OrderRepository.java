package ru.jetmeal.order.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import ru.jetmeal.order.domain.Order;

public interface OrderRepository {

    Order insert(Order order);

    Optional<Order> findById(UUID id);

    List<Order> findAll();

    List<Order> findAllActive();

    Order update(Order order);

    void deleteById(UUID id);
}
