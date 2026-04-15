package com.eaa.recruit.exception;

import com.eaa.recruit.config.SecurityConfig;
import com.eaa.recruit.security.JwtAccessDeniedHandler;
import com.eaa.recruit.security.JwtAuthEntryPoint;
import com.eaa.recruit.security.JwtAuthenticationFilter;
import com.eaa.recruit.security.JwtProperties;
import com.eaa.recruit.security.JwtTokenProvider;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.*;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest
@Import({GlobalExceptionHandler.class, SecurityConfig.class,
         JwtAuthenticationFilter.class, JwtTokenProvider.class,
         JwtProperties.class, JwtAuthEntryPoint.class, JwtAccessDeniedHandler.class})
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "jwt.secret=test-secret-key-that-is-at-least-256-bits-long-for-testing-purposes",
    "jwt.expiration-ms=3600000"
})
class GlobalExceptionHandlerTest {

    @Autowired MockMvc mockMvc;

    // ── Minimal controllers used only in this test slice ─────────────────────

    record CreateRequest(@NotBlank(message = "name is required")
                         @Size(min = 2, max = 50, message = "name must be 2-50 chars")
                         String name,
                         @NotBlank(message = "email is required") String email) {}

    @RestController
    @RequestMapping("/test")
    static class TestController {

        @GetMapping("/not-found")
        String notFound() { throw new ResourceNotFoundException("Item", 99L); }

        @GetMapping("/business-error")
        String businessError() { throw new BusinessException("Quota exceeded"); }

        @GetMapping("/unauthorized")
        String unauthorized() { throw new UnauthorizedException("Token invalid"); }

        @GetMapping("/conflict")
        String conflict() { throw new ConflictException("Email already registered"); }

        @GetMapping("/server-error")
        String serverError() { throw new RuntimeException("DB connection lost"); }

        @PostMapping("/validate")
        String validate(@Valid @RequestBody CreateRequest req) { return "ok"; }

        @GetMapping("/restricted")
        @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
        String restricted() { return "admin only"; }
    }

    // ── 404 ──────────────────────────────────────────────────────────────────

    @Test
    @WithMockUser
    void resourceNotFoundReturns404() throws Exception {
        mockMvc.perform(get("/test/not-found"))
               .andExpect(status().isNotFound())
               .andExpect(jsonPath("$.status").value("error"))
               .andExpect(jsonPath("$.message").value("Item not found with id: 99"))
               .andExpect(jsonPath("$.timestamp").exists())
               .andExpect(jsonPath("$.data").doesNotExist());
    }

    // ── 400 business ─────────────────────────────────────────────────────────

    @Test
    @WithMockUser
    void businessExceptionReturns400() throws Exception {
        mockMvc.perform(get("/test/business-error"))
               .andExpect(status().isBadRequest())
               .andExpect(jsonPath("$.status").value("error"))
               .andExpect(jsonPath("$.message").value("Quota exceeded"));
    }

    // ── 401 ──────────────────────────────────────────────────────────────────

    @Test
    @WithMockUser
    void unauthorizedExceptionReturns401() throws Exception {
        mockMvc.perform(get("/test/unauthorized"))
               .andExpect(status().isUnauthorized())
               .andExpect(jsonPath("$.status").value("error"));
    }

    // ── 409 ──────────────────────────────────────────────────────────────────

    @Test
    @WithMockUser
    void conflictExceptionReturns409() throws Exception {
        mockMvc.perform(get("/test/conflict"))
               .andExpect(status().isConflict())
               .andExpect(jsonPath("$.status").value("error"))
               .andExpect(jsonPath("$.message").value("Email already registered"));
    }

    // ── 500 — no stack trace ─────────────────────────────────────────────────

    @Test
    @WithMockUser
    void internalErrorReturns500WithoutStackTrace() throws Exception {
        mockMvc.perform(get("/test/server-error"))
               .andExpect(status().isInternalServerError())
               .andExpect(jsonPath("$.status").value("error"))
               .andExpect(jsonPath("$.message").value("An unexpected error occurred"))
               // stack trace must never appear
               .andExpect(jsonPath("$.trace").doesNotExist())
               .andExpect(jsonPath("$.errors").doesNotExist());
    }

    // ── Validation — structured field errors ─────────────────────────────────

    @Test
    @WithMockUser
    void validationErrorReturns400WithFieldErrors() throws Exception {
        String body = """
                {"name": "", "email": ""}
                """;
        mockMvc.perform(post("/test/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
               .andExpect(status().isBadRequest())
               .andExpect(jsonPath("$.status").value("error"))
               .andExpect(jsonPath("$.message").value("Validation failed"))
               .andExpect(jsonPath("$.errors").isArray())
               .andExpect(jsonPath("$.errors", hasSize(greaterThanOrEqualTo(2))))
               .andExpect(jsonPath("$.errors[*].field", hasItems("name", "email")))
               .andExpect(jsonPath("$.errors[*].message").exists());
    }

    @Test
    @WithMockUser
    void malformedJsonReturns400() throws Exception {
        mockMvc.perform(post("/test/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{bad json"))
               .andExpect(status().isBadRequest())
               .andExpect(jsonPath("$.status").value("error"))
               .andExpect(jsonPath("$.message").value("Malformed or missing request body"));
    }

    // ── 401 unauthenticated ───────────────────────────────────────────────────

    @Test
    void noTokenReturns401() throws Exception {
        mockMvc.perform(get("/test/not-found"))
               .andExpect(status().isUnauthorized())
               .andExpect(jsonPath("$.status").value("error"));
    }

    // ── 403 forbidden ────────────────────────────────────────────────────────

    @Test
    @WithMockUser(roles = "CANDIDATE")
    void insufficientRoleReturns403() throws Exception {
        mockMvc.perform(get("/test/restricted"))
               .andExpect(status().isForbidden())
               .andExpect(jsonPath("$.status").value("error"));
    }
}
