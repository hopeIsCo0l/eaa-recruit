package com.eaa.recruit.controller;

import com.eaa.recruit.dto.ApiResponse;
import com.eaa.recruit.dto.application.DecisionRequest;
import com.eaa.recruit.dto.application.DecisionResponse;
import com.eaa.recruit.dto.application.FeedbackReportResponse;
import com.eaa.recruit.security.AuthenticatedUser;
import com.eaa.recruit.security.rbac.IsCandidate;
import com.eaa.recruit.security.rbac.IsRecruiter;
import com.eaa.recruit.service.FeedbackReportService;
import com.eaa.recruit.service.FinalDecisionService;
import com.eaa.recruit.service.XaiReportService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * FR-33: Final decision (recruiter).
 * FR-34: Feedback report (candidate).
 * FR-35: XAI PDF download (candidate).
 */
@RestController
@RequestMapping("/api/v1/applications")
public class FeedbackController {

    private final FinalDecisionService   finalDecisionService;
    private final FeedbackReportService  feedbackReportService;
    private final XaiReportService       xaiReportService;

    public FeedbackController(FinalDecisionService finalDecisionService,
                               FeedbackReportService feedbackReportService,
                               XaiReportService xaiReportService) {
        this.finalDecisionService  = finalDecisionService;
        this.feedbackReportService = feedbackReportService;
        this.xaiReportService      = xaiReportService;
    }

    /** POST /api/v1/applications/{id}/decision — FR-33 */
    @IsRecruiter
    @PostMapping("/{id}/decision")
    public ResponseEntity<ApiResponse<DecisionResponse>> recordDecision(
            @PathVariable("id") Long applicationId,
            @Valid @RequestBody DecisionRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {

        DecisionResponse response = finalDecisionService.recordDecision(applicationId, request, principal);
        return ResponseEntity.ok(ApiResponse.success("Decision recorded", response));
    }

    /** GET /api/v1/applications/{id}/feedback — FR-34 */
    @IsCandidate
    @GetMapping("/{id}/feedback")
    public ResponseEntity<ApiResponse<FeedbackReportResponse>> getFeedback(
            @PathVariable("id") Long applicationId,
            @AuthenticationPrincipal AuthenticatedUser principal) {

        FeedbackReportResponse response = feedbackReportService.getFeedback(applicationId, principal);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /** GET /api/v1/applications/{id}/xai-report — FR-35 */
    @IsCandidate
    @GetMapping("/{id}/xai-report")
    public ResponseEntity<Resource> downloadXaiReport(
            @PathVariable("id") Long applicationId,
            @AuthenticationPrincipal AuthenticatedUser principal) {

        Resource resource = xaiReportService.getReport(applicationId, principal);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"xai-report-" + applicationId + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }
}
