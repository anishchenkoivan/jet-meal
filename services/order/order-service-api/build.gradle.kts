plugins {
	java
}

dependencies {
	implementation(project(":order-persistence-api"))

	testImplementation("org.junit.jupiter:junit-jupiter")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}
