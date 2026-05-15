package ru.jetmeal.order.kafka;

import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Locale;

/** Kafka order.changed payload {@code event_type} (ADR 01). */
public enum OrderChangedEventType {
    CREATED,
    UPDATED,
    CANCELLED,
    FINISHED;

    @JsonValue
    public String wireName() {
        return name().toLowerCase(Locale.ROOT);
    }
}
