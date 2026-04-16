package com.eaa.recruit.controller;

import com.eaa.recruit.cache.BlockedUserCacheService;
import com.eaa.recruit.config.SecurityConfig;
import com.eaa.recruit.dto.job.CreateJobResponse;
import com.eaa.recruit.entity.JobPostingStatus;
import com.eaa.recruit.exception.BusinessException;
import com.eaa.recruit.exception.GlobalExceptionHandler;
import com.eaa.recruit.security.*;
import com.eaa.recruit.service.JobService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(JobController.class)
@Import({GlobalExceptionHandler.class, SecurityConfig.class,
         JwtAuthenticationFilter.class, JwtTokenProvider.class,
         JwtProperties.class, JwtAuthEntryPoint.class, JwtAccessDeniedHandler.class})
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "jwt.secret=test-secret-key-that-is-at-least-256-bits-long-for-testing-purposes",
    "jwt.expiration-ms=3600000"
})
class JobControllerTest {

    @Autowired MockMvc mockMvc;
    @MockBean  JobService              jobService;
    @MockBean  UserDetailsServiceImpl  userDetailsService;
    @MockBean  BlockedUserCacheService blockedUserCacheService;

    private static final LocalDate OPEN  = LocalDate.now().plusDays(1);
    private static final LocalDate CLOSE = OPEN.plusDays(30);
    private static final LocalDate EXAM  = CLOSE.plusDays(7);

    private String validBody() {
        return """
                {
                  "title": "Pilot",
                  "description": "Fly planes",
                  "minHeightCm": 170,
                  "minWeightKg": 60,
                  "requiredDegree": "BSc Aviation",
                  "openDate": "%s",
                  "closeDate": "%s",
                  "examDate": "%s"
                }
                """.formatted(OPEN, CLOSE, EXAM);
    }

    // ── RBAC ─────────────────────────────────────────────────────────────────

    @Test
    void unauthenticated_returns401() throws Exception {
        mockMvc.perform(post("/api/v1/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validBody()))
               .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "CANDIDATE")
    void candidate_returns403() throws Exception {
        mockMvc.perform(post("/api/v1/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validBody()))
               .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void admin_returns403() throws Exception {
        mockMvc.perform(post("/api/v1/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validBody()))
               .andExpect(status().isForbidden());
    }

    // ── Success ───────────────────────────────────────────────────────────────

    @Test
    @WithMockUser(roles = "RECRUITER")
    void recruiter_returns201_onSuccess() throws Exception {
        when(jobService.createJob(any(), any()))
                .thenReturn(new CreateJobResponse(1L, "Pilot", JobPostingStatus.DRAFT, OPEN, CLOSE, EXAM));

        mockMvc.perform(post("/api/v1/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validBody()))
               .andExpect(status().isCreated())
               .andExpect(jsonPath("$.status").value("success"))
               .andExpect(jsonPath("$.data.id").value(1))
               .andExpect(jsonPath("$.data.status").value("DRAFT"));
    }

    // ── Validation ────────────────────────────────────────────────────────────

    @Test
    @WithMockUser(roles = "RECRUITER")
    void missingTitle_returns400() throws Exception {
        String body = """
                {
                  "description": "desc",
                  "minHeightCm": 170,
                  "minWeightKg": 60,
                  "requiredDegree": "BSc",
                  "openDate": "%s",
                  "closeDate": "%s",
                  "examDate": "%s"
                }
                """.formatted(OPEN, CLOSE, EXAM);

        mockMvc.perform(post("/api/v1/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
               .andExpect(status().isBadRequest())
               .andExpect(jsonPath("$.errors[?(@.field=='title')]").exists());
    }

    @Test
    @WithMockUser(roles = "RECRUITER")
    void missingDates_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"Pilot","description":"desc","minHeightCm":170,"minWeightKg":60,"requiredDegree":"BSc"}
                                """))
               .andExpect(status().isBadRequest())
               .andExpect(jsonPath("$.errors").isArray());
    }

    @Test
    @WithMockUser(roles = "RECRUITER")
    void invalidDateOrdering_returns400() throws Exception {
        when(jobService.createJob(any(), any()))
                .thenThrow(new BusinessException("closeDate must be after openDate"));

        mockMvc.perform(post("/api/v1/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validBody()))
               .andExpect(status().isBadRequest())
               .andExpect(jsonPath("$.message").value("closeDate must be after openDate"));
    }
}
