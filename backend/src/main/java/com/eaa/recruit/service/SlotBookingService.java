package com.eaa.recruit.service;

import com.eaa.recruit.dto.availability.AvailabilitySlotResponse;
import com.eaa.recruit.entity.Application;
import com.eaa.recruit.entity.ApplicationStatus;
import com.eaa.recruit.entity.AvailabilitySlot;
import com.eaa.recruit.exception.BusinessException;
import com.eaa.recruit.exception.ConflictException;
import com.eaa.recruit.exception.ResourceNotFoundException;
import com.eaa.recruit.notification.CandidateNotificationPort;
import com.eaa.recruit.repository.ApplicationRepository;
import com.eaa.recruit.repository.AvailabilitySlotRepository;
import com.eaa.recruit.security.AuthenticatedUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * FR-30/31: Candidate books an interview slot for a job.
 * Double-booking prevented at DB level (unique constraint on booked_by_id)
 * and via optimistic locking (@Version in BaseEntity).
 */
@Service
public class SlotBookingService {

    private static final Logger log = LoggerFactory.getLogger(SlotBookingService.class);

    private final ApplicationRepository      applicationRepository;
    private final AvailabilitySlotRepository slotRepository;
    private final CandidateNotificationPort  candidateNotificationPort;

    public SlotBookingService(ApplicationRepository applicationRepository,
                               AvailabilitySlotRepository slotRepository,
                               CandidateNotificationPort candidateNotificationPort) {
        this.applicationRepository     = applicationRepository;
        this.slotRepository            = slotRepository;
        this.candidateNotificationPort = candidateNotificationPort;
    }

    /** GET /api/v1/jobs/{jobId}/slots — list available slots for the candidate's shortlisted job. */
    @Transactional(readOnly = true)
    public List<AvailabilitySlotResponse> listAvailableForJob(Long jobId, AuthenticatedUser principal) {
        Application application = requireShortlistedApplication(jobId, principal);
        Long recruiterId = application.getJob().getCreatedBy().getId();

        return slotRepository.findAvailableByRecruiterId(recruiterId, LocalDate.now()).stream()
                .map(s -> new AvailabilitySlotResponse(
                        s.getId(), s.getSlotDate(), s.getStartTime(), s.getEndTime(), false))
                .toList();
    }

    /** POST /api/v1/jobs/{jobId}/slots/{slotId}/book — book a slot for the candidate's application. */
    @Transactional
    public void bookSlot(Long jobId, Long slotId, AuthenticatedUser principal) {
        Application application = applicationRepository
                .findByCandidateIdAndJobId(principal.id(), jobId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No application found for this job"));

        // One booking per job — second attempt returns 409
        if (application.getStatus() == ApplicationStatus.INTERVIEW_SCHEDULED) {
            throw new ConflictException("You have already booked an interview slot for this job");
        }

        if (application.getStatus() != ApplicationStatus.SHORTLISTED) {
            throw new BusinessException("Interview booking is only allowed for SHORTLISTED applications");
        }

        AvailabilitySlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found: " + slotId));

        // Slot must belong to the job's recruiter
        if (!slot.getRecruiter().getId().equals(application.getJob().getCreatedBy().getId())) {
            throw new BusinessException("Slot does not belong to this job's recruiter");
        }

        if (slot.isBooked()) {
            throw new ConflictException("Slot is already booked");
        }

        try {
            slot.book(application.getCandidate());
            slotRepository.save(slot);

            application.bookInterviewSlot(slot);
            applicationRepository.save(application);

            log.info("Slot booked applicationId={} slotId={} candidateId={} jobId={}",
                    application.getId(), slotId, principal.id(), jobId);

            candidateNotificationPort.notifyBookingConfirmed(
                    application.getCandidate().getEmail(),
                    application.getCandidate().getFullName(),
                    application.getJob().getTitle(),
                    slot.getSlotDate().toString(),
                    slot.getStartTime().toString());

        } catch (DataIntegrityViolationException | ObjectOptimisticLockingFailureException e) {
            throw new ConflictException("Slot was taken concurrently — please choose another");
        }
    }

    private Application requireShortlistedApplication(Long jobId, AuthenticatedUser principal) {
        Application application = applicationRepository
                .findByCandidateIdAndJobId(principal.id(), jobId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No application found for this job"));

        ApplicationStatus status = application.getStatus();
        if (status != ApplicationStatus.SHORTLISTED && status != ApplicationStatus.INTERVIEW_SCHEDULED) {
            throw new BusinessException(
                    "Slot listing is only available for SHORTLISTED or INTERVIEW_SCHEDULED applications");
        }
        return application;
    }
}
