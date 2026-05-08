package ru.jetmeal.order.service.config;

import java.net.URI;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import ru.jetmeal.business.client.ApiClient;
import ru.jetmeal.business.client.api.DefaultApi;

@Configuration
@EnableConfigurationProperties(OrderClientsProperties.class)
public class BusinessApiConfiguration {

    @Bean
    public ApiClient businessApiClient(OrderClientsProperties properties) {
        String base = properties.getBusinessServiceUrl().replaceAll("/+$", "");
        URI u = URI.create(base);
        return new ApiClient()
                .setScheme(u.getScheme())
                .setHost(u.getHost())
                .setPort(u.getPort())
                .setBasePath("");
    }

    @Bean
    public DefaultApi businessDefaultApi(ApiClient businessApiClient) {
        return new DefaultApi(businessApiClient);
    }
}
