package ru.jetmeal.order.domain;

public enum OrderStatus {
    PENDING,
    CONFIRMED,
    PREPARING,
    READY,
    OUT_FOR_DELIVERY,
    DELIVERED,
    FINISHED,
    CANCELLED;

    public boolean isActive() {
        return this != DELIVERED && this != FINISHED && this != CANCELLED;
    }
}
