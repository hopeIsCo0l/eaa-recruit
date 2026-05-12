package com.eaa.recruit.controller;

import com.eaa.recruit.config.InternalApiKeyProperties;
import com.eaa.recruit.dto.ApiResponse;
import com.eaa.recruit.dto.application.AiScoreCallbackRequest;
import com.eaa.recruit.dto.internal.ExamCompletedRequest;
import com.eaa.recruit.dto.internal.ExamScoreCallbackRequest;
import com.eaa.recruit.entity.Application;
import com.eaa.recruit.exception.ResourceNotFoundException;
import com.eaa.recruit.exception.UnauthorizedException;
import com.eaa.recruit.repository.ApplicationRepository;
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
    private final ApplicationRepository    applicationRepository;
    private final InternalApiKeyProperties apiKeyProperties;

    public InternalController(ApplicationService applicationService,
                               ApplicationRepository applicationRepository,
                               InternalApiKeyProperties apiKeyProperties) {
        this.applicationService    = applicationService;
        this.applicationRepository = applicationRepository;
        this.apiKeyProperties      = apiKeyProperties;
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

    /**
     * POST /api/v1/internal/applications/{id}/exam-score
     * FR-27: Receive exam score from Go engine.
     */
    @PostMapping("/applications/{id}/exam-score")
    public ResponseEntity<ApiResponse<Void>> receiveExamScore(
            @PathVariable("id") Long applicationId,
            @RequestHeader("X-Internal-Api-Key") String apiKey,
            @Valid @RequestBody ExamScoreCallbackRequest request) {

        validateApiKey(apiKey);
        applicationService.applyExamScore(applicationId, request);
        return ResponseEntity.ok(ApiResponse.success("Exam score applied"));
    }

    /**
     * POST /api/v1/internal/exam-completed
     * Called by the Go exam engine when an exam finishes. Resolves the
     * application by (candidateId, jobId) and applies the score.
     */
    @PostMapping("/exam-completed")
    public ResponseEntity<ApiResponse<Void>> receiveExamCompleted(
            @RequestHeader("X-Internal-Api-Key") String apiKey,
            @Valid @RequestBody ExamCompletedRequest request) {

        validateApiKey(apiKey);
        Long candidateId = Long.parseLong(request.candidateId());
        Long jobId       = Long.parseLong(request.jobId());

        Application application = applicationRepository.findByCandidateIdAndJobId(candidateId, jobId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Application not found for candidateId=" + candidateId + " jobId=" + jobId));

        applicationService.applyExamScore(application.getId(),
                new ExamScoreCallbackRequest(request.examScore(), request.completedAt()));
        return ResponseEntity.ok(ApiResponse.success("Exam completion recorded"));
    }

    private void validateApiKey(String provided) {
        if (!apiKeyProperties.getApiKey().equals(provided)) {
            throw new UnauthorizedException("Invalid internal API key");
        }
    }
}
