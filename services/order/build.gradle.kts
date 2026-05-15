import com.diffplug.gradle.spotless.SpotlessExtension
import io.spring.gradle.dependencymanagement.dsl.DependencyManagementExtension
import org.gradle.api.plugins.JavaPluginExtension
import org.gradle.jvm.toolchain.JavaLanguageVersion

plugins {
	id("org.springframework.boot") version "4.0.5" apply false
	id("io.spring.dependency-management") version "1.1.7" apply false
	id("com.diffplug.spotless") version "7.0.4" apply false
}

group = "ru.jetmeal"
version = "0.0.1-SNAPSHOT"

repositories {
	mavenCentral()
}

subprojects {
	apply(plugin = "java")
	apply(plugin = "io.spring.dependency-management")
	apply(plugin = "com.diffplug.spotless")

	group = rootProject.group
	version = rootProject.version

	extensions.configure<JavaPluginExtension>("java") {
		toolchain {
			languageVersion.set(JavaLanguageVersion.of(26))
		}
	}

	repositories {
		mavenCentral()
	}

	the<DependencyManagementExtension>().imports {
		mavenBom("org.springframework.boot:spring-boot-dependencies:4.0.5")
	}

	dependencies {
		add("compileOnly", "org.projectlombok:lombok")
		add("annotationProcessor", "org.projectlombok:lombok")
		add("testCompileOnly", "org.projectlombok:lombok")
		add("testAnnotationProcessor", "org.projectlombok:lombok")
	}

	tasks.withType<Test> {
		useJUnitPlatform()
	}

	tasks.withType<JavaCompile>().configureEach {
		options.compilerArgs.add("-parameters")
	}

	extensions.configure<SpotlessExtension> {
		java {
			palantirJavaFormat("2.71.0")
			target("src/main/java/**/*.java", "src/test/java/**/*.java")
		}
	}
}
