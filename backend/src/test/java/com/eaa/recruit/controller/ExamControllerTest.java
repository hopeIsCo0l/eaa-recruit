package com.eaa.recruit.controller;

import com.eaa.recruit.cache.BlockedUserCacheService;
import com.eaa.recruit.config.SecurityConfig;
import com.eaa.recruit.dto.application.BatchAuthorizeResponse;
import com.eaa.recruit.dto.exam.CreateExamResponse;
import com.eaa.recruit.exception.ConflictException;
import com.eaa.recruit.exception.GlobalExceptionHandler;
import com.eaa.recruit.security.*;
import com.eaa.recruit.service.ExamService;
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

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ExamController.class)
@Import({GlobalExceptionHandler.class, SecurityConfig.class,
         JwtAuthenticationFilter.class, JwtTokenProvider.class,
         JwtProperties.class, JwtAuthEntryPoint.class, JwtAccessDeniedHandler.class})
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "jwt.secret=test-secret-key-that-is-at-least-256-bits-long-for-testing-purposes",
    "jwt.expiration-ms=3600000"
})
class ExamControllerTest {

    @Autowired MockMvc mockMvc;
    @MockBean  ExamService             examService;
    @MockBean  UserDetailsServiceImpl  userDetailsService;
    @MockBean  BlockedUserCacheService blockedUserCacheService;

    private static final String VALID_EXAM_BODY = """
            {
              "title": "Pilot Exam",
              "durationMinutes": 60,
              "questions": [
                {
                  "type": "MCQ",
                  "questionText": "What is ICAO?",
                  "options": ["A", "B", "C", "D"],
                  "correctAnswer": 0,
                  "marks": 5
                }
              ]
            }
            """;

    // ── RBAC ─────────────────────────────────────────────────────────────────

    @Test
    void unauthenticated_returns401() throws Exception {
        mockMvc.perform(post("/api/v1/jobs/1/exam")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_EXAM_BODY))
               .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "CANDIDATE")
    void candidate_returns403() throws Exception {
        mockMvc.perform(post("/api/v1/jobs/1/exam")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_EXAM_BODY))
               .andExpect(status().isForbidden());
    }

    // ── createExam ────────────────────────────────────────────────────────────

    @Test
    @WithMockUser(roles = "RECRUITER")
    void createExam_returns201_onSuccess() throws Exception {
        when(examService.createExam(eq(1L), any(), any()))
                .thenReturn(new CreateExamResponse(10L, 1L, "Pilot Exam", 60, 1));

        mockMvc.perform(post("/api/v1/jobs/1/exam")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_EXAM_BODY))
               .andExpect(status().isCreated())
               .andExpect(jsonPath("$.data.examId").value(10))
               .andExpect(jsonPath("$.data.questionCount").value(1));
    }

    @Test
    @WithMockUser(roles = "RECRUITER")
    void createExam_returns409_whenDuplicate() throws Exception {
        when(examService.createExam(any(), any(), any()))
                .thenThrow(new ConflictException("An exam already exists for job: 1"));

        mockMvc.perform(post("/api/v1/jobs/1/exam")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_EXAM_BODY))
               .andExpect(status().isConflict());
    }

    // ── authorizeExamBatch ────────────────────────────────────────────────────

    @Test
    @WithMockUser(roles = "RECRUITER")
    void authorizeExamBatch_returns200_withResults() throws Exception {
        when(examService.authorizeExamBatch(eq(1L), any(), any()))
                .thenReturn(new BatchAuthorizeResponse(2, List.of(1L, 2L), List.of()));

        mockMvc.perform(post("/api/v1/jobs/1/exam/authorize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"applicationIds\":[1,2]}"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.data.authorizedCount").value(2))
               .andExpect(jsonPath("$.data.skipped").isEmpty());
    }

    @Test
    @WithMockUser(roles = "RECRUITER")
    void authorizeExamBatch_returns400_whenNoIds() throws Exception {
        mockMvc.perform(post("/api/v1/jobs/1/exam/authorize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"applicationIds\":[]}"))
               .andExpect(status().isBadRequest());
    }
}
