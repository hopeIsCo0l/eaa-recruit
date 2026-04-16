package com.eaa.recruit.controller;

import com.eaa.recruit.dto.ApiResponse;
import com.eaa.recruit.dto.analytics.AnalyticsExportResponse;
import com.eaa.recruit.security.rbac.IsSuperAdmin;
import com.eaa.recruit.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * FR-40: Analytics export for super admin.
 */
@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    /** GET /api/v1/analytics/export */
    @IsSuperAdmin
    @GetMapping("/export")
    public ResponseEntity<ApiResponse<AnalyticsExportResponse>> export() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.export()));
    }
}
