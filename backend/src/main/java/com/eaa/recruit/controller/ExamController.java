package com.eaa.recruit.controller;

import com.eaa.recruit.dto.ApiResponse;
import com.eaa.recruit.dto.application.BatchAuthorizeRequest;
import com.eaa.recruit.dto.application.BatchAuthorizeResponse;
import com.eaa.recruit.dto.exam.CreateExamRequest;
import com.eaa.recruit.dto.exam.CreateExamResponse;
import com.eaa.recruit.security.AuthenticatedUser;
import com.eaa.recruit.security.rbac.IsRecruiter;
import com.eaa.recruit.service.ExamService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/jobs/{jobId}/exam")
@IsRecruiter
public class ExamController {

    private final ExamService examService;

    public ExamController(ExamService examService) {
        this.examService = examService;
    }

    /**
     * POST /api/v1/jobs/{jobId}/exam
     * FR-24: Define an exam for a job posting. Recruiter only.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CreateExamResponse>> createExam(
            @PathVariable Long jobId,
            @Valid @RequestBody CreateExamRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {

        CreateExamResponse response = examService.createExam(jobId, request, principal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Exam created successfully", response));
    }

    /**
     * POST /api/v1/jobs/{jobId}/exam/authorize
     * FR-25: Authorize a batch of candidates for the exam.
     */
    @PostMapping("/authorize")
    public ResponseEntity<ApiResponse<BatchAuthorizeResponse>> authorizeExamBatch(
            @PathVariable Long jobId,
            @Valid @RequestBody BatchAuthorizeRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {

        BatchAuthorizeResponse response = examService.authorizeExamBatch(jobId, request, principal);
        return ResponseEntity.ok(ApiResponse.success("Batch authorization completed", response));
    }
}
