package com.eaa.recruit.controller;

import com.eaa.recruit.config.SecurityConfig;
import com.eaa.recruit.dto.auth.RegistrationResponse;
import com.eaa.recruit.exception.BusinessException;
import com.eaa.recruit.exception.ConflictException;
import com.eaa.recruit.exception.GlobalExceptionHandler;
import com.eaa.recruit.security.JwtAccessDeniedHandler;
import com.eaa.recruit.security.JwtAuthEntryPoint;
import com.eaa.recruit.security.JwtAuthenticationFilter;
import com.eaa.recruit.security.JwtProperties;
import com.eaa.recruit.security.JwtTokenProvider;
import com.eaa.recruit.security.UserDetailsServiceImpl;
import com.eaa.recruit.service.CandidateRegistrationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import({GlobalExceptionHandler.class, SecurityConfig.class,
         JwtAuthenticationFilter.class, JwtTokenProvider.class,
         JwtProperties.class, JwtAuthEntryPoint.class, JwtAccessDeniedHandler.class})
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "jwt.secret=test-secret-key-that-is-at-least-256-bits-long-for-testing-purposes",
    "jwt.expiration-ms=3600000"
})
class AuthControllerTest {

    @Autowired MockMvc mockMvc;
    @MockBean  CandidateRegistrationService registrationService;
    @MockBean  UserDetailsServiceImpl userDetailsService;

    private static final String VALID_BODY = """
            {
              "fullName": "Alice Smith",
              "email": "alice@example.com",
              "password": "secret123",
              "phone": "+601234567890"
            }
            """;

    // ── POST /register/candidate ──────────────────────────────────────────────

    @Test
    void register_returns201_onSuccess() throws Exception {
        when(registrationService.register(any()))
                .thenReturn(new RegistrationResponse(1L, "alice@example.com",
                        "Registration successful. A verification code has been sent to alice@example.com"));

        mockMvc.perform(post("/api/v1/auth/register/candidate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY))
               .andExpect(status().isCreated())
               .andExpect(jsonPath("$.status").value("success"))
               .andExpect(jsonPath("$.data.email").value("alice@example.com"))
               .andExpect(jsonPath("$.data.userId").value(1));
    }

    @Test
    void register_returns409_onDuplicateEmail() throws Exception {
        when(registrationService.register(any()))
                .thenThrow(new ConflictException("Email is already registered: alice@example.com"));

        mockMvc.perform(post("/api/v1/auth/register/candidate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY))
               .andExpect(status().isConflict())
               .andExpect(jsonPath("$.status").value("error"))
               .andExpect(jsonPath("$.message").value("Email is already registered: alice@example.com"));
    }

    @Test
    void register_returns400_onMissingFields() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register/candidate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
               .andExpect(status().isBadRequest())
               .andExpect(jsonPath("$.status").value("error"))
               .andExpect(jsonPath("$.errors").isArray());
    }

    @Test
    void register_returns400_onInvalidEmail() throws Exception {
        String body = """
                {"fullName":"Alice","email":"not-an-email","password":"secret123","phone":"+601234567"}
                """;
        mockMvc.perform(post("/api/v1/auth/register/candidate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
               .andExpect(status().isBadRequest())
               .andExpect(jsonPath("$.errors[?(@.field=='email')]").exists());
    }

    @Test
    void register_returns400_onShortPassword() throws Exception {
        String body = """
                {"fullName":"Alice","email":"alice@example.com","password":"short","phone":"+601234567"}
                """;
        mockMvc.perform(post("/api/v1/auth/register/candidate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
               .andExpect(status().isBadRequest())
               .andExpect(jsonPath("$.errors[?(@.field=='password')]").exists());
    }

    @Test
    void register_returns400_onOtpDispatchFailure() throws Exception {
        when(registrationService.register(any()))
                .thenThrow(new BusinessException("Registration failed: could not send verification code"));

        mockMvc.perform(post("/api/v1/auth/register/candidate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY))
               .andExpect(status().isBadRequest())
               .andExpect(jsonPath("$.message").value("Registration failed: could not send verification code"));
    }

    // ── POST /verify-otp ──────────────────────────────────────────────────────

    @Test
    void verifyOtp_returns200_onSuccess() throws Exception {
        doNothing().when(registrationService).verifyOtp("alice@example.com", "123456");

        mockMvc.perform(post("/api/v1/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"alice@example.com","otp":"123456"}
                                """))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.status").value("success"))
               .andExpect(jsonPath("$.message").value("Account verified successfully"));
    }

    @Test
    void verifyOtp_returns400_onExpiredOtp() throws Exception {
        doThrow(new BusinessException("OTP has expired. Please request a new one"))
                .when(registrationService).verifyOtp("alice@example.com", "123456");

        mockMvc.perform(post("/api/v1/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"alice@example.com","otp":"123456"}
                                """))
               .andExpect(status().isBadRequest())
               .andExpect(jsonPath("$.message").value("OTP has expired. Please request a new one"));
    }

    @Test
    void verifyOtp_returns400_onInvalidOtpFormat() throws Exception {
        mockMvc.perform(post("/api/v1/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"alice@example.com","otp":"abc"}
                                """))
               .andExpect(status().isBadRequest())
               .andExpect(jsonPath("$.errors[?(@.field=='otp')]").exists());
    }
}
