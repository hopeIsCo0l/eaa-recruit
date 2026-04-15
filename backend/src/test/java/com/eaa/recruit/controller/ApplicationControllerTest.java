package com.eaa.recruit.controller;

import com.eaa.recruit.cache.BlockedUserCacheService;
import com.eaa.recruit.config.SecurityConfig;
import com.eaa.recruit.dto.application.SubmitApplicationResponse;
import com.eaa.recruit.entity.ApplicationStatus;
import com.eaa.recruit.exception.BusinessException;
import com.eaa.recruit.exception.ConflictException;
import com.eaa.recruit.exception.GlobalExceptionHandler;
import com.eaa.recruit.security.*;
import com.eaa.recruit.service.ApplicationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ApplicationController.class)
@Import({GlobalExceptionHandler.class, SecurityConfig.class,
         JwtAuthenticationFilter.class, JwtTokenProvider.class,
         JwtProperties.class, JwtAuthEntryPoint.class, JwtAccessDeniedHandler.class})
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "jwt.secret=test-secret-key-that-is-at-least-256-bits-long-for-testing-purposes",
    "jwt.expiration-ms=3600000"
})
class ApplicationControllerTest {

    @Autowired MockMvc mockMvc;
    @MockBean  ApplicationService      applicationService;
    @MockBean  UserDetailsServiceImpl  userDetailsService;
    @MockBean  BlockedUserCacheService blockedUserCacheService;

    private static final MockMultipartFile CV_FILE =
            new MockMultipartFile("cv", "cv.pdf", "application/pdf", new byte[100]);

    // ── RBAC ─────────────────────────────────────────────────────────────────

    @Test
    void unauthenticated_returns401() throws Exception {
        mockMvc.perform(multipart("/api/v1/applications")
                        .file(CV_FILE)
                        .param("jobId", "1"))
               .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "RECRUITER")
    void recruiter_returns403() throws Exception {
        mockMvc.perform(multipart("/api/v1/applications")
                        .file(CV_FILE)
                        .param("jobId", "1"))
               .andExpect(status().isForbidden());
    }

    // ── Success ───────────────────────────────────────────────────────────────

    @Test
    @WithMockUser(roles = "CANDIDATE")
    void candidate_returns201_onSuccess() throws Exception {
        when(applicationService.submitApplication(any(), any(), any()))
                .thenReturn(new SubmitApplicationResponse(1L, 1L, ApplicationStatus.SUBMITTED, Instant.now()));

        mockMvc.perform(multipart("/api/v1/applications")
                        .file(CV_FILE)
                        .param("jobId", "1")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
               .andExpect(status().isCreated())
               .andExpect(jsonPath("$.status").value("success"))
               .andExpect(jsonPath("$.data.status").value("SUBMITTED"));
    }

    // ── Error cases ───────────────────────────────────────────────────────────

    @Test
    @WithMockUser(roles = "CANDIDATE")
    void closedJob_returns400() throws Exception {
        when(applicationService.submitApplication(any(), any(), any()))
                .thenThrow(new BusinessException("Applications are only accepted for OPEN jobs"));

        mockMvc.perform(multipart("/api/v1/applications")
                        .file(CV_FILE)
                        .param("jobId", "1"))
               .andExpect(status().isBadRequest())
               .andExpect(jsonPath("$.message").value("Applications are only accepted for OPEN jobs"));
    }

    @Test
    @WithMockUser(roles = "CANDIDATE")
    void duplicateApplication_returns409() throws Exception {
        when(applicationService.submitApplication(any(), any(), any()))
                .thenThrow(new ConflictException("You have already applied for this job"));

        mockMvc.perform(multipart("/api/v1/applications")
                        .file(CV_FILE)
                        .param("jobId", "1"))
               .andExpect(status().isConflict());
    }
}
