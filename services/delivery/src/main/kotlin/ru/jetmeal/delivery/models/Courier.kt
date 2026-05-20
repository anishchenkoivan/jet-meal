package ru.jetmeal.delivery.models

import ru.jetmeal.delivery.services.geo.model.Point
import kotlin.uuid.Uuid

data class Courier(
    val id: Uuid,
    val userId: Uuid,
    val location: Point,
    val lastUpdated: Long,
    val assigned: Boolean = false,
)
