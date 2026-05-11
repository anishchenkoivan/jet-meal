package ru.jetmeal.delivery.integration

import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.utility.DockerImageName

object PostgresTestContainer {
    val instance: PostgreSQLContainer<*> = PostgreSQLContainer(
        DockerImageName.parse("postgis/postgis:16-3.4").asCompatibleSubstituteFor("postgres")
    )
        .withDatabaseName("delivery")
        .withUsername("delivery")
        .withPassword("delivery")
        .apply { start() }
}

