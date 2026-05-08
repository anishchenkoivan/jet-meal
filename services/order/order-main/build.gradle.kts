plugins {
	java
	id("org.springframework.boot")
}

dependencies {
	implementation(project(":order-api"))
	implementation(project(":order-service"))
	implementation(project(":order-persistence"))
	implementation(project(":order-kafka"))
	implementation(project(":order-cache"))

	implementation("org.springframework.boot:spring-boot-starter-webmvc")
	implementation("org.springframework.boot:spring-boot-starter-jdbc")
	implementation("org.springframework.boot:spring-boot-starter-liquibase")
	implementation("org.springframework.boot:spring-boot-starter-aspectj")
	implementation("org.springframework.boot:spring-boot-starter-validation")
	implementation("org.springframework.boot:spring-boot-starter-data-redis")
	implementation("org.springframework.boot:spring-boot-starter-kafka")

	runtimeOnly("org.postgresql:postgresql")

	testImplementation("org.springframework.boot:spring-boot-starter-test")
	testImplementation("org.springframework.boot:spring-boot-resttestclient")
	testImplementation("org.springframework.boot:spring-boot-restclient")
	testImplementation("org.springframework.kafka:spring-kafka-test")
	testImplementation(platform("org.testcontainers:testcontainers-bom:1.20.6"))
	testImplementation("org.testcontainers:junit-jupiter")
	testImplementation("org.testcontainers:postgresql")
	testImplementation("org.testcontainers:kafka")
	testImplementation("com.fasterxml.jackson.core:jackson-databind")
	testImplementation("org.wiremock:wiremock-standalone:3.10.0")
}

tasks.named<org.springframework.boot.gradle.tasks.bundling.BootJar>("bootJar") {
	enabled = true
}

tasks.named<Jar>("jar") {
	enabled = false
}
