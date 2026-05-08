package ru.jetmeal.order;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.equalToJson;
import static com.github.tomakehurst.wiremock.client.WireMock.post;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static org.assertj.core.api.Assertions.assertThat;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.core.WireMockConfiguration;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureTestRestTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@EmbeddedKafka(partitions = 1, topics = "order.changed")
@AutoConfigureTestRestTemplate
class OrderApplicationTests {

    private static final WireMockServer BUSINESS_API =
            new WireMockServer(WireMockConfiguration.wireMockConfig().dynamicPort());

    static {
        BUSINESS_API.start();
    }

    private final TestRestTemplate rest;

    @Autowired
    OrderApplicationTests(TestRestTemplate rest) {
        this.rest = rest;
    }

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

    @Container
    static final GenericContainer<?> REDIS =
            new GenericContainer<>(DockerImageName.parse("redis:7-alpine")).withExposedPorts(6379);

    @DynamicPropertySource
    static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("spring.liquibase.change-log", () -> "classpath:db/changelog/db.changelog-master.yaml");
        registry.add("spring.data.redis.host", REDIS::getHost);
        registry.add("spring.data.redis.port", () -> REDIS.getMappedPort(6379));
        registry.add("order.clients.business-service-url", () -> "http://localhost:" + BUSINESS_API.port());
    }

    @AfterEach
    void resetWireMock() {
        BUSINESS_API.resetAll();
    }

    @Test
    void createOrderAndListActiveFromRedis() {
        var userId = UUID.randomUUID().toString();
        var restaurantId = UUID.randomUUID().toString();
        var menuItemId = UUID.randomUUID().toString();
        BUSINESS_API.stubFor(
                post(urlEqualTo("/v1/meals/list"))
                        .withRequestBody(equalToJson("{\"businessId\":\"" + restaurantId + "\"}", true, true))
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader("Content-Type", "application/json")
                                        .withBody(
                                                "{\"meals\":[{\"mealId\":\"" + menuItemId
                                                        + "\",\"mealName\":\"m\",\"mealDescription\":\"d\",\"mealPictureId\":\"p\",\"price\":9.99}]}")));

        var body = new LinkedHashMap<String, Object>();
        body.put("userId", userId);
        body.put("restaurantId", restaurantId);
        body.put("menuItems", Map.of(menuItemId, 1));
        body.put("comment", "hi");

        var createResponse = rest.postForEntity("/api/v1/orders", body, Map.class);
        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(createResponse.getBody()).isNotNull();
        assertThat(createResponse.getBody().get("totalCost")).isEqualTo(9.99);
        var id = UUID.fromString(createResponse.getBody().get("id").toString());

        var listActive = rest.getForEntity("/api/v1/orders?activeOnly=true", String.class);
        assertThat(listActive.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(listActive.getBody()).contains(id.toString());
    }

    @Test
    void patchOrderUpdatesStatus() {
        var user = UUID.randomUUID().toString();
        var restaurant = UUID.randomUUID().toString();
        var menuItemId = UUID.randomUUID().toString();
        BUSINESS_API.stubFor(
                post(urlEqualTo("/v1/meals/list"))
                        .withRequestBody(equalToJson("{\"businessId\":\"" + restaurant + "\"}", true, true))
                        .willReturn(
                                aResponse()
                                        .withStatus(200)
                                        .withHeader("Content-Type", "application/json")
                                        .withBody(
                                                "{\"meals\":[{\"mealId\":\"" + menuItemId
                                                        + "\",\"mealName\":\"m\",\"mealDescription\":\"d\",\"mealPictureId\":\"p\",\"price\":5}]}")));

        var create = new LinkedHashMap<String, Object>();
        create.put("userId", user);
        create.put("restaurantId", restaurant);
        create.put("menuItems", Map.of(menuItemId, 1));
        create.put("comment", "x");

        var createResponse = rest.postForEntity("/api/v1/orders", create, Map.class);
        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        var id = UUID.fromString(createResponse.getBody().get("id").toString());
        assertThat(createResponse.getBody().get("status")).isEqualTo("PENDING");
        assertThat(createResponse.getBody().get("totalCost")).isEqualTo(5.0);

        var patchBody = Map.of("status", "CONFIRMED");
        var headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        var patchResponse = rest.exchange(
                "/api/v1/orders/" + id, HttpMethod.PATCH, new HttpEntity<>(patchBody, headers), Map.class);
        assertThat(patchResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(patchResponse.getBody()).isNotNull();
        assertThat(patchResponse.getBody().get("status")).isEqualTo("CONFIRMED");
        assertThat(patchResponse.getBody().get("comment")).isEqualTo("x");
        assertThat(patchResponse.getBody().get("totalCost")).isEqualTo(5.0);
    }
}
