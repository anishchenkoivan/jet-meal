pluginManagement {
	repositories {
		mavenCentral()
		gradlePluginPortal()
	}
	plugins {
		id("org.springframework.boot") version "4.0.5"
		id("io.spring.dependency-management") version "1.1.7"
		id("com.diffplug.spotless") version "7.0.4"
	}
}

rootProject.name = "order"

include(
	"order-persistence-api",
	"order-persistence",
	"order-kafka",
	"order-cache",
	"order-clients",
	"order-service-api",
	"order-service",
	"order-api",
	"order-main",
)
