package ru.jetmeal.delivery.repositories

import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.stereotype.Repository
import ru.jetmeal.delivery.models.Courier
import ru.jetmeal.delivery.services.geo.model.Point
import kotlin.uuid.Uuid

@Repository
class JdbcCourierRepository(
    private val jdbcTemplate: NamedParameterJdbcTemplate,
) : CourierRepository {
    private fun toJdbcUuid(value: Uuid): java.util.UUID = java.util.UUID.fromString(value.toString())

    override fun save(courier: Courier) {
        val params = mapOf(
            "id" to toJdbcUuid(courier.id),
            "user_id" to toJdbcUuid(courier.userId),
            "lat" to courier.location.lat,
            "lon" to courier.location.lon,
            "last_updated" to courier.lastUpdated,
            "assigned" to courier.assigned,
        )

        jdbcTemplate.update(
            """
            INSERT INTO couriers (id, user_id, location, last_updated, assigned)
            VALUES (
                :id,
                :user_id,
                ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
                :last_updated,
                :assigned
            )
            ON CONFLICT (id)
            DO UPDATE SET
                user_id = EXCLUDED.user_id,
                location = EXCLUDED.location,
                last_updated = EXCLUDED.last_updated,
                assigned = EXCLUDED.assigned
            """.trimIndent(),
            params,
        )
    }

    override fun findById(id: Uuid): Courier? {
        val params = mapOf("id" to toJdbcUuid(id))

        return jdbcTemplate.query(
            """
            SELECT
                id,
                user_id,
                ST_Y(location::geometry) AS lat,
                ST_X(location::geometry) AS lon,
                last_updated,
                assigned
            FROM couriers
            WHERE id = :id
            """.trimIndent(),
            params,
        ) { rs, _ ->
            Courier(
                id = Uuid.parse(rs.getString("id")),
                userId = Uuid.parse(rs.getString("user_id")),
                location = Point(
                    lat = rs.getDouble("lat"),
                    lon = rs.getDouble("lon"),
                ),
                lastUpdated = rs.getLong("last_updated"),
                assigned = rs.getBoolean("assigned"),
            )
        }.firstOrNull()
    }

    override fun findByUserId(userId: Uuid): Courier? {
        val params = mapOf("user_id" to toJdbcUuid(userId))

        return jdbcTemplate.query(
            """
            SELECT
                id,
                user_id,
                ST_Y(location::geometry) AS lat,
                ST_X(location::geometry) AS lon,
                last_updated,
                assigned
            FROM couriers
            WHERE user_id = :user_id
            LIMIT 1
            """.trimIndent(),
            params,
        ) { rs, _ ->
            Courier(
                id = Uuid.parse(rs.getString("id")),
                userId = Uuid.parse(rs.getString("user_id")),
                location = Point(
                    lat = rs.getDouble("lat"),
                    lon = rs.getDouble("lon"),
                ),
                lastUpdated = rs.getLong("last_updated"),
                assigned = rs.getBoolean("assigned"),
            )
        }.firstOrNull()
    }

    override fun findClosestAvailable(location: Point): Courier? {
        val params = mapOf(
            "lat" to location.lat,
            "lon" to location.lon,
        )

        return jdbcTemplate.query(
            """
            SELECT
                id,
                user_id,
                ST_Y(location::geometry) AS lat,
                ST_X(location::geometry) AS lon,
                last_updated,
                assigned
            FROM couriers
            WHERE assigned = FALSE
            ORDER BY ST_Distance(
                location,
                ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography
            )
            LIMIT 1
            """.trimIndent(),
            params,
        ) { rs, _ ->
            Courier(
                id = Uuid.parse(rs.getString("id")),
                userId = Uuid.parse(rs.getString("user_id")),
                location = Point(
                    lat = rs.getDouble("lat"),
                    lon = rs.getDouble("lon"),
                ),
                lastUpdated = rs.getLong("last_updated"),
                assigned = rs.getBoolean("assigned"),
            )
        }.firstOrNull()
    }
}
