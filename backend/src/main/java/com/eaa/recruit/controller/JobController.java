package com.eaa.recruit.controller;

import com.eaa.recruit.dto.ApiResponse;
import com.eaa.recruit.dto.job.CreateJobRequest;
import com.eaa.recruit.dto.job.CreateJobResponse;
import com.eaa.recruit.security.AuthenticatedUser;
import com.eaa.recruit.security.rbac.IsRecruiter;
import com.eaa.recruit.service.JobService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/jobs")
@IsRecruiter
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    /**
     * POST /api/v1/jobs
     * Creates a new job posting in DRAFT status. Recruiter only.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CreateJobResponse>> createJob(
            @Valid @RequestBody CreateJobRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {

        CreateJobResponse response = jobService.createJob(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Job posting created successfully", response));
    }
}
