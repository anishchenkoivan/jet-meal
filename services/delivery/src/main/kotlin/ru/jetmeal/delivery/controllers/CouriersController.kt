package ru.jetmeal.delivery.controllers

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RestController
import ru.jetmeal.delivery.api.CouriersApi
import ru.jetmeal.delivery.model.Courier
import ru.jetmeal.delivery.model.CourierCreateRequest
import ru.jetmeal.delivery.model.Point
import java.util.UUID

@RestController
class CouriersController : CouriersApi {
    override fun getCourierById(id: UUID): ResponseEntity<Courier> {
        return super.getCourierById(id)
    }

    override fun registerCourier(courierCreateRequest: CourierCreateRequest?): ResponseEntity<Courier> {
        return super.registerCourier(courierCreateRequest)
    }

    override fun updateCourier(courierCreateRequest: CourierCreateRequest?): ResponseEntity<Courier> {
        return super.updateCourier(courierCreateRequest)
    }

    override fun updateCourierPosition(id: UUID, point: Point?): ResponseEntity<Unit> {
        return super.updateCourierPosition(id, point)
    }
}
