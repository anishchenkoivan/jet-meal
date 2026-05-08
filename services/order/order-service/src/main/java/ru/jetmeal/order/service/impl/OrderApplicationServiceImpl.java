package ru.jetmeal.order.service.impl;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.jetmeal.order.cache.ActiveOrderCache;
import ru.jetmeal.order.domain.Order;
import ru.jetmeal.order.domain.OrderStatus;
import ru.jetmeal.order.kafka.OrderChangedEventPublisher;
import ru.jetmeal.order.repository.OrderRepository;
import ru.jetmeal.order.service.CreateOrderCommand;
import ru.jetmeal.order.service.OrderApplicationService;
import ru.jetmeal.order.service.PatchOrderCommand;
import ru.jetmeal.order.service.RestaurantMenuPricingPort;
import ru.jetmeal.order.service.UpdateOrderCommand;
import ru.jetmeal.order.service.exception.OrderNotFoundException;

@Service
@RequiredArgsConstructor
public class OrderApplicationServiceImpl implements OrderApplicationService {

    private final OrderRepository orderRepository;
    private final ActiveOrderCache activeOrderCache;
    private final OrderChangedEventPublisher orderChangedEventPublisher;
    private final RestaurantMenuPricingPort menuPricing;

    @Override
    @Transactional
    public Order create(CreateOrderCommand command) {
        var now = Instant.now();
        var total = menuPricing.totalForMenu(command.restaurantId(), command.menuItems());
        var order = new Order(
                UUID.randomUUID(),
                command.userId(),
                command.restaurantId(),
                null,
                command.status(),
                total,
                command.menuItems(),
                command.comment(),
                now,
                now);
        var saved = orderRepository.insert(order);
        activeOrderCache.put(saved);
        orderChangedEventPublisher.publishCreated(saved);
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public Order get(UUID id) {
        return orderRepository.findById(id).orElseThrow(() -> new OrderNotFoundException(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> list(boolean activeOnly) {
        if (activeOnly) {
            return activeOrderCache.getAllActive();
        }
        return orderRepository.findAll();
    }

    @Override
    @Transactional
    public Order update(UUID id, UpdateOrderCommand command) {
        var existing = orderRepository.findById(id).orElseThrow(() -> new OrderNotFoundException(id));
        var now = Instant.now();
        var total = menuPricing.totalForMenu(command.restaurantId(), command.menuItems());
        var updated = new Order(
                existing.id(),
                command.userId(),
                command.restaurantId(),
                command.courierId() != null ? command.courierId() : existing.courierId(),
                command.status(),
                total,
                command.menuItems(),
                command.comment(),
                existing.createdAt(),
                now);
        var saved = orderRepository.update(updated);
        activeOrderCache.put(saved);
        publishOrderChanged(saved);
        return saved;
    }

    @Override
    @Transactional
    public Order patch(UUID id, PatchOrderCommand command) {
        var existing = orderRepository.findById(id).orElseThrow(() -> new OrderNotFoundException(id));
        var now = Instant.now();
        var restaurantId = command.restaurantId() != null ? command.restaurantId() : existing.restaurantId();
        var menuItems = command.menuItems() != null ? command.menuItems() : existing.menuItems();
        var total =
                command.menuItems() != null ? menuPricing.totalForMenu(restaurantId, menuItems) : existing.totalCost();
        var merged = new Order(
                existing.id(),
                command.userId() != null ? command.userId() : existing.userId(),
                restaurantId,
                command.courierId() != null ? command.courierId() : existing.courierId(),
                command.status() != null ? command.status() : existing.status(),
                total,
                menuItems,
                command.comment() != null ? command.comment() : existing.comment(),
                existing.createdAt(),
                now);
        var saved = orderRepository.update(merged);
        activeOrderCache.put(saved);
        publishOrderChanged(saved);
        return saved;
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        var existing = orderRepository.findById(id).orElseThrow(() -> new OrderNotFoundException(id));
        orderChangedEventPublisher.publishCancelled(existing);
        orderRepository.deleteById(id);
        activeOrderCache.remove(id);
    }

    private void publishOrderChanged(Order order) {
        if (order.status() == OrderStatus.CANCELLED) {
            orderChangedEventPublisher.publishCancelled(order);
        } else if (order.status() == OrderStatus.FINISHED) {
            orderChangedEventPublisher.publishFinished(order);
        } else {
            orderChangedEventPublisher.publishUpdated(order);
        }
    }
}
