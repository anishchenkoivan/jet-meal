package ru.jetmeal.delivery.controllers

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RestController
import ru.jetmeal.delivery.generated.api.CouriersApi
import ru.jetmeal.delivery.generated.model.Courier
import ru.jetmeal.delivery.generated.model.CourierCreateRequest
import ru.jetmeal.delivery.generated.model.Point
import ru.jetmeal.delivery.services.courier.CourierService
import ru.jetmeal.delivery.services.geo.PositionService
import kotlin.uuid.Uuid
import java.util.UUID
import ru.jetmeal.delivery.models.Courier as CourierModel

@RestController
class CouriersController(
    private val courierService: CourierService,
    private val positionService: PositionService,
) : CouriersApi {
    override fun getCourierById(id: UUID): ResponseEntity<Courier> {
        val courier = courierService.getCourierById(id.toKotlinUuid())
            ?: return ResponseEntity.notFound().build()

        return ResponseEntity.ok(courier.toModel())
    }

    override fun registerCourier(courierCreateRequest: CourierCreateRequest): ResponseEntity<Courier> {
        val courier = courierService.registerCourier(courierCreateRequest.userId.toKotlinUuid())
        return ResponseEntity.status(HttpStatus.CREATED).body(courier.toModel())
    }

    override fun updateCourier(courierCreateRequest: CourierCreateRequest): ResponseEntity<Courier> {
        val courier = courierService.updateCourier(courierCreateRequest.userId.toKotlinUuid())
            ?: return ResponseEntity.notFound().build()

        return ResponseEntity.ok(courier.toModel())
    }

    override fun updateCourierPosition(id: UUID, point: Point): ResponseEntity<Unit> {
        positionService.updateCourierPosition(id.toKotlinUuid(), point)
        return ResponseEntity.ok().build()
    }

    private fun UUID.toKotlinUuid(): Uuid = Uuid.parse(this.toString())

    private fun CourierModel.toModel(): Courier {
        return Courier(
            id = UUID.fromString(this.id.toString()),
            userId = UUID.fromString(this.userId.toString()),
        )
    }
}
