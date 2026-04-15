package com.eaa.recruit.security;

import com.eaa.recruit.config.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest
@Import({SecurityConfig.class, JwtAuthenticationFilter.class,
         JwtTokenProvider.class, JwtProperties.class,
         JwtAuthEntryPoint.class, JwtAccessDeniedHandler.class})
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "jwt.secret=test-secret-key-that-is-at-least-256-bits-long-for-testing-purposes",
    "jwt.expiration-ms=3600000"
})
class JwtAuthenticationFilterTest {

    @Autowired MockMvc mockMvc;
    @Autowired JwtTokenProvider tokenProvider;

    // Minimal protected controller just for this test slice
    @RestController
    static class ProbeController {
        @GetMapping("/api/v1/probe")
        String probe() { return "ok"; }

        @GetMapping("/actuator/health")
        String health() { return "UP"; }
    }

    @Test
    void noTokenReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/probe"))
               .andExpect(status().isUnauthorized())
               .andExpect(jsonPath("$.status").value("error"));
    }

    @Test
    void validTokenReturns200() throws Exception {
        String token = tokenProvider.generateToken(1L, "CANDIDATE", "alice@example.com");

        mockMvc.perform(get("/api/v1/probe")
                        .header("Authorization", "Bearer " + token))
               .andExpect(status().isOk());
    }

    @Test
    void expiredTokenReturns401() throws Exception {
        JwtProperties shortProps = new JwtProperties();
        shortProps.setSecret("test-secret-key-that-is-at-least-256-bits-long-for-testing-purposes");
        shortProps.setExpirationMs(-1L);
        JwtTokenProvider shortProvider = new JwtTokenProvider(shortProps);
        String expired = shortProvider.generateToken(1L, "CANDIDATE", "x@x.com");

        mockMvc.perform(get("/api/v1/probe")
                        .header("Authorization", "Bearer " + expired))
               .andExpect(status().isUnauthorized());
    }

    @Test
    void publicEndpointNoTokenReturns200() throws Exception {
        mockMvc.perform(get("/actuator/health"))
               .andExpect(status().isOk());
    }
}
