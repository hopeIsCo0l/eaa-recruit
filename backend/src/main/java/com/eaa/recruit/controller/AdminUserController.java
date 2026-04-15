package com.eaa.recruit.controller;

import com.eaa.recruit.dto.ApiResponse;
import com.eaa.recruit.dto.admin.CreateRecruiterRequest;
import com.eaa.recruit.dto.admin.RecruiterCreatedResponse;
import com.eaa.recruit.security.rbac.IsAdmin;
import com.eaa.recruit.service.RecruiterAdminService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/users")
@IsAdmin
public class AdminUserController {

    private final RecruiterAdminService recruiterAdminService;

    public AdminUserController(RecruiterAdminService recruiterAdminService) {
        this.recruiterAdminService = recruiterAdminService;
    }

    /**
     * POST /api/v1/admin/users/recruiter
     * Accessible to ADMIN and SUPER_ADMIN only.
     */
    @PostMapping("/recruiter")
    public ResponseEntity<ApiResponse<RecruiterCreatedResponse>> createRecruiter(
            @Valid @RequestBody CreateRecruiterRequest request) {

        RecruiterCreatedResponse response = recruiterAdminService.createRecruiter(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Recruiter account created successfully", response));
    }
}
