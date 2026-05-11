package ru.jetmeal.delivery.controllers

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import ru.jetmeal.delivery.integration.IntegrationTestBase
import java.util.UUID

class CouriersControllerTest : IntegrationTestBase() {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    fun registerCourier_createsAndCanFetch() {
        val userId = UUID.randomUUID()
        val requestBody = mapOf("user_id" to userId.toString())

        val registerResponse = mockMvc.perform(
            MockMvcRequestBuilders.post("/couriers/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBody))
        )
            .andExpect(MockMvcResultMatchers.status().isCreated)
            .andExpect(MockMvcResultMatchers.jsonPath("$.user_id").value(userId.toString()))
            .andReturn()
            .response
            .contentAsString

        val courierId = objectMapper.readTree(registerResponse).get("id").asText()

        mockMvc.perform(MockMvcRequestBuilders.get("/couriers/$courierId"))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.id").value(courierId))
            .andExpect(MockMvcResultMatchers.jsonPath("$.user_id").value(userId.toString()))
    }

    @Test
    fun updateCourier_updatesExisting() {
        val userId = UUID.randomUUID()
        val requestBody = mapOf("user_id" to userId.toString())

        val registerResponse = mockMvc.perform(
            MockMvcRequestBuilders.post("/couriers/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBody))
        )
            .andExpect(MockMvcResultMatchers.status().isCreated)
            .andReturn()
            .response
            .contentAsString

        val courierId = objectMapper.readTree(registerResponse).get("id").asText()

        mockMvc.perform(
            MockMvcRequestBuilders.put("/couriers/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBody))
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.id").value(courierId))
            .andExpect(MockMvcResultMatchers.jsonPath("$.user_id").value(userId.toString()))
    }
}