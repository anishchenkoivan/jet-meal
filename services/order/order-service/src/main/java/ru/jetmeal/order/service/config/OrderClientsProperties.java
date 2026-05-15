package ru.jetmeal.order.service.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "order.clients")
@Getter
@Setter
public class OrderClientsProperties {

    /**
     * Base URL of the businesses HTTP API. In Kubernetes use the service DNS name, e.g.
     * {@code http://businesses-service} (same namespace, ClusterIP port 80).
     */
    private String businessServiceUrl = "http://businesses-service";
}
