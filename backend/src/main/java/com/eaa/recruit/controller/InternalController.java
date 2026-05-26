package com.eaa.recruit.controller;

import com.eaa.recruit.config.InternalApiKeyProperties;
import com.eaa.recruit.dto.ApiResponse;
import com.eaa.recruit.dto.application.AiScoreCallbackRequest;
import com.eaa.recruit.dto.internal.ExamCompletedRequest;
import com.eaa.recruit.dto.internal.ExamScoreCallbackRequest;
import com.eaa.recruit.entity.Application;
import com.eaa.recruit.entity.Question;
import com.eaa.recruit.exception.ResourceNotFoundException;
import com.eaa.recruit.exception.UnauthorizedException;
import com.eaa.recruit.repository.ApplicationRepository;
import com.eaa.recruit.repository.QuestionRepository;
import com.eaa.recruit.service.ApplicationService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Internal endpoints called by other services (e.g., Python AI service).
 * Secured via X-Internal-Api-Key header — not exposed to public traffic.
 */
@RestController
@RequestMapping("/api/v1/internal")
public class InternalController {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final TypeReference<List<String>> STRING_LIST = new TypeReference<>() {};

    private final ApplicationService       applicationService;
    private final ApplicationRepository    applicationRepository;
    private final QuestionRepository       questionRepository;
    private final InternalApiKeyProperties apiKeyProperties;

    public InternalController(ApplicationService applicationService,
                               ApplicationRepository applicationRepository,
                               QuestionRepository questionRepository,
                               InternalApiKeyProperties apiKeyProperties) {
        this.applicationService    = applicationService;
        this.applicationRepository = applicationRepository;
        this.questionRepository    = questionRepository;
        this.apiKeyProperties      = apiKeyProperties;
    }

    /**
     * GET /api/v1/internal/exams/{examId}/questions
     * Called by the Go exam engine on EXAM_BATCH_READY to fetch the question set.
     * Returns IDs as strings + correctAnswer stringified for direct equality on the engine.
     */
    @GetMapping("/exams/{examId}/questions")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> fetchExamQuestions(
            @PathVariable("examId") Long examId,
            @RequestHeader("X-Internal-Api-Key") String apiKey) {

        validateApiKey(apiKey);

        List<Map<String, Object>> payload = questionRepository
                .findByExamIdOrderByDisplayOrderAsc(examId)
                .stream()
                .map(q -> toEnginePayload(examId, q))
                .toList();

        return ResponseEntity.ok(ApiResponse.success(payload));
    }

    private Map<String, Object> toEnginePayload(Long examId, Question q) {
        List<String> options = parseOptions(q.getOptions());
        String correct = q.getCorrectAnswer() == null ? "" : String.valueOf(q.getCorrectAnswer());
        String idealAnswer = q.getIdealAnswer() != null ? q.getIdealAnswer() : "";
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("id",            String.valueOf(q.getId()));
        map.put("examId",        String.valueOf(examId));
        map.put("text",          q.getQuestionText());
        map.put("type",          q.getType().name());
        map.put("options",       options);
        map.put("correctAnswer", correct);
        map.put("idealAnswer",   idealAnswer);
        map.put("marks",         q.getMarks() == null ? 0 : q.getMarks());
        return map;
    }

    private List<String> parseOptions(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return OBJECT_MAPPER.readValue(json, STRING_LIST);
        } catch (Exception ex) {
            return Collections.emptyList();
        }
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
