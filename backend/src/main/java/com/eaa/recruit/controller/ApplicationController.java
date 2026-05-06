package com.eaa.recruit.controller;

import com.eaa.recruit.dto.ApiResponse;
import com.eaa.recruit.dto.application.ApplicationResponse;
import com.eaa.recruit.dto.application.SubmitApplicationResponse;
import com.eaa.recruit.security.AuthenticatedUser;
import com.eaa.recruit.security.rbac.IsCandidate;
import com.eaa.recruit.service.ApplicationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    /**
     * POST /api/v1/applications
     * Submit a job application with a CV file. Candidate only.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @IsCandidate
    public ResponseEntity<ApiResponse<SubmitApplicationResponse>> submitApplication(
            @RequestParam("jobId") Long jobId,
            @RequestParam("cv") MultipartFile cv,
            @AuthenticationPrincipal AuthenticatedUser principal) {

        SubmitApplicationResponse response = applicationService.submitApplication(jobId, cv, principal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Application submitted successfully", response));
    }

    /** GET /api/v1/applications/me — list current candidate's applications. */
    @GetMapping("/me")
    @IsCandidate
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> listMyApplications(
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.success(applicationService.listMyApplications(principal.id())));
    }
}
