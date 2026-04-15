package com.eaa.recruit.controller;

import com.eaa.recruit.config.SecurityConfig;
import com.eaa.recruit.exception.BusinessException;
import com.eaa.recruit.exception.GlobalExceptionHandler;
import com.eaa.recruit.exception.ResourceNotFoundException;
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

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
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
class AdminUserStatusControllerTest {

    @Autowired MockMvc mockMvc;
    @MockBean  UserStatusService       userStatusService;
    @MockBean  RecruiterAdminService   recruiterAdminService;
    @MockBean  UserDetailsServiceImpl  userDetailsService;

    // ── RBAC ─────────────────────────────────────────────────────────────────

    @Test
    void unauthenticated_returns401() throws Exception {
        mockMvc.perform(patch("/api/v1/admin/users/10/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"active\":false}"))
               .andExpect(status().isUnauthorized());
    }

    @Test @WithMockUser(roles = "CANDIDATE")
    void candidate_returns403() throws Exception {
        mockMvc.perform(patch("/api/v1/admin/users/10/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"active\":false}"))
               .andExpect(status().isForbidden());
    }

    @Test @WithMockUser(roles = "RECRUITER")
    void recruiter_returns403() throws Exception {
        mockMvc.perform(patch("/api/v1/admin/users/10/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"active\":false}"))
               .andExpect(status().isForbidden());
    }

    // ── Deactivate ────────────────────────────────────────────────────────────

    @Test @WithMockUser(roles = "ADMIN")
    void admin_deactivate_returns200() throws Exception {
        doNothing().when(userStatusService).setStatus(anyLong(), eq(false), any());

        mockMvc.perform(patch("/api/v1/admin/users/10/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"active\":false}"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.status").value("success"))
               .andExpect(jsonPath("$.message").value("User deactivated successfully"));
    }

    // ── Activate ──────────────────────────────────────────────────────────────

    @Test @WithMockUser(roles = "ADMIN")
    void admin_activate_returns200() throws Exception {
        doNothing().when(userStatusService).setStatus(anyLong(), eq(true), any());

        mockMvc.perform(patch("/api/v1/admin/users/10/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"active\":true}"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.message").value("User activated successfully"));
    }

    // ── Error cases ───────────────────────────────────────────────────────────

    @Test @WithMockUser(roles = "ADMIN")
    void returns404_whenUserNotFound() throws Exception {
        doThrow(new ResourceNotFoundException("User", 999L))
                .when(userStatusService).setStatus(eq(999L), anyBoolean(), any());

        mockMvc.perform(patch("/api/v1/admin/users/999/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"active\":false}"))
               .andExpect(status().isNotFound());
    }

    @Test @WithMockUser(roles = "ADMIN")
    void returns400_whenDeactivatingSuperAdmin() throws Exception {
        doThrow(new BusinessException("Admins cannot modify Super Admin accounts"))
                .when(userStatusService).setStatus(anyLong(), anyBoolean(), any());

        mockMvc.perform(patch("/api/v1/admin/users/2/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"active\":false}"))
               .andExpect(status().isBadRequest())
               .andExpect(jsonPath("$.message").value("Admins cannot modify Super Admin accounts"));
    }

    @Test @WithMockUser(roles = "ADMIN")
    void returns400_whenActiveMissing() throws Exception {
        mockMvc.perform(patch("/api/v1/admin/users/10/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
               .andExpect(status().isBadRequest())
               .andExpect(jsonPath("$.errors[?(@.field=='active')]").exists());
    }
}
