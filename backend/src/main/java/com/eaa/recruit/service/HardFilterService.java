package com.eaa.recruit.service;

import com.eaa.recruit.entity.Application;
import com.eaa.recruit.entity.ApplicationStatus;
import com.eaa.recruit.entity.JobPosting;
import com.eaa.recruit.entity.User;
import com.eaa.recruit.notification.CandidateNotificationPort;
import com.eaa.recruit.repository.ApplicationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HardFilterService {

    private static final Logger log = LoggerFactory.getLogger(HardFilterService.class);

    private final ApplicationRepository       applicationRepository;
    private final CandidateNotificationPort   candidateNotificationPort;
    private final AuditLogService             auditLogService;

    public HardFilterService(ApplicationRepository applicationRepository,
                              CandidateNotificationPort candidateNotificationPort,
                              AuditLogService auditLogService) {
        this.applicationRepository     = applicationRepository;
        this.candidateNotificationPort = candidateNotificationPort;
        this.auditLogService           = auditLogService;
    }

    /**
     * FR-22: Evaluate candidate profile against job hard-filter criteria.
     * Runs after AI score callback. Saves updated application state.
     * Candidates with null profile fields fail the filter.
     */
    @Transactional
    public void applyHardFilter(Application application) {
        User       candidate = application.getCandidate();
        JobPosting job       = application.getJob();

        boolean passed = passesHeightCheck(candidate, job)
                      && passesWeightCheck(candidate, job)
                      && passesDegreeCheck(candidate, job);

        ApplicationStatus oldStatus = application.getStatus();
        if (passed) {
            application.markHardFilterPassed();
            log.info("Hard filter PASSED applicationId={}", application.getId());
        } else {
            application.markHardFilterFailed();
            log.info("Hard filter FAILED applicationId={}", application.getId());
            candidateNotificationPort.notifyHardFilterFailed(
                    candidate.getEmail(),
                    candidate.getFullName(),
                    job.getTitle());
        }

        applicationRepository.save(application);

        if (oldStatus != application.getStatus()) {
            auditLogService.log("APPLICATION", application.getId(), oldStatus.name(),
                    application.getStatus().name(), null, "Hard filter evaluation");
        }
    }

    private boolean passesHeightCheck(User candidate, JobPosting job) {
        if (candidate.getHeightCm() == null) return false;
        return candidate.getHeightCm() >= job.getMinHeightCm();
    }

    private boolean passesWeightCheck(User candidate, JobPosting job) {
        if (candidate.getWeightKg() == null) return false;
        return candidate.getWeightKg() >= job.getMinWeightKg();
    }

    private boolean passesDegreeCheck(User candidate, JobPosting job) {
        if (candidate.getDegree() == null) return false;
        return candidate.getDegree().equalsIgnoreCase(job.getRequiredDegree());
    }
}
