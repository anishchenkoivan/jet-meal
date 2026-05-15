package ru.jetmeal.order.service;

import java.util.List;
import java.util.UUID;
import ru.jetmeal.order.domain.Order;

public interface OrderApplicationService {

    Order create(CreateOrderCommand command);

    Order get(UUID id);

    List<Order> list(boolean activeOnly);

    Order update(UUID id, UpdateOrderCommand command);

    Order patch(UUID id, PatchOrderCommand command);

    void delete(UUID id);
}
