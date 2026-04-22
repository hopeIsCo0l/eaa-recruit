package com.eaa.recruit.controller;

import com.eaa.recruit.dto.ApiResponse;
import com.eaa.recruit.dto.admin.CreateRecruiterRequest;
import com.eaa.recruit.dto.admin.RecruiterCreatedResponse;
import com.eaa.recruit.dto.admin.UserStatusRequest;
import com.eaa.recruit.security.AuthenticatedUser;
import com.eaa.recruit.security.rbac.IsAdmin;
import com.eaa.recruit.service.RecruiterAdminService;
import com.eaa.recruit.service.UserStatusService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/users")
@IsAdmin
public class AdminUserController {

    private final RecruiterAdminService recruiterAdminService;
    private final UserStatusService     userStatusService;

    public AdminUserController(RecruiterAdminService recruiterAdminService,
                               UserStatusService userStatusService) {
        this.recruiterAdminService = recruiterAdminService;
        this.userStatusService     = userStatusService;
    }

    /**
     * POST /api/v1/admin/users/recruiter
     * Creates an ACTIVE recruiter account. ADMIN + SUPER_ADMIN only.
     */
    @PostMapping("/recruiter")
    public ResponseEntity<ApiResponse<RecruiterCreatedResponse>> createRecruiter(
            @Valid @RequestBody CreateRecruiterRequest request,
            @AuthenticationPrincipal AuthenticatedUser requester) {

        RecruiterCreatedResponse response = recruiterAdminService.createRecruiter(request, requester);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Recruiter account created successfully", response));
    }

    /**
     * PATCH /api/v1/admin/users/{id}/status
     * Activates or deactivates any user. Takes effect immediately.
     * Admins cannot deactivate SUPER_ADMIN accounts.
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> setUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UserStatusRequest request,
            @AuthenticationPrincipal AuthenticatedUser requester) {

        userStatusService.setStatus(id, request.active(), requester);
        String msg = Boolean.TRUE.equals(request.active())
                ? "User activated successfully"
                : "User deactivated successfully";
        return ResponseEntity.ok(ApiResponse.success(msg));
    }
}
