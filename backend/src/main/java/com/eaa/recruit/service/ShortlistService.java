package com.eaa.recruit.service;

import com.eaa.recruit.dto.application.ShortlistRequest;
import com.eaa.recruit.dto.application.ShortlistResponse;
import com.eaa.recruit.entity.Application;
import com.eaa.recruit.entity.ApplicationStatus;
import com.eaa.recruit.exception.ResourceNotFoundException;
import com.eaa.recruit.notification.CandidateNotificationPort;
import com.eaa.recruit.repository.ApplicationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * FR-29: Recruiter shortlists candidates from EXAM_COMPLETED pool.
 */
@Service
public class ShortlistService {

    private static final Logger log = LoggerFactory.getLogger(ShortlistService.class);

    private final ApplicationRepository     applicationRepository;
    private final CandidateNotificationPort candidateNotificationPort;

    public ShortlistService(ApplicationRepository applicationRepository,
                             CandidateNotificationPort candidateNotificationPort) {
        this.applicationRepository     = applicationRepository;
        this.candidateNotificationPort = candidateNotificationPort;
    }

    @Transactional
    public ShortlistResponse shortlist(ShortlistRequest request) {
        int shortlisted = 0;
        int skipped     = 0;

        for (Long id : request.applicationIds()) {
            Application application = applicationRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + id));

            if (application.getStatus() != ApplicationStatus.EXAM_COMPLETED) {
                skipped++;
                continue;
            }

            application.shortlist();
            applicationRepository.save(application);

            candidateNotificationPort.notifyShortlisted(
                    application.getCandidate().getEmail(),
                    application.getCandidate().getFullName(),
                    application.getJob().getTitle());

            log.info("Application shortlisted id={}", id);
            shortlisted++;
        }

        return new ShortlistResponse(shortlisted, skipped);
    }
}
