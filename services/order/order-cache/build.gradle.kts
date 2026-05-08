plugins {
	java
}

dependencies {
	implementation(project(":order-persistence-api"))
	implementation("org.springframework.boot:spring-boot-starter-data-redis")
	implementation("com.fasterxml.jackson.core:jackson-databind")
	implementation("org.springframework:spring-context")

	testImplementation("org.junit.jupiter:junit-jupiter")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}
