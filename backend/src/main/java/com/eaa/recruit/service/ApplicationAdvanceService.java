package com.eaa.recruit.service;

import com.eaa.recruit.dto.recruiter.AdvanceApplicationRequest;
import com.eaa.recruit.entity.Application;
import com.eaa.recruit.entity.ApplicationStatus;
import com.eaa.recruit.entity.User;
import com.eaa.recruit.exception.BusinessException;
import com.eaa.recruit.exception.ResourceNotFoundException;
import com.eaa.recruit.notification.CandidateNotificationPort;
import com.eaa.recruit.repository.ApplicationRepository;
import com.eaa.recruit.repository.UserRepository;
import com.eaa.recruit.security.AuthenticatedUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

/**
 * Handles recruiter-initiated application status transitions (kanban drag).
 * <p>
 * Valid recruiter transitions:
 * <ul>
 *   <li>EXAM_COMPLETED → SHORTLISTED</li>
 *   <li>INTERVIEW_SCHEDULED → SELECTED / REJECTED / WAITLISTED</li>
 *   <li>Any recruiter-accessible stage → REJECTED</li>
 * </ul>
 */
@Service
public class ApplicationAdvanceService {

    private static final Logger log = LoggerFactory.getLogger(ApplicationAdvanceService.class);

    private static final Set<ApplicationStatus> RECRUITER_DECISION_TARGETS =
            Set.of(ApplicationStatus.SELECTED, ApplicationStatus.REJECTED, ApplicationStatus.WAITLISTED);

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final CandidateNotificationPort candidateNotificationPort;

    public ApplicationAdvanceService(ApplicationRepository applicationRepository,
                                     UserRepository userRepository,
                                     CandidateNotificationPort candidateNotificationPort) {
        this.applicationRepository     = applicationRepository;
        this.userRepository            = userRepository;
        this.candidateNotificationPort = candidateNotificationPort;
    }

    @Transactional
    public void advance(Long applicationId, AdvanceApplicationRequest request, AuthenticatedUser principal) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        // Verify recruiter owns this job
        if (!app.getJob().getCreatedBy().getId().equals(principal.id())) {
            throw new BusinessException("You can only manage applications for your own jobs");
        }

        ApplicationStatus target;
        try {
            target = ApplicationStatus.valueOf(request.targetStatus());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Invalid target status: " + request.targetStatus());
        }

        ApplicationStatus current = app.getStatus();

        // Validate transition
        if (target == ApplicationStatus.SHORTLISTED) {
            if (current != ApplicationStatus.EXAM_COMPLETED) {
                throw new BusinessException("Only EXAM_COMPLETED applications can be shortlisted");
            }
            app.shortlist();
            candidateNotificationPort.notifyShortlisted(
                    app.getCandidate().getEmail(),
                    app.getCandidate().getFullName(),
                    app.getJob().getTitle());

        } else if (RECRUITER_DECISION_TARGETS.contains(target)) {
            if (current != ApplicationStatus.INTERVIEW_SCHEDULED
                    && current != ApplicationStatus.SHORTLISTED
                    && current != ApplicationStatus.EXAM_COMPLETED) {
                throw new BusinessException(
                        "Can only decide on INTERVIEW_SCHEDULED, SHORTLISTED, or EXAM_COMPLETED applications");
            }
            User recruiter = userRepository.findById(principal.id())
                    .orElseThrow(() -> new ResourceNotFoundException("Recruiter not found"));
            app.recordDecision(target, request.notes(), recruiter);

        } else {
            throw new BusinessException("Recruiter cannot move applications to " + target
                    + ". Allowed: SHORTLISTED, SELECTED, REJECTED, WAITLISTED");
        }

        applicationRepository.save(app);
        log.info("Application {} advanced from {} to {} by recruiter {}",
                applicationId, current, target, principal.id());
    }
}
