FROM eclipse-temurin:25-jdk-jammy AS builder
WORKDIR /app

COPY gradlew gradlew
COPY gradle gradle
COPY build.gradle.kts settings.gradle.kts ./
COPY docs docs
COPY src src
COPY .openapi-generator-ignore .openapi-generator-ignore

RUN chmod +x gradlew
RUN ./gradlew --no-daemon bootJar
RUN set -eux; \
    JAR_FILE=$(ls /app/build/libs/*.jar | grep -v plain | head -n 1); \
    cp "$JAR_FILE" /app/app.jar

FROM eclipse-temurin:25-jre-jammy
WORKDIR /app
COPY --from=builder /app/app.jar /app/app.jar

EXPOSE 8080
ENV JAVA_OPTS=""

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]

