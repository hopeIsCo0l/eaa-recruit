package com.eaa.recruit.controller;

import com.eaa.recruit.dto.ApiResponse;
import com.eaa.recruit.dto.availability.AvailabilitySlotBatchRequest;
import com.eaa.recruit.dto.availability.AvailabilitySlotResponse;
import com.eaa.recruit.dto.recruiter.DashboardEntryResponse;
import com.eaa.recruit.security.AuthenticatedUser;
import com.eaa.recruit.security.rbac.IsRecruiter;
import com.eaa.recruit.service.AvailabilitySlotService;
import com.eaa.recruit.service.RecruiterDashboardService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recruiters")
@IsRecruiter
public class RecruiterController {

    private final AvailabilitySlotService  availabilitySlotService;
    private final RecruiterDashboardService dashboardService;

    public RecruiterController(AvailabilitySlotService availabilitySlotService,
                                RecruiterDashboardService dashboardService) {
        this.availabilitySlotService = availabilitySlotService;
        this.dashboardService        = dashboardService;
    }

    /**
     * POST /api/v1/recruiters/availability
     * FR-16: Add one or more interview availability slots.
     */
    @PostMapping("/availability")
    public ResponseEntity<ApiResponse<List<AvailabilitySlotResponse>>> addSlots(
            @Valid @RequestBody AvailabilitySlotBatchRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {

        List<AvailabilitySlotResponse> slots = availabilitySlotService.addSlots(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Availability slots added", slots));
    }

    /**
     * GET /api/v1/recruiters/availability
     * FR-16: Retrieve all future availability slots for the authenticated recruiter.
     */
    @GetMapping("/availability")
    public ResponseEntity<ApiResponse<List<AvailabilitySlotResponse>>> getSlots(
            @AuthenticationPrincipal AuthenticatedUser principal) {

        List<AvailabilitySlotResponse> slots = availabilitySlotService.getAvailableSlots(principal);
        return ResponseEntity.ok(ApiResponse.success(slots));
    }

    /**
     * GET /api/v1/recruiters/dashboard
     * FR-17: Paginated dashboard with application counts per job.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Page<DashboardEntryResponse>>> getDashboard(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @PageableDefault(size = 20, sort = "totalApplications") Pageable pageable) {

        Page<DashboardEntryResponse> dashboard = dashboardService.getDashboard(principal, pageable);
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }
}
