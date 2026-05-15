package ru.jetmeal.order.persistence;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import ru.jetmeal.order.domain.Order;
import ru.jetmeal.order.domain.OrderStatus;
import ru.jetmeal.order.repository.OrderRepository;

@Repository
public class OrderJdbcRepository implements OrderRepository {

    private static final String INSERT =
            """
			INSERT INTO orders (id, user_id, restaurant_id, courier_id, status, total_cost, menu_items, comment, created_at, updated_at)
			VALUES (:id, :userId, :restaurantId, :courierId, :status, :totalCost, CAST(:menuItems AS jsonb), :comment, :createdAt, :updatedAt)
			""";

    private static final String SELECT_BY_ID =
            """
			SELECT id, user_id, restaurant_id, courier_id, status, total_cost, menu_items, comment, created_at, updated_at
			FROM orders WHERE id = :id
			""";

    private static final String SELECT_ALL =
            """
			SELECT id, user_id, restaurant_id, courier_id, status, total_cost, menu_items, comment, created_at, updated_at
			FROM orders ORDER BY created_at DESC
			""";

    private static final String SELECT_ACTIVE =
            """
			SELECT id, user_id, restaurant_id, courier_id, status, total_cost, menu_items, comment, created_at, updated_at
			FROM orders
			WHERE status NOT IN ('DELIVERED', 'FINISHED', 'CANCELLED')
			ORDER BY created_at DESC
			""";

    private static final String UPDATE =
            """
			UPDATE orders SET
				user_id = :userId,
				restaurant_id = :restaurantId,
				courier_id = :courierId,
				status = :status,
				total_cost = :totalCost,
				menu_items = CAST(:menuItems AS jsonb),
				comment = :comment,
				updated_at = :updatedAt
			WHERE id = :id
			""";

    private static final String DELETE = "DELETE FROM orders WHERE id = :id";

    private final NamedParameterJdbcTemplate jdbc;
    private final ObjectMapper objectMapper;
    private final RowMapper<Order> rowMapper;

    public OrderJdbcRepository(NamedParameterJdbcTemplate jdbc, ObjectMapper objectMapper) {
        this.jdbc = jdbc;
        this.objectMapper = objectMapper;
        this.rowMapper = new OrderRowMapper(objectMapper);
    }

    @Override
    public Order insert(Order order) {
        var params = toParams(order);
        jdbc.update(INSERT, params);
        return order;
    }

    @Override
    public Optional<Order> findById(UUID id) {
        var params = new MapSqlParameterSource("id", id);
        var list = jdbc.query(SELECT_BY_ID, params, rowMapper);
        return list.stream().findFirst();
    }

    @Override
    public List<Order> findAll() {
        return jdbc.query(SELECT_ALL, rowMapper);
    }

    @Override
    public List<Order> findAllActive() {
        return jdbc.query(SELECT_ACTIVE, rowMapper);
    }

    @Override
    public Order update(Order order) {
        var params = toParams(order);
        int updated = jdbc.update(UPDATE, params);
        if (updated != 1) {
            throw new IllegalStateException("Expected one row updated for id " + order.id());
        }
        return order;
    }

    @Override
    public void deleteById(UUID id) {
        jdbc.update(DELETE, new MapSqlParameterSource("id", id));
    }

    private MapSqlParameterSource toParams(Order order) throws RuntimeException {
        try {
            String menuJson = objectMapper.writeValueAsString(order.menuItems());
            return new MapSqlParameterSource()
                    .addValue("id", order.id())
                    .addValue("userId", order.userId())
                    .addValue("restaurantId", order.restaurantId())
                    .addValue("courierId", order.courierId())
                    .addValue("status", order.status().name())
                    .addValue("totalCost", order.totalCost())
                    .addValue("menuItems", menuJson)
                    .addValue("comment", order.comment())
                    .addValue("createdAt", Timestamp.from(order.createdAt()))
                    .addValue("updatedAt", Timestamp.from(order.updatedAt()));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @RequiredArgsConstructor
    private static final class OrderRowMapper implements RowMapper<Order> {
        private final ObjectMapper objectMapper;

        @Override
        public Order mapRow(ResultSet rs, int rowNum) throws SQLException {
            UUID id = rs.getObject("id", UUID.class);
            String userId = rs.getString("user_id");
            String restaurantId = rs.getString("restaurant_id");
            UUID courierId = rs.getObject("courier_id", UUID.class);
            OrderStatus status = OrderStatus.valueOf(rs.getString("status"));
            var totalCost = rs.getBigDecimal("total_cost");
            String menuJson = rs.getString("menu_items");
            Map<String, Integer> menuItems = parseMenuItems(menuJson);
            String comment = rs.getString("comment");
            var createdAt = rs.getTimestamp("created_at").toInstant();
            var updatedAt = rs.getTimestamp("updated_at").toInstant();
            return new Order(
                    id, userId, restaurantId, courierId, status, totalCost, menuItems, comment, createdAt, updatedAt);
        }

        private Map<String, Integer> parseMenuItems(String menuJson) throws SQLException {
            try {
                return objectMapper.readValue(menuJson, new TypeReference<>() {});
            } catch (Exception e) {
                throw new SQLException("Invalid menu_items JSON", e);
            }
        }
    }
}
