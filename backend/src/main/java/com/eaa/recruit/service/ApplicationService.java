package com.eaa.recruit.service;

import com.eaa.recruit.dto.application.AiScoreCallbackRequest;
import com.eaa.recruit.dto.application.SubmitApplicationResponse;
import com.eaa.recruit.dto.internal.ExamScoreCallbackRequest;
import com.eaa.recruit.entity.Application;
import com.eaa.recruit.entity.ApplicationStatus;
import com.eaa.recruit.entity.JobPosting;
import com.eaa.recruit.entity.JobPostingStatus;
import com.eaa.recruit.entity.User;
import com.eaa.recruit.exception.BusinessException;
import com.eaa.recruit.exception.ConflictException;
import com.eaa.recruit.exception.ResourceNotFoundException;
import com.eaa.recruit.messaging.KafkaEventPublisher;
import com.eaa.recruit.messaging.event.CvUploadedEvent;
import com.eaa.recruit.repository.ApplicationRepository;
import com.eaa.recruit.repository.JobPostingRepository;
import com.eaa.recruit.repository.UserRepository;
import com.eaa.recruit.security.AuthenticatedUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ApplicationService {

    private static final Logger log = LoggerFactory.getLogger(ApplicationService.class);

    private final ApplicationRepository  applicationRepository;
    private final JobPostingRepository   jobPostingRepository;
    private final UserRepository         userRepository;
    private final FileStorageService     fileStorageService;
    private final KafkaEventPublisher    kafkaEventPublisher;
    private final HardFilterService      hardFilterService;
    private final WeightedScoringService weightedScoringService;

    public ApplicationService(ApplicationRepository applicationRepository,
                               JobPostingRepository jobPostingRepository,
                               UserRepository userRepository,
                               FileStorageService fileStorageService,
                               KafkaEventPublisher kafkaEventPublisher,
                               HardFilterService hardFilterService,
                               WeightedScoringService weightedScoringService) {
        this.applicationRepository = applicationRepository;
        this.jobPostingRepository  = jobPostingRepository;
        this.userRepository        = userRepository;
        this.fileStorageService    = fileStorageService;
        this.kafkaEventPublisher   = kafkaEventPublisher;
        this.hardFilterService     = hardFilterService;
        this.weightedScoringService = weightedScoringService;
    }

    /** FR-19: Submit application with CV upload. */
    @Transactional
    public SubmitApplicationResponse submitApplication(Long jobId,
                                                       MultipartFile cvFile,
                                                       AuthenticatedUser principal) {
        JobPosting job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (job.getStatus() != JobPostingStatus.OPEN) {
            throw new BusinessException("Applications are only accepted for OPEN jobs");
        }

        if (applicationRepository.existsByCandidateIdAndJobId(principal.id(), jobId)) {
            throw new ConflictException("You have already applied for this job");
        }

        String cvPath = fileStorageService.storeCv(cvFile);

        User candidate = userRepository.findById(principal.id())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found"));

        Application application = Application.create(candidate, job, cvPath);
        application = applicationRepository.save(application);

        log.info("Application created id={} candidateId={} jobId={}", application.getId(), principal.id(), jobId);

        // FR-20: publish CV_UPLOADED event (fire-and-forget — failure does not roll back)
        try {
            kafkaEventPublisher.publishCvUploaded(
                    CvUploadedEvent.of(application.getId(), principal.id(), jobId, cvPath));
        } catch (Exception e) {
            log.error("Failed to publish CV_UPLOADED event for applicationId={}: {}",
                    application.getId(), e.getMessage(), e);
        }

        return new SubmitApplicationResponse(
                application.getId(),
                jobId,
                application.getStatus(),
                application.getSubmittedAt()
        );
    }

    /** FR-21: Receive AI score callback and trigger hard filter. */
    @Transactional
    public void applyAiScore(Long applicationId, AiScoreCallbackRequest request) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        application.applyAiScore(request.cvRelevanceScore(), request.xaiReportUrl());
        applicationRepository.save(application);

        log.info("AI score applied applicationId={} score={}", applicationId, request.cvRelevanceScore());

        // FR-22: immediately run hard filter after AI score is recorded
        hardFilterService.applyHardFilter(application);
    }

    /** FR-27: Receive exam score from Go engine, recompute weighted final score. */
    @Transactional
    public void applyExamScore(Long applicationId, ExamScoreCallbackRequest request) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        // Idempotency — duplicate callback for an already-completed exam is a no-op
        if (application.getStatus() == ApplicationStatus.EXAM_COMPLETED) {
            log.info("Exam score already applied applicationId={} — ignoring duplicate callback", applicationId);
            return;
        }

        if (application.getStatus() != ApplicationStatus.EXAM_AUTHORIZED) {
            throw new BusinessException("Exam score can only be applied to EXAM_AUTHORIZED applications");
        }

        double finalScore = weightedScoringService.compute(application);
        application.recordExamScore(request.examScore(), finalScore, request.completedAt());
        applicationRepository.save(application);

        log.info("Exam score applied applicationId={} examScore={} finalScore={} completedAt={}",
                applicationId, request.examScore(), finalScore, request.completedAt());
    }
}
