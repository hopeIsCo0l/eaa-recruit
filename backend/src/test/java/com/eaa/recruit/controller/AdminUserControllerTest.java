package com.eaa.recruit.controller;

import com.eaa.recruit.cache.BlockedUserCacheService;
import com.eaa.recruit.config.SecurityConfig;
import com.eaa.recruit.dto.admin.RecruiterCreatedResponse;
import com.eaa.recruit.exception.ConflictException;
import com.eaa.recruit.exception.GlobalExceptionHandler;
import com.eaa.recruit.security.*;
import com.eaa.recruit.service.RecruiterAdminService;
import com.eaa.recruit.service.UserStatusService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminUserController.class)
@Import({GlobalExceptionHandler.class, SecurityConfig.class,
         JwtAuthenticationFilter.class, JwtTokenProvider.class,
         JwtProperties.class, JwtAuthEntryPoint.class, JwtAccessDeniedHandler.class})
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "jwt.secret=test-secret-key-that-is-at-least-256-bits-long-for-testing-purposes",
    "jwt.expiration-ms=3600000"
})
class AdminUserControllerTest {

    @Autowired MockMvc mockMvc;
    @MockBean  RecruiterAdminService   recruiterAdminService;
    @MockBean  UserStatusService       userStatusService;
    @MockBean  UserDetailsServiceImpl  userDetailsService;
    @MockBean  BlockedUserCacheService blockedUserCacheService;

    private static final String VALID_BODY = """
            {
              "fullName": "Bob Jones",
              "email": "bob@example.com",
              "temporaryPassword": "TempPass1!"
            }
            """;

    // ── RBAC ─────────────────────────────────────────────────────────────────

    @Test
    void unauthenticated_returns401() throws Exception {
        mockMvc.perform(post("/api/v1/admin/users/recruiter")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY))
               .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "CANDIDATE")
    void candidate_returns403() throws Exception {
        mockMvc.perform(post("/api/v1/admin/users/recruiter")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY))
               .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "RECRUITER")
    void recruiter_returns403() throws Exception {
        mockMvc.perform(post("/api/v1/admin/users/recruiter")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY))
               .andExpect(status().isForbidden());
    }

    // ── Success ───────────────────────────────────────────────────────────────

    @Test
    @WithMockUser(roles = "ADMIN")
    void admin_returns201_onSuccess() throws Exception {
        when(recruiterAdminService.createRecruiter(any()))
                .thenReturn(new RecruiterCreatedResponse(
                        5L, "bob@example.com", "Bob Jones",
                        "Recruiter account created successfully"));

        mockMvc.perform(post("/api/v1/admin/users/recruiter")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY))
               .andExpect(status().isCreated())
               .andExpect(jsonPath("$.status").value("success"))
               .andExpect(jsonPath("$.data.userId").value(5))
               .andExpect(jsonPath("$.data.email").value("bob@example.com"));
    }

    @Test
    @WithMockUser(roles = "SUPER_ADMIN")
    void superAdmin_returns201_onSuccess() throws Exception {
        when(recruiterAdminService.createRecruiter(any()))
                .thenReturn(new RecruiterCreatedResponse(
                        6L, "bob2@example.com", "Bob Two",
                        "Recruiter account created successfully"));

        mockMvc.perform(post("/api/v1/admin/users/recruiter")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fullName":"Bob Two","email":"bob2@example.com","temporaryPassword":"TempPass1!"}
                                """))
               .andExpect(status().isCreated())
               .andExpect(jsonPath("$.data.userId").value(6));
    }

    // ── Error cases ───────────────────────────────────────────────────────────

    @Test
    @WithMockUser(roles = "ADMIN")
    void admin_returns409_onDuplicateEmail() throws Exception {
        when(recruiterAdminService.createRecruiter(any()))
                .thenThrow(new ConflictException("Email is already registered: bob@example.com"));

        mockMvc.perform(post("/api/v1/admin/users/recruiter")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY))
               .andExpect(status().isConflict())
               .andExpect(jsonPath("$.message").value("Email is already registered: bob@example.com"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void admin_returns400_onMissingFields() throws Exception {
        mockMvc.perform(post("/api/v1/admin/users/recruiter")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
               .andExpect(status().isBadRequest())
               .andExpect(jsonPath("$.errors").isArray());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void admin_returns400_onInvalidEmail() throws Exception {
        mockMvc.perform(post("/api/v1/admin/users/recruiter")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fullName":"Bob","email":"not-email","temporaryPassword":"TempPass1!"}
                                """))
               .andExpect(status().isBadRequest())
               .andExpect(jsonPath("$.errors[?(@.field=='email')]").exists());
    }
}
