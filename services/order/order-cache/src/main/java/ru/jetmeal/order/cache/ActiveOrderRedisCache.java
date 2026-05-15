package ru.jetmeal.order.cache;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import ru.jetmeal.order.domain.Order;

@Component
@RequiredArgsConstructor
public class ActiveOrderRedisCache implements ActiveOrderCache {

    static final String HASH_KEY = "jetmeal:orders:active";

    private final StringRedisTemplate redis;
    private final ObjectMapper objectMapper;

    @Override
    public void put(Order order) {
        if (!order.status().isActive()) {
            remove(order.id());
            return;
        }
        try {
            String json = objectMapper.writeValueAsString(order);
            redis.opsForHash().put(HASH_KEY, order.id().toString(), json);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize order for cache", e);
        }
    }

    @Override
    public void remove(UUID id) {
        redis.opsForHash().delete(HASH_KEY, id.toString());
    }

    @Override
    public Optional<Order> get(UUID id) {
        Object raw = redis.opsForHash().get(HASH_KEY, id.toString());
        if (raw == null) {
            return Optional.empty();
        }
        try {
            return Optional.of(objectMapper.readValue(raw.toString(), Order.class));
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to deserialize cached order", e);
        }
    }

    @Override
    public List<Order> getAllActive() {
        Set<Object> keys = redis.opsForHash().keys(HASH_KEY);
        if (keys == null || keys.isEmpty()) {
            return List.of();
        }
        List<Order> out = new ArrayList<>();
        for (Object key : keys) {
            Object raw = redis.opsForHash().get(HASH_KEY, key);
            if (raw == null) {
                continue;
            }
            try {
                out.add(objectMapper.readValue(raw.toString(), Order.class));
            } catch (JsonProcessingException e) {
                throw new IllegalStateException("Failed to deserialize cached order", e);
            }
        }
        return Collections.unmodifiableList(out);
    }

    @Override
    public void replaceAll(List<Order> orders) {
        redis.delete(HASH_KEY);
        for (Order order : orders) {
            put(order);
        }
    }
}
