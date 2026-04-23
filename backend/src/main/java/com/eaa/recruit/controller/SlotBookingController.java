package com.eaa.recruit.controller;

import com.eaa.recruit.dto.ApiResponse;
import com.eaa.recruit.dto.availability.AvailabilitySlotResponse;
import com.eaa.recruit.security.AuthenticatedUser;
import com.eaa.recruit.security.rbac.IsCandidate;
import com.eaa.recruit.service.SlotBookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * FR-30/31: Candidate lists and books interview slots for a job.
 */
@RestController
@RequestMapping("/api/v1/jobs/{jobId}/slots")
public class SlotBookingController {

    private final SlotBookingService slotBookingService;

    public SlotBookingController(SlotBookingService slotBookingService) {
        this.slotBookingService = slotBookingService;
    }

    /** GET /api/v1/jobs/{jobId}/slots — list unbooked slots for the candidate's shortlisted job. */
    @IsCandidate
    @GetMapping
    public ResponseEntity<ApiResponse<List<AvailabilitySlotResponse>>> listAvailable(
            @PathVariable Long jobId,
            @AuthenticationPrincipal AuthenticatedUser principal) {

        List<AvailabilitySlotResponse> slots = slotBookingService.listAvailableForJob(jobId, principal);
        return ResponseEntity.ok(ApiResponse.success(slots));
    }

    /** POST /api/v1/jobs/{jobId}/slots/{slotId}/book — book a slot. */
    @IsCandidate
    @PostMapping("/{slotId}/book")
    public ResponseEntity<ApiResponse<Void>> book(
            @PathVariable Long jobId,
            @PathVariable Long slotId,
            @AuthenticationPrincipal AuthenticatedUser principal) {

        slotBookingService.bookSlot(jobId, slotId, principal);
        return ResponseEntity.ok(ApiResponse.success("Interview slot booked"));
    }
}
