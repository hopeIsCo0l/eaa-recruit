package com.eaa.recruit.service;

import com.eaa.recruit.dto.application.DecisionRequest;
import com.eaa.recruit.dto.application.DecisionResponse;
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
 * FR-33: Recruiter records final decision (SELECTED/REJECTED/WAITLISTED).
 */
@Service
public class FinalDecisionService {

    private static final Logger log = LoggerFactory.getLogger(FinalDecisionService.class);

    private static final Set<ApplicationStatus> ALLOWED_DECISIONS =
            Set.of(ApplicationStatus.SELECTED, ApplicationStatus.REJECTED,
                   ApplicationStatus.WAITLISTED);

    private static final Set<ApplicationStatus> ELIGIBLE_STATUSES =
            Set.of(ApplicationStatus.INTERVIEW_SCHEDULED, ApplicationStatus.SHORTLISTED);

    private final ApplicationRepository     applicationRepository;
    private final UserRepository            userRepository;
    private final CandidateNotificationPort candidateNotificationPort;
    private final AuditLogService           auditLogService;

    public FinalDecisionService(ApplicationRepository applicationRepository,
                                 UserRepository userRepository,
                                 CandidateNotificationPort candidateNotificationPort,
                                 AuditLogService auditLogService) {
        this.applicationRepository     = applicationRepository;
        this.userRepository            = userRepository;
        this.candidateNotificationPort = candidateNotificationPort;
        this.auditLogService           = auditLogService;
    }

    @Transactional
    public DecisionResponse recordDecision(Long applicationId, DecisionRequest request,
                                            AuthenticatedUser principal) {
        if (!ALLOWED_DECISIONS.contains(request.decision())) {
            throw new BusinessException("Decision must be SELECTED, REJECTED, or WAITLISTED");
        }

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        if (!ELIGIBLE_STATUSES.contains(application.getStatus())) {
            throw new BusinessException("Final decision only allowed from SHORTLISTED or INTERVIEW_SCHEDULED status");
        }

        if (application.hasFinalDecision()) {
            throw new BusinessException("Decision already recorded");
        }

        User recruiter = userRepository.findById(principal.id())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String oldStatus = application.getStatus().name();
        application.recordDecision(request.decision(), request.notes(), recruiter);
        applicationRepository.save(application);

        auditLogService.log("APPLICATION", applicationId, oldStatus,
                request.decision().name(), recruiter, request.notes());

        candidateNotificationPort.notifyDecision(
                application.getCandidate().getEmail(),
                application.getCandidate().getFullName(),
                application.getJob().getTitle(),
                request.decision().name(),
                request.notes());

        log.info("Decision recorded applicationId={} decision={} by={}",
                applicationId, request.decision(), principal.id());

        return new DecisionResponse(
                applicationId,
                application.getStatus(),
                application.getDecisionNotes(),
                application.getDecidedAt());
    }
}
