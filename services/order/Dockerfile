# syntax=docker/dockerfile:1

FROM eclipse-temurin:26-jdk-jammy AS build
WORKDIR /workspace

COPY gradlew settings.gradle.kts build.gradle.kts ./
COPY gradle gradle
COPY src src

RUN chmod +x gradlew \
	&& ./gradlew --no-daemon bootJar \
	&& cp "$(ls build/libs/*.jar | grep -v plain)" /workspace/app.jar

FROM eclipse-temurin:26-jre-jammy
WORKDIR /app

COPY --from=build /workspace/app.jar /app/app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
