package ru.jetmeal.order.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import ru.jetmeal.order.domain.Order;
import ru.jetmeal.order.domain.OrderStatus;
import ru.jetmeal.order.repository.OrderRepository;

@SpringBootTest(classes = OrderPersistenceTestApplication.class)
@Testcontainers
class OrderJdbcRepositoryIT {

    private final OrderRepository orderRepository;

    @Autowired
    OrderJdbcRepositoryIT(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void registerDataSource(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("spring.liquibase.change-log", () -> "classpath:db/changelog/db.changelog-master.yaml");
    }

    @Test
    void crudAndActiveQuery() {
        var id = UUID.randomUUID();
        var userId = UUID.randomUUID().toString();
        var restaurantId = UUID.randomUUID().toString();
        var now = Instant.now();
        var menuItemId = UUID.randomUUID().toString();
        var order = new Order(
                id,
                userId,
                restaurantId,
                null,
                OrderStatus.PENDING,
                new BigDecimal("12.34"),
                Map.of(menuItemId, 2),
                "door",
                now,
                now);

        orderRepository.insert(order);

        assertThat(orderRepository.findById(id)).isPresent().get().satisfies(o -> {
            assertThat(o.userId()).isEqualTo(userId);
            assertThat(o.courierId()).isNull();
            assertThat(o.menuItems()).containsEntry(menuItemId, 2);
        });

        assertThat(orderRepository.findAllActive()).extracting(Order::id).contains(id);

        var updated = new Order(
                id,
                userId,
                restaurantId,
                null,
                OrderStatus.DELIVERED,
                new BigDecimal("15.00"),
                Map.of(menuItemId, 1),
                "done",
                order.createdAt(),
                Instant.now());
        orderRepository.update(updated);

        assertThat(orderRepository.findAllActive()).noneMatch(o -> o.id().equals(id));

        orderRepository.deleteById(id);
        assertThat(orderRepository.findById(id)).isEmpty();
    }

    @Test
    void findAllReturnsInsertedOrders() {
        var id = UUID.randomUUID();
        var now = Instant.now();
        var order = new Order(
                id,
                UUID.randomUUID().toString(),
                UUID.randomUUID().toString(),
                null,
                OrderStatus.CONFIRMED,
                BigDecimal.ONE,
                Map.of(UUID.randomUUID().toString(), 1),
                null,
                now,
                now);
        orderRepository.insert(order);
        List<Order> all = orderRepository.findAll();
        assertThat(all).extracting(Order::id).contains(id);
        orderRepository.deleteById(id);
    }
}
