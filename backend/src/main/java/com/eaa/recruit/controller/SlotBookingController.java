package com.eaa.recruit.controller;

import com.eaa.recruit.dto.ApiResponse;
import com.eaa.recruit.dto.application.SlotBookingRequest;
import com.eaa.recruit.repository.AvailabilitySlotRepository;
import com.eaa.recruit.security.AuthenticatedUser;
import com.eaa.recruit.security.rbac.IsCandidate;
import com.eaa.recruit.service.SlotBookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * FR-30/31: Candidate books an interview slot.
 */
@RestController
@RequestMapping("/api/v1/applications")
public class SlotBookingController {

    private final SlotBookingService slotBookingService;

    public SlotBookingController(SlotBookingService slotBookingService) {
        this.slotBookingService = slotBookingService;
    }

    /** POST /api/v1/applications/{id}/book-slot */
    @IsCandidate
    @PostMapping("/{id}/book-slot")
    public ResponseEntity<ApiResponse<Void>> bookSlot(
            @PathVariable("id") Long applicationId,
            @Valid @RequestBody SlotBookingRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {

        slotBookingService.bookSlot(applicationId, request, principal);
        return ResponseEntity.ok(ApiResponse.success("Interview slot booked"));
    }
}
