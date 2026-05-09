package ru.jetmeal.delivery.models

import kotlin.uuid.Uuid

data class Courier(
    val id: Uuid,
    val userId: Uuid,
)
