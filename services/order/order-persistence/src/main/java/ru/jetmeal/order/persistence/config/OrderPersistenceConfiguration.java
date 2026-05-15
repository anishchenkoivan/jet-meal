package ru.jetmeal.order.persistence.config;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import ru.jetmeal.order.persistence.OrderJdbcRepository;

@Configuration
@ComponentScan(basePackageClasses = OrderJdbcRepository.class)
public class OrderPersistenceConfiguration {}
