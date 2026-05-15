package ru.jetmeal.order.service.config;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import ru.jetmeal.order.cache.ActiveOrderCache;
import ru.jetmeal.order.repository.OrderRepository;

@Configuration
public class ActiveOrderCacheWarmupConfiguration {

    @Bean
    ApplicationRunner warmActiveOrdersOnReady(OrderRepository orderRepository, ActiveOrderCache activeOrderCache) {
        return args -> activeOrderCache.replaceAll(orderRepository.findAllActive());
    }
}
