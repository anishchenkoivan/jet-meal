package ru.jetmeal.order.service.exception;

public class MenuPricingException extends RuntimeException {

    public MenuPricingException(String message) {
        super(message);
    }

    public MenuPricingException(String message, Throwable cause) {
        super(message, cause);
    }
}
