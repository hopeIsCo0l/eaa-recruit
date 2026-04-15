package com.eaa.recruit.security;

import com.eaa.recruit.config.SecurityConfig;
import com.eaa.recruit.security.rbac.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtTokenProvider.class,
         JwtProperties.class, JwtAuthEntryPoint.class, JwtAccessDeniedHandler.class})
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "jwt.secret=test-secret-key-that-is-at-least-256-bits-long-for-testing-purposes",
    "jwt.expiration-ms=3600000"
})
class RbacTest {

    @Autowired MockMvc mockMvc;
    @MockBean  UserDetailsServiceImpl userDetailsService;

    @RestController
    @RequestMapping("/rbac-test")
    static class RbacTestController {
        @GetMapping("/candidate")  @IsCandidate       String candidate()  { return "ok"; }
        @GetMapping("/recruiter")  @IsRecruiter       String recruiter()  { return "ok"; }
        @GetMapping("/admin")      @IsAdmin           String admin()      { return "ok"; }
        @GetMapping("/superadmin") @IsSuperAdmin      String superAdmin() { return "ok"; }
        @GetMapping("/rec-plus")   @IsRecruiterOrAbove String recPlus()  { return "ok"; }
    }

    @Test @WithMockUser(roles = "CANDIDATE")
    void candidate_ownEndpoint_ok() throws Exception {
        mockMvc.perform(get("/rbac-test/candidate")).andExpect(status().isOk());
    }

    @Test @WithMockUser(roles = "CANDIDATE")
    void candidate_recruiterEndpoint_forbidden() throws Exception {
        mockMvc.perform(get("/rbac-test/recruiter")).andExpect(status().isForbidden());
    }

    @Test @WithMockUser(roles = "CANDIDATE")
    void candidate_adminEndpoint_forbidden() throws Exception {
        mockMvc.perform(get("/rbac-test/admin")).andExpect(status().isForbidden());
    }

    @Test @WithMockUser(roles = "RECRUITER")
    void recruiter_ownEndpoint_ok() throws Exception {
        mockMvc.perform(get("/rbac-test/recruiter")).andExpect(status().isOk());
    }

    @Test @WithMockUser(roles = "RECRUITER")
    void recruiter_adminEndpoint_forbidden() throws Exception {
        mockMvc.perform(get("/rbac-test/admin")).andExpect(status().isForbidden());
    }

    @Test @WithMockUser(roles = "RECRUITER")
    void recruiter_recPlus_ok() throws Exception {
        mockMvc.perform(get("/rbac-test/rec-plus")).andExpect(status().isOk());
    }

    @Test @WithMockUser(roles = "ADMIN")
    void admin_adminEndpoint_ok() throws Exception {
        mockMvc.perform(get("/rbac-test/admin")).andExpect(status().isOk());
    }

    @Test @WithMockUser(roles = "ADMIN")
    void admin_superAdminEndpoint_forbidden() throws Exception {
        mockMvc.perform(get("/rbac-test/superadmin")).andExpect(status().isForbidden());
    }

    @Test @WithMockUser(roles = "ADMIN")
    void admin_recPlus_ok() throws Exception {
        mockMvc.perform(get("/rbac-test/rec-plus")).andExpect(status().isOk());
    }

    @Test @WithMockUser(roles = "SUPER_ADMIN")
    void superAdmin_adminEndpoint_ok() throws Exception {
        mockMvc.perform(get("/rbac-test/admin")).andExpect(status().isOk());
    }

    @Test @WithMockUser(roles = "SUPER_ADMIN")
    void superAdmin_superAdminEndpoint_ok() throws Exception {
        mockMvc.perform(get("/rbac-test/superadmin")).andExpect(status().isOk());
    }

    @Test @WithMockUser(roles = "SUPER_ADMIN")
    void superAdmin_recPlus_ok() throws Exception {
        mockMvc.perform(get("/rbac-test/rec-plus")).andExpect(status().isOk());
    }

    @Test
    void unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/rbac-test/candidate")).andExpect(status().isUnauthorized());
    }
}
