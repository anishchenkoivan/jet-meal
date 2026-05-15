package ru.jetmeal.order.kafka.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "order.kafka")
@Getter
@Setter
public class OrderKafkaProperties {

    /**
     * Kafka topic for order created / updated / cancelled events.
     */
    private String topic = "order.changed";
}
