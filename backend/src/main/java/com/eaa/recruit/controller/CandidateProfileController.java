package com.eaa.recruit.controller;

import com.eaa.recruit.dto.ApiResponse;
import com.eaa.recruit.dto.candidate.CandidateProfileRequest;
import com.eaa.recruit.dto.candidate.CandidateProfileResponse;
import com.eaa.recruit.security.AuthenticatedUser;
import com.eaa.recruit.security.rbac.IsCandidate;
import com.eaa.recruit.service.CandidateProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/candidates")
@IsCandidate
public class CandidateProfileController {

    private final CandidateProfileService profileService;

    public CandidateProfileController(CandidateProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<CandidateProfileResponse>> getProfile(
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.success(profileService.getProfile(principal.id())));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<CandidateProfileResponse>> updateProfile(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody CandidateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated", profileService.updateProfile(principal.id(), request)));
    }
}
