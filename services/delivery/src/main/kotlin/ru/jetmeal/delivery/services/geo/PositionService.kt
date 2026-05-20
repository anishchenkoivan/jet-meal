package ru.jetmeal.delivery.services.geo

import org.springframework.stereotype.Service
import ru.jetmeal.delivery.generated.model.CourierPositionInfo
import ru.jetmeal.delivery.models.Courier
import ru.jetmeal.delivery.repositories.CourierRepository
import ru.jetmeal.delivery.services.geo.model.Point
import kotlin.uuid.Uuid
import ru.jetmeal.delivery.generated.model.Point as PointDto

@Service
class PositionService(
    private val courierRepository: CourierRepository,
) {
    fun getActiveCourierPositions(courierId: Uuid): CourierPositionInfo {
        courierRepository.findById(courierId)
        return courierRepository.findById(courierId)?.let {
            CourierPositionInfo(
                position = PointDto(
                    lat = it.location.lat,
                    lon = it.location.lon,
                )
            )
        } ?: throw IllegalArgumentException("Courier with id $courierId not found")
    }

    fun updateCourierPosition(courierId: Uuid, point: PointDto) {
        // TODO: Add redis
        courierRepository.findById(courierId)?.let {
            val updatedCourier = it.copy(
                location = Point(
                    lat = point.lat,
                    lon = point.lon,
                ),
                lastUpdated = System.currentTimeMillis(),
            )
            courierRepository.save(updatedCourier)
        } ?: throw IllegalArgumentException("Courier with id $courierId not found")
    }

    fun findClosestAvailableCourier(location: Point): Courier? {
        return courierRepository.findClosestAvailable(location)
    }
}