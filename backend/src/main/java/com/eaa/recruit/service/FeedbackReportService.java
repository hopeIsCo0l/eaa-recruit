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
 * FR-34: Candidate views their feedback report.
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

        if (!application.getCandidate().getId().equals(principal.id())) {
            throw new BusinessException("You can only view feedback for your own applications");
        }

        if (!application.hasFinalDecision()) {
            throw new BusinessException("Feedback not available until a final decision is made");
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
                application.getDecisionNotes());
    }
}
