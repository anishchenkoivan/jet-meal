package ru.jetmeal.delivery.repositories

import ru.jetmeal.delivery.models.Courier
import ru.jetmeal.delivery.services.geo.model.Point
import kotlin.uuid.Uuid

interface CourierRepository {
    fun save(courier: Courier)
    fun findById(id: Uuid): Courier?
    fun findByUserId(userId: Uuid): Courier?
    fun findClosestAvailable(location: Point): Courier?
}