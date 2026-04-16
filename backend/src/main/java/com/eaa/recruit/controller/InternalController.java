package com.eaa.recruit.controller;

import com.eaa.recruit.config.InternalApiKeyProperties;
import com.eaa.recruit.dto.ApiResponse;
import com.eaa.recruit.dto.application.AiScoreCallbackRequest;
import com.eaa.recruit.exception.UnauthorizedException;
import com.eaa.recruit.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Internal endpoints called by other services (e.g., Python AI service).
 * Secured via X-Internal-Api-Key header — not exposed to public traffic.
 */
@RestController
@RequestMapping("/api/v1/internal")
public class InternalController {

    private final ApplicationService       applicationService;
    private final InternalApiKeyProperties apiKeyProperties;

    public InternalController(ApplicationService applicationService,
                               InternalApiKeyProperties apiKeyProperties) {
        this.applicationService = applicationService;
        this.apiKeyProperties   = apiKeyProperties;
    }

    /**
     * POST /api/v1/internal/applications/{id}/ai-score
     * FR-21: Receive AI screening result from the Python AI service.
     */
    @PostMapping("/applications/{id}/ai-score")
    public ResponseEntity<ApiResponse<Void>> receiveAiScore(
            @PathVariable("id") Long applicationId,
            @RequestHeader("X-Internal-Api-Key") String apiKey,
            @Valid @RequestBody AiScoreCallbackRequest request) {

        validateApiKey(apiKey);
        applicationService.applyAiScore(applicationId, request);
        return ResponseEntity.ok(ApiResponse.success("AI score applied"));
    }

    private void validateApiKey(String provided) {
        if (!apiKeyProperties.getApiKey().equals(provided)) {
            throw new UnauthorizedException("Invalid internal API key");
        }
    }
}
