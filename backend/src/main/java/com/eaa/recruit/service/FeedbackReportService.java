package com.eaa.recruit.service;

import com.eaa.recruit.dto.application.FeedbackReportResponse;
import com.eaa.recruit.entity.Application;
import com.eaa.recruit.exception.BusinessException;
import com.eaa.recruit.exception.ResourceNotFoundException;
import com.eaa.recruit.repository.ApplicationRepository;
import com.eaa.recruit.security.AuthenticatedUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * FR-34: Aggregates stored application data into a feedback report.
 * Candidates see their own applications; recruiters see any application for their jobs.
 */
@Service
public class FeedbackReportService {

    private final ApplicationRepository applicationRepository;

    public FeedbackReportService(ApplicationRepository applicationRepository) {
        this.applicationRepository = applicationRepository;
    }

    @Transactional(readOnly = true)
    public FeedbackReportResponse getFeedback(Long applicationId, AuthenticatedUser principal) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        String role = principal.role();

        if ("CANDIDATE".equals(role)) {
            if (!application.getCandidate().getId().equals(principal.id())) {
                throw new BusinessException("You can only view feedback for your own applications");
            }
        } else if ("RECRUITER".equals(role)) {
            if (!application.getJob().getCreatedBy().getId().equals(principal.id())) {
                throw new BusinessException("You can only view feedback for applications on your jobs");
            }
        }

        // AC: 404 if no final decision yet
        if (!application.hasFinalDecision()) {
            throw new ResourceNotFoundException("Feedback report not available — no final decision recorded yet");
        }

        return new FeedbackReportResponse(
                application.getId(),
                application.getJob().getTitle(),
                application.getStatus(),
                application.getCvRelevanceScore(),
                application.getExamScore(),
                application.getHardFilterPassed(),
                application.getFinalScore(),
                application.getXaiReportUrl(),
                // Candidates see decision notes (it's their own feedback); recruiters see all
                application.getDecisionNotes());
    }
}
