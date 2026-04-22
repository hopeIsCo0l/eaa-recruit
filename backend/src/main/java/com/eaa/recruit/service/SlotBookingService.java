package com.eaa.recruit.service;

import com.eaa.recruit.dto.application.SlotBookingRequest;
import com.eaa.recruit.entity.Application;
import com.eaa.recruit.entity.ApplicationStatus;
import com.eaa.recruit.entity.AvailabilitySlot;
import com.eaa.recruit.exception.BusinessException;
import com.eaa.recruit.exception.ConflictException;
import com.eaa.recruit.exception.ResourceNotFoundException;
import com.eaa.recruit.repository.ApplicationRepository;
import com.eaa.recruit.repository.AvailabilitySlotRepository;
import com.eaa.recruit.repository.UserRepository;
import com.eaa.recruit.security.AuthenticatedUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * FR-30/31: Candidate books an interview slot.
 * Double-booking prevented at DB level (unique constraint on booked_by_id)
 * and via optimistic locking (@Version in BaseEntity).
 */
@Service
public class SlotBookingService {

    private static final Logger log = LoggerFactory.getLogger(SlotBookingService.class);

    private final ApplicationRepository      applicationRepository;
    private final AvailabilitySlotRepository slotRepository;
    private final AuditLogService            auditLogService;
    private final UserRepository             userRepository;

    public SlotBookingService(ApplicationRepository applicationRepository,
                               AvailabilitySlotRepository slotRepository,
                               AuditLogService auditLogService,
                               UserRepository userRepository) {
        this.applicationRepository = applicationRepository;
        this.slotRepository        = slotRepository;
        this.auditLogService       = auditLogService;
        this.userRepository        = userRepository;
    }

    @Transactional
    public void bookSlot(Long applicationId, SlotBookingRequest request,
                          AuthenticatedUser principal) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        if (!application.getCandidate().getId().equals(principal.id())) {
            throw new BusinessException("You can only book slots for your own applications");
        }

        if (application.getStatus() != ApplicationStatus.SHORTLISTED) {
            throw new BusinessException("Interview booking is only allowed for SHORTLISTED applications");
        }

        AvailabilitySlot slot = slotRepository.findById(request.slotId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found: " + request.slotId()));

        if (slot.isBooked()) {
            throw new ConflictException("Slot is already booked");
        }

        try {
            ApplicationStatus oldStatus = application.getStatus();
            slot.book(application.getCandidate());
            slotRepository.save(slot);

            application.bookInterviewSlot(slot);
            applicationRepository.save(application);

            log.info("Slot booked applicationId={} slotId={} candidateId={}",
                    applicationId, request.slotId(), principal.id());
            auditLogService.log("APPLICATION", applicationId, oldStatus.name(),
                    application.getStatus().name(),
                    userRepository.getReferenceById(principal.id()),
                    "Candidate booked interview slot " + request.slotId());

        } catch (DataIntegrityViolationException e) {
            throw new ConflictException("Slot was taken concurrently — please choose another");
        }
    }
}
