package com.eaa.recruit.service;

import com.eaa.recruit.dto.availability.AvailabilitySlotBatchRequest;
import com.eaa.recruit.dto.availability.AvailabilitySlotRequest;
import com.eaa.recruit.dto.availability.AvailabilitySlotResponse;
import com.eaa.recruit.entity.AvailabilitySlot;
import com.eaa.recruit.entity.User;
import com.eaa.recruit.exception.BusinessException;
import com.eaa.recruit.exception.ConflictException;
import com.eaa.recruit.exception.ResourceNotFoundException;
import com.eaa.recruit.repository.AvailabilitySlotRepository;
import com.eaa.recruit.repository.UserRepository;
import com.eaa.recruit.security.AuthenticatedUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class AvailabilitySlotService {

    private static final Logger log = LoggerFactory.getLogger(AvailabilitySlotService.class);

    private final AvailabilitySlotRepository slotRepository;
    private final UserRepository             userRepository;

    public AvailabilitySlotService(AvailabilitySlotRepository slotRepository,
                                    UserRepository userRepository) {
        this.slotRepository = slotRepository;
        this.userRepository = userRepository;
    }

    /** FR-16: Add one or more availability slots for the authenticated recruiter. */
    @Transactional
    public List<AvailabilitySlotResponse> addSlots(AvailabilitySlotBatchRequest request,
                                                    AuthenticatedUser principal) {
        User recruiter = userRepository.findById(principal.id())
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter not found"));

        List<AvailabilitySlotResponse> responses = new ArrayList<>();

        for (AvailabilitySlotRequest slot : request.slots()) {
            if (!slot.endTime().isAfter(slot.startTime())) {
                throw new BusinessException("endTime must be after startTime for slot on " + slot.date());
            }
            if (slotRepository.existsOverlap(principal.id(), slot.date(),
                                             slot.startTime(), slot.endTime())) {
                throw new ConflictException(
                        "Slot on " + slot.date() + " from " + slot.startTime()
                        + " to " + slot.endTime() + " overlaps with an existing slot");
            }

            AvailabilitySlot saved = slotRepository.save(
                    AvailabilitySlot.create(recruiter, slot.date(), slot.startTime(), slot.endTime()));

            log.info("Availability slot created id={} recruiterId={} date={}",
                    saved.getId(), principal.id(), slot.date());

            responses.add(toResponse(saved));
        }

        return responses;
    }

    /** FR-16: Return all future (today+) availability slots for the authenticated recruiter. */
    @Transactional(readOnly = true)
    public List<AvailabilitySlotResponse> getAvailableSlots(AuthenticatedUser principal) {
        return slotRepository
                .findByRecruiterIdAndSlotDateGreaterThanEqualOrderBySlotDateAscStartTimeAsc(
                        principal.id(), LocalDate.now())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private AvailabilitySlotResponse toResponse(AvailabilitySlot slot) {
        return new AvailabilitySlotResponse(
                slot.getId(),
                slot.getSlotDate(),
                slot.getStartTime(),
                slot.getEndTime(),
                slot.isBooked()
        );
    }
}
