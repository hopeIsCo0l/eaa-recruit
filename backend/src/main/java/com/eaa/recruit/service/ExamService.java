package com.eaa.recruit.service;

import com.eaa.recruit.dto.application.BatchAuthorizeRequest;
import com.eaa.recruit.dto.application.BatchAuthorizeResponse;
import com.eaa.recruit.dto.exam.CreateExamRequest;
import com.eaa.recruit.dto.exam.CreateExamResponse;
import com.eaa.recruit.dto.exam.QuestionRequest;
import com.eaa.recruit.entity.*;
import com.eaa.recruit.exception.BusinessException;
import com.eaa.recruit.exception.ConflictException;
import com.eaa.recruit.exception.ResourceNotFoundException;
import com.eaa.recruit.messaging.EventPublisher;
import com.eaa.recruit.messaging.event.ExamBatchReadyEvent;
import com.eaa.recruit.notification.CandidateNotificationPort;
import com.eaa.recruit.repository.ApplicationRepository;
import com.eaa.recruit.repository.ExamRepository;
import com.eaa.recruit.repository.JobPostingRepository;
import com.eaa.recruit.security.AuthenticatedUser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ExamService {

    private static final Logger log = LoggerFactory.getLogger(ExamService.class);

    private final ExamRepository            examRepository;
    private final JobPostingRepository      jobPostingRepository;
    private final ApplicationRepository     applicationRepository;
    private final CandidateNotificationPort candidateNotificationPort;
    private final EventPublisher            eventPublisher;
    private final ObjectMapper              objectMapper;

    public ExamService(ExamRepository examRepository,
                       JobPostingRepository jobPostingRepository,
                       ApplicationRepository applicationRepository,
                       CandidateNotificationPort candidateNotificationPort,
                       EventPublisher eventPublisher,
                       ObjectMapper objectMapper) {
        this.examRepository            = examRepository;
        this.jobPostingRepository      = jobPostingRepository;
        this.applicationRepository     = applicationRepository;
        this.candidateNotificationPort = candidateNotificationPort;
        this.eventPublisher            = eventPublisher;
        this.objectMapper              = objectMapper;
    }

    /** FR-24: Create exam definition for a job posting. */
    @Transactional
    public CreateExamResponse createExam(Long jobId,
                                          CreateExamRequest request,
                                          AuthenticatedUser principal) {
        JobPosting job = jobPostingRepository.findByIdAndCreatedById(jobId, principal.id())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Job not found or does not belong to you: " + jobId));

        if (examRepository.existsByJobId(jobId)) {
            throw new ConflictException("An exam already exists for job: " + jobId);
        }

        Exam exam = Exam.create(job, request.title(), request.durationMinutes());

        int order = 1;
        for (QuestionRequest qr : request.questions()) {
            validateQuestionRequest(qr);
            String optionsJson = serializeOptions(qr);
            Question question = Question.create(
                    exam, qr.type(), qr.questionText(),
                    optionsJson, qr.correctAnswer(),
                    qr.marks(), order++);
            exam.addQuestion(question);
        }

        exam = examRepository.save(exam);
        log.info("Exam created id={} jobId={} questions={}", exam.getId(), jobId, exam.getQuestions().size());

        return new CreateExamResponse(
                exam.getId(),
                jobId,
                exam.getTitle(),
                exam.getDurationMinutes(),
                exam.getQuestions().size()
        );
    }

    /** FR-25: Authorize a batch of candidates for the exam. */
    @Transactional
    public BatchAuthorizeResponse authorizeExamBatch(Long jobId,
                                                      BatchAuthorizeRequest request,
                                                      AuthenticatedUser principal) {
        jobPostingRepository.findByIdAndCreatedById(jobId, principal.id())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Job not found or does not belong to you: " + jobId));

        Exam exam = examRepository.findByJobId(jobId)
                .orElseThrow(() -> new BusinessException("No exam defined for job: " + jobId));

        List<Long>                           authorizedIds = new ArrayList<>();
        List<BatchAuthorizeResponse.SkippedEntry> skipped  = new ArrayList<>();

        for (Long appId : request.applicationIds()) {
            Application application = applicationRepository.findById(appId).orElse(null);

            if (application == null) {
                skipped.add(new BatchAuthorizeResponse.SkippedEntry(appId, "Application not found"));
                continue;
            }
            if (!application.getJob().getId().equals(jobId)) {
                skipped.add(new BatchAuthorizeResponse.SkippedEntry(appId, "Application does not belong to this job"));
                continue;
            }
            if (application.getStatus() != ApplicationStatus.AI_SCREENING) {
                skipped.add(new BatchAuthorizeResponse.SkippedEntry(appId,
                        "Status is " + application.getStatus() + " — expected AI_SCREENING"));
                continue;
            }

            String token = UUID.randomUUID().toString();
            application.authorizeExam(token);
            applicationRepository.save(application);

            User candidate = application.getCandidate();
            candidateNotificationPort.notifyExamAuthorized(
                    candidate.getEmail(), candidate.getFullName(),
                    application.getJob().getTitle(), token);

            authorizedIds.add(appId);
            log.info("Exam authorized applicationId={} candidateId={}", appId, candidate.getId());
        }

        if (!authorizedIds.isEmpty()) {
            publishExamBatchReady(exam, jobId, authorizedIds);
        }

        return new BatchAuthorizeResponse(authorizedIds.size(), authorizedIds, skipped);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void validateQuestionRequest(QuestionRequest qr) {
        if (qr.type() == QuestionType.MCQ) {
            if (qr.options() == null || qr.options().size() < 2) {
                throw new BusinessException("MCQ questions must have at least 2 options");
            }
            if (qr.correctAnswer() == null) {
                throw new BusinessException("MCQ questions must have a correctAnswer");
            }
            if (qr.correctAnswer() < 0 || qr.correctAnswer() >= qr.options().size()) {
                throw new BusinessException("correctAnswer index is out of range");
            }
        }
    }

    private String serializeOptions(QuestionRequest qr) {
        if (qr.options() == null || qr.options().isEmpty()) return null;
        try {
            return objectMapper.writeValueAsString(qr.options());
        } catch (JsonProcessingException e) {
            throw new BusinessException("Could not serialize question options");
        }
    }

    private void publishExamBatchReady(Exam exam, Long jobId, List<Long> applicationIds) {
        List<Long> candidateIds = applicationIds.stream()
                .map(appId -> applicationRepository.findById(appId)
                        .map(a -> a.getCandidate().getId())
                        .orElse(null))
                .filter(id -> id != null)
                .toList();

        // Use the job's exam date as the scheduled start time (FR-26)
        Instant scheduledAt = exam.getJob().getExamDate()
                .atStartOfDay(java.time.ZoneOffset.UTC)
                .toInstant();

        ExamBatchReadyEvent event = ExamBatchReadyEvent.of(
                exam.getId(), jobId, candidateIds,
                exam.getDurationMinutes(), scheduledAt);

        eventPublisher.publishExamBatchReady(event);
    }
}
