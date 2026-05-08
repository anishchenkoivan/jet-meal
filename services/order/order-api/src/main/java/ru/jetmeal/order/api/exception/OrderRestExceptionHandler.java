package ru.jetmeal.order.api.exception;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import ru.jetmeal.order.service.exception.MenuPricingException;
import ru.jetmeal.order.service.exception.OrderNotFoundException;

@RestControllerAdvice
public class OrderRestExceptionHandler {

    @ExceptionHandler(OrderNotFoundException.class)
    public ResponseEntity<Void> handleNotFound(OrderNotFoundException ex) {
        return ResponseEntity.notFound().build();
    }

    @ExceptionHandler(MenuPricingException.class)
    public ResponseEntity<Map<String, String>> handleMenuPricing(MenuPricingException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }
}
