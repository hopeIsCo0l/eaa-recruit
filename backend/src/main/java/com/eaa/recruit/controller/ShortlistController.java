package com.eaa.recruit.controller;

import com.eaa.recruit.dto.ApiResponse;
import com.eaa.recruit.dto.application.ShortlistRequest;
import com.eaa.recruit.dto.application.ShortlistResponse;
import com.eaa.recruit.security.AuthenticatedUser;
import com.eaa.recruit.security.rbac.IsRecruiter;
import com.eaa.recruit.service.ShortlistService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * FR-29: Recruiter shortlists candidates.
 */
@RestController
@RequestMapping("/api/v1/applications")
public class ShortlistController {

    private final ShortlistService shortlistService;

    public ShortlistController(ShortlistService shortlistService) {
        this.shortlistService = shortlistService;
    }

    /** POST /api/v1/applications/shortlist */
    @IsRecruiter
    @PostMapping("/shortlist")
    public ResponseEntity<ApiResponse<ShortlistResponse>> shortlist(
            @Valid @RequestBody ShortlistRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {

        ShortlistResponse response = shortlistService.shortlist(request, principal);
        return ResponseEntity.ok(ApiResponse.success("Shortlisting complete", response));
    }
}
