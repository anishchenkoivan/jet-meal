plugins {
	kotlin("jvm") version "2.4.0-Beta2"
	kotlin("plugin.spring") version "2.4.0-Beta2"
	id("org.springframework.boot") version "3.5.14"
	id("io.spring.dependency-management") version "1.1.7"
	id("org.openapi.generator") version "7.10.0"
}

group = "ru.jetmeal"
version = "0.0.1-SNAPSHOT"

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(25)
	}
}

repositories {
	mavenCentral()
}

dependencies {
	implementation("org.springframework.boot:spring-boot-starter-web")
	implementation("org.jetbrains.kotlin:kotlin-reflect")
	implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
	implementation("io.swagger.core.v3:swagger-models:2.2.49")
	implementation("io.swagger.core.v3:swagger-annotations:2.2.49")
	implementation("jakarta.validation:jakarta.validation-api:3.1.1")
	runtimeOnly("org.postgresql:postgresql")
	testImplementation("org.springframework.kafka:spring-kafka-test")
	testImplementation("org.springframework.boot:spring-boot-starter-test")
	testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
	testImplementation("org.testcontainers:junit-jupiter")
	testImplementation("org.testcontainers:postgresql")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")
	implementation("org.springframework.kafka:spring-kafka")
	implementation("org.springframework.boot:spring-boot-starter-jdbc")
	implementation("org.flywaydb:flyway-core")
	implementation("org.flywaydb:flyway-database-postgresql")
}

kotlin {
	compilerOptions {
		freeCompilerArgs.addAll("-Xjsr305=strict", "-Xannotation-default-target=param-property")
	}
}

val openApiOutputDir = layout.buildDirectory.dir("openapi")

openApiGenerate {
	generatorName.set("kotlin-spring")
	inputSpec.set(file("${projectDir}/docs/api.yaml").toURI().toString())
	outputDir.set(openApiOutputDir.get().asFile.absolutePath)
	apiPackage.set("ru.jetmeal.delivery.generated.api")
	modelPackage.set("ru.jetmeal.delivery.generated.model")
	configOptions.set(mapOf(
		"interfaceOnly" to "true",
		"delegatePattern" to "false",
		"useBeanValidation" to "true",
		"dateLibrary" to "java8",
		"useSpringBoot3" to "true",
		"useJakartaEe" to "true"
	))
	ignoreFileOverride.set("${projectDir}/.openapi-generator-ignore")
}

sourceSets {
	main {
		kotlin {
			srcDir(openApiOutputDir.map { it.dir("src/main/kotlin").asFile })
		}
	}
}

tasks.withType<Test> {
	useJUnitPlatform()
}

tasks.compileKotlin {
	dependsOn(tasks.openApiGenerate)
}

tasks.named("openApiGenerate") {
	doFirst {
		delete(openApiOutputDir.get().asFile)
	}
}
