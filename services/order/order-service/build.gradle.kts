plugins {
	java
}

dependencies {
	implementation(project(":order-service-api"))
	implementation(project(":order-persistence-api"))
	implementation(project(":order-persistence"))
	implementation(project(":order-kafka"))
	implementation(project(":order-cache"))
	implementation(project(":order-clients"))
	implementation("org.springframework.boot:spring-boot")
	implementation("org.springframework:spring-context")
	implementation("org.springframework:spring-tx")
	implementation("jakarta.annotation:jakarta.annotation-api")

	testImplementation("org.junit.jupiter:junit-jupiter")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}
