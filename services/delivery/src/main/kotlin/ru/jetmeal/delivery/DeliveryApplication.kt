package ru.jetmeal.delivery

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@Suppress("ImplicitSubclassInspection")
@SpringBootApplication
class DeliveryApplication

fun main(args: Array<String>) {
	runApplication<DeliveryApplication>(*args)
}
