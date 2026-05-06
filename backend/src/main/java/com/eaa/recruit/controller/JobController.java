package com.eaa.recruit.controller;

import com.eaa.recruit.dto.ApiResponse;
import com.eaa.recruit.dto.job.CreateJobRequest;
import com.eaa.recruit.dto.job.CreateJobResponse;
import com.eaa.recruit.dto.job.JobResponse;
import com.eaa.recruit.security.AuthenticatedUser;
import com.eaa.recruit.security.rbac.IsAuthenticated;
import com.eaa.recruit.security.rbac.IsRecruiter;
import com.eaa.recruit.service.JobService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping
    @IsRecruiter
    public ResponseEntity<ApiResponse<CreateJobResponse>> createJob(
            @Valid @RequestBody CreateJobRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {

        CreateJobResponse response = jobService.createJob(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Job posting created successfully", response));
    }

    @GetMapping
    @IsAuthenticated
    public ResponseEntity<ApiResponse<List<JobResponse>>> listOpenJobs() {
        return ResponseEntity.ok(ApiResponse.success(jobService.listOpenJobs()));
    }

    @GetMapping("/mine")
    @IsRecruiter
    public ResponseEntity<ApiResponse<List<JobResponse>>> listMyJobs(
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.success(jobService.listJobsByRecruiter(principal.id())));
    }

    @GetMapping("/{id}")
    @IsAuthenticated
    public ResponseEntity<ApiResponse<JobResponse>> getJob(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(jobService.getJob(id)));
    }
}
