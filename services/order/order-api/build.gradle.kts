plugins {
	java
	id("org.openapi.generator") version "7.10.0"
}

dependencies {
	implementation(project(":order-service-api"))
	implementation(project(":order-persistence-api"))
	implementation("org.springframework.boot:spring-boot-starter-webmvc")
	implementation("org.springframework.boot:spring-boot-starter-validation")
	implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:3.0.2")

	testImplementation("org.junit.jupiter:junit-jupiter")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

openApiGenerate {
	generatorName.set("spring")
	inputSpec.set(layout.projectDirectory.file("src/main/resources/openapi/openapi.yaml").asFile.path)
	outputDir.set(layout.buildDirectory.dir("generated/openapi").get().asFile.path)
	apiPackage.set("ru.jetmeal.order.api.generated")
	modelPackage.set("ru.jetmeal.order.api.generated.model")
	configOptions.set(
		mapOf(
			"interfaceOnly" to "true",
			"useSpringBoot3" to "true",
			"useJakartaEe" to "true",
			"dateLibrary" to "java8",
			"openApiNullable" to "false",
			"skipDefaultInterface" to "true",
			"useTags" to "true",
			"documentationProvider" to "springdoc",
			"useBeanValidation" to "true",
			"performBeanValidation" to "true"
		)
	)
	globalProperties.set(
		mapOf(
			"apis" to "",
			"models" to "",
			"supportingFiles" to "false"
		)
	)
}

sourceSets {
	named("main") {
		java.srcDir(layout.buildDirectory.dir("generated/openapi/src/main/java"))
	}
}

tasks.named("compileJava") {
	dependsOn(tasks.openApiGenerate)
}
