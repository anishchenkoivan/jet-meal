# syntax=docker/dockerfile:1

FROM eclipse-temurin:26-jdk-jammy AS build
WORKDIR /workspace

RUN apt-get update \
	&& apt-get install -y --no-install-recommends unzip wget ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

ARG GRADLE_VERSION=9.4.1
RUN wget -qO /tmp/gradle.zip "https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip" \
	&& unzip -q /tmp/gradle.zip -d /opt \
	&& rm /tmp/gradle.zip
ENV PATH="/opt/gradle-${GRADLE_VERSION}/bin:${PATH}"

COPY settings.gradle.kts build.gradle.kts ./
COPY gradle gradle
COPY order-main order-main
COPY order-api order-api
COPY order-service order-service
COPY order-service-api order-service-api
COPY order-persistence order-persistence
COPY order-persistence-api order-persistence-api
COPY order-kafka order-kafka
COPY order-cache order-cache
COPY order-clients order-clients

RUN gradle --no-daemon :order-main:bootJar \
	&& cp "$(ls order-main/build/libs/*.jar | grep -v plain)" /workspace/app.jar

FROM eclipse-temurin:26-jre-jammy
WORKDIR /app

COPY --from=build /workspace/app.jar /app/app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
