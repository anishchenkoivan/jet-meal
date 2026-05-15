package ru.jetmeal.order.api;

import jakarta.validation.Valid;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import ru.jetmeal.order.api.generated.OrdersApi;
import ru.jetmeal.order.api.generated.model.CreateOrderRequest;
import ru.jetmeal.order.api.generated.model.OrderResponse;
import ru.jetmeal.order.api.generated.model.PatchOrderRequest;
import ru.jetmeal.order.api.generated.model.UpdateOrderRequest;
import ru.jetmeal.order.domain.Order;
import ru.jetmeal.order.domain.OrderStatus;
import ru.jetmeal.order.service.CreateOrderCommand;
import ru.jetmeal.order.service.OrderApplicationService;
import ru.jetmeal.order.service.PatchOrderCommand;
import ru.jetmeal.order.service.UpdateOrderCommand;

@RestController
@RequiredArgsConstructor
public class OrderApiController implements OrdersApi {

    private final OrderApplicationService orderApplicationService;

    @Override
    public ResponseEntity<OrderResponse> createOrder(@Valid CreateOrderRequest request) {
        var status = request.getStatus() == null || request.getStatus().isBlank()
                ? OrderStatus.PENDING
                : OrderStatus.valueOf(request.getStatus());
        var command = new CreateOrderCommand(
                request.getUserId(), request.getRestaurantId(), status, request.getMenuItems(), request.getComment());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(orderApplicationService.create(command)));
    }

    @Override
    public ResponseEntity<OrderResponse> getOrder(UUID id) {
        return ResponseEntity.ok(toResponse(orderApplicationService.get(id)));
    }

    @Override
    public ResponseEntity<List<OrderResponse>> listOrders(Boolean activeOnly) {
        boolean active = activeOnly != null && activeOnly;
        return ResponseEntity.ok(orderApplicationService.list(active).stream()
                .map(OrderApiController::toResponse)
                .toList());
    }

    @Override
    public ResponseEntity<OrderResponse> updateOrder(UUID id, @Valid UpdateOrderRequest request) {
        var command = new UpdateOrderCommand(
                request.getUserId(),
                request.getRestaurantId(),
                request.getCourierId(),
                OrderStatus.valueOf(request.getStatus()),
                request.getMenuItems(),
                request.getComment());
        return ResponseEntity.ok(toResponse(orderApplicationService.update(id, command)));
    }

    @Override
    public ResponseEntity<OrderResponse> patchOrder(UUID id, @Valid PatchOrderRequest request) {
        var menu = request.getMenuItems();
        if (menu != null && menu.isEmpty()) {
            menu = null;
        }
        OrderStatus status = null;
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            status = OrderStatus.valueOf(request.getStatus());
        }
        var command = new PatchOrderCommand(
                request.getUserId(),
                request.getRestaurantId(),
                request.getCourierId(),
                status,
                menu,
                request.getComment());
        return ResponseEntity.ok(toResponse(orderApplicationService.patch(id, command)));
    }

    @Override
    public ResponseEntity<Void> deleteOrder(UUID id) {
        orderApplicationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private static OrderResponse toResponse(Order order) {
        var r = new OrderResponse();
        r.setId(order.id());
        r.setUserId(order.userId());
        r.setRestaurantId(order.restaurantId());
        r.setCourierId(order.courierId());
        r.setStatus(order.status().name());
        r.setTotalCost(order.totalCost());
        r.setMenuItems(order.menuItems());
        r.setComment(order.comment());
        r.setCreatedAt(order.createdAt().atOffset(ZoneOffset.UTC));
        r.setUpdatedAt(order.updatedAt().atOffset(ZoneOffset.UTC));
        return r;
    }
}
