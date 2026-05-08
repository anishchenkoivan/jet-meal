plugins {
	java
	id("org.openapi.generator") version "7.10.0"
}

dependencies {
	implementation("com.fasterxml.jackson.core:jackson-databind")
	implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310")
	implementation("org.openapitools:jackson-databind-nullable:0.2.6")
	implementation("jakarta.annotation:jakarta.annotation-api")
}

val businessOpenApi = layout.projectDirectory.file("openapi/businesses-api.yaml").asFile.path

openApiGenerate {
	generatorName.set("java")
	inputSpec.set(businessOpenApi)
	outputDir.set(layout.buildDirectory.dir("generated/openapi").get().asFile.path)
	apiPackage.set("ru.jetmeal.business.client.api")
	modelPackage.set("ru.jetmeal.business.client.model")
	invokerPackage.set("ru.jetmeal.business.client")
	configOptions.set(
		mapOf(
			"library" to "native",
			"dateLibrary" to "java8",
			"serializationLibrary" to "jackson",
			"openApiNullable" to "true",
			"useJakartaEe" to "true",
			"hideGenerationTimestamp" to "true",
		),
	)
	generateApiTests.set(false)
	generateModelTests.set(false)
}

sourceSets {
	named("main") {
		java.srcDir(layout.buildDirectory.dir("generated/openapi/src/main/java"))
	}
}

tasks.named("compileJava") {
	dependsOn(tasks.openApiGenerate)
}
