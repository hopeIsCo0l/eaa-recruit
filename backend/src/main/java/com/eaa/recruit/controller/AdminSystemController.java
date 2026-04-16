package com.eaa.recruit.controller;

import com.eaa.recruit.dto.ApiResponse;
import com.eaa.recruit.dto.admin.AiModelRequest;
import com.eaa.recruit.dto.admin.AiModelResponse;
import com.eaa.recruit.dto.admin.AuditLogResponse;
import com.eaa.recruit.dto.admin.SystemHealthResponse;
import com.eaa.recruit.entity.AuditLog;
import com.eaa.recruit.repository.AuditLogRepository;
import com.eaa.recruit.security.AuthenticatedUser;
import com.eaa.recruit.security.rbac.IsAdmin;
import com.eaa.recruit.security.rbac.IsSuperAdmin;
import com.eaa.recruit.service.AiModelService;
import com.eaa.recruit.service.ArchiveService;
import com.eaa.recruit.service.SystemHealthService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * FR-36: Job archiving (recruiter+)
 * FR-37: Audit log access (admin+)
 * FR-38: System health (super admin)
 * FR-39: AI model management (super admin)
 */
@RestController
@RequestMapping("/api/v1/admin")
public class AdminSystemController {

    private final ArchiveService      archiveService;
    private final AuditLogRepository  auditLogRepository;
    private final SystemHealthService systemHealthService;
    private final AiModelService      aiModelService;

    public AdminSystemController(ArchiveService archiveService,
                                  AuditLogRepository auditLogRepository,
                                  SystemHealthService systemHealthService,
                                  AiModelService aiModelService) {
        this.archiveService      = archiveService;
        this.auditLogRepository  = auditLogRepository;
        this.systemHealthService = systemHealthService;
        this.aiModelService      = aiModelService;
    }

    /** POST /api/v1/admin/jobs/{id}/archive — FR-36 */
    @IsAdmin
    @PostMapping("/jobs/{id}/archive")
    public ResponseEntity<ApiResponse<Void>> archiveJob(
            @PathVariable("id") Long jobId,
            @AuthenticationPrincipal AuthenticatedUser principal) {

        archiveService.archive(jobId, principal);
        return ResponseEntity.ok(ApiResponse.success("Job archived"));
    }

    /** GET /api/v1/admin/audit-logs — FR-37 */
    @IsAdmin
    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getAuditLogs(
            @PageableDefault(size = 20) Pageable pageable) {

        Page<AuditLog> page = auditLogRepository.findAllByOrderByChangedAtDesc(pageable);
        List<AuditLogResponse> responses = page.stream().map(this::toResponse).toList();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    /** GET /api/v1/admin/audit-logs/{entityType}/{entityId} — FR-37 */
    @IsAdmin
    @GetMapping("/audit-logs/{entityType}/{entityId}")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getEntityAuditLogs(
            @PathVariable String entityType,
            @PathVariable Long entityId,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<AuditLog> page = auditLogRepository.findByEntityTypeAndEntityIdOrderByChangedAtDesc(
                entityType.toUpperCase(), entityId, pageable);
        List<AuditLogResponse> responses = page.stream().map(this::toResponse).toList();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    /** GET /api/v1/admin/system/health — FR-38 */
    @IsSuperAdmin
    @GetMapping("/system/health")
    public ResponseEntity<ApiResponse<SystemHealthResponse>> getSystemHealth() {
        return ResponseEntity.ok(ApiResponse.success(systemHealthService.getHealth()));
    }

    /** POST /api/v1/admin/ai-models — FR-39 */
    @IsSuperAdmin
    @PostMapping("/ai-models")
    public ResponseEntity<ApiResponse<AiModelResponse>> registerModel(
            @Valid @RequestBody AiModelRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {

        AiModelResponse response = aiModelService.register(request, principal);
        return ResponseEntity.ok(ApiResponse.success("AI model registered", response));
    }

    /** GET /api/v1/admin/ai-models — FR-39 */
    @IsSuperAdmin
    @GetMapping("/ai-models")
    public ResponseEntity<ApiResponse<List<AiModelResponse>>> listModels() {
        return ResponseEntity.ok(ApiResponse.success(aiModelService.listAll()));
    }

    /** GET /api/v1/admin/ai-models/active — FR-39 */
    @IsSuperAdmin
    @GetMapping("/ai-models/active")
    public ResponseEntity<ApiResponse<AiModelResponse>> getActiveModel() {
        return ResponseEntity.ok(ApiResponse.success(aiModelService.getActive()));
    }

    /** POST /api/v1/admin/ai-models/{id}/activate — FR-39 */
    @IsSuperAdmin
    @PostMapping("/ai-models/{id}/activate")
    public ResponseEntity<ApiResponse<AiModelResponse>> activateModel(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Model activated", aiModelService.activate(id)));
    }

    private AuditLogResponse toResponse(AuditLog log) {
        return new AuditLogResponse(
                log.getId(),
                log.getEntityType(),
                log.getEntityId(),
                log.getOldStatus(),
                log.getNewStatus(),
                log.getChangedBy() != null ? log.getChangedBy().getId() : null,
                log.getChangedBy() != null ? log.getChangedBy().getEmail() : null,
                log.getChangedAt(),
                log.getReason());
    }
}
