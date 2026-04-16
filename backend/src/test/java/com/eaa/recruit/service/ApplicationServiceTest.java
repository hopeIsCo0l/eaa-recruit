package com.eaa.recruit.service;

import com.eaa.recruit.dto.application.SubmitApplicationResponse;
import com.eaa.recruit.dto.internal.ExamScoreCallbackRequest;
import com.eaa.recruit.entity.*;
import com.eaa.recruit.exception.BusinessException;
import com.eaa.recruit.exception.ConflictException;
import com.eaa.recruit.exception.ResourceNotFoundException;
import com.eaa.recruit.messaging.KafkaEventPublisher;
import com.eaa.recruit.repository.ApplicationRepository;
import com.eaa.recruit.repository.JobPostingRepository;
import com.eaa.recruit.repository.UserRepository;
import com.eaa.recruit.security.AuthenticatedUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock ApplicationRepository    applicationRepository;
    @Mock JobPostingRepository     jobPostingRepository;
    @Mock UserRepository           userRepository;
    @Mock FileStorageService       fileStorageService;
    @Mock KafkaEventPublisher      kafkaEventPublisher;
    @Mock HardFilterService        hardFilterService;
    @Mock WeightedScoringService   weightedScoringService;

    ApplicationService service;

    private static final AuthenticatedUser CANDIDATE =
            new AuthenticatedUser(10L, "candidate@eaa.com", "CANDIDATE");

    @BeforeEach
    void setUp() {
        service = new ApplicationService(applicationRepository, jobPostingRepository,
                userRepository, fileStorageService, kafkaEventPublisher,
                hardFilterService, weightedScoringService);
    }

    private static User candidateUser() {
        return User.create("candidate@eaa.com", "hash", Role.CANDIDATE, "Bob");
    }

    private static JobPosting openJob(User recruiter) {
        JobPosting job = JobPosting.create("Pilot", "desc", 170, 60, "BSc",
                LocalDate.now().plusDays(1),
                LocalDate.now().plusDays(30),
                LocalDate.now().plusDays(37),
                recruiter);
        job.publish();
        return job;
    }

    private static MockMultipartFile validCv() {
        return new MockMultipartFile("cv", "cv.pdf", "application/pdf", new byte[100]);
    }

    @Test
    void submitApplication_createsApplicationAndPublishesEvent() {
        User recruiter = User.create("r@eaa.com", "hash", Role.RECRUITER, "Alice");
        JobPosting job = openJob(recruiter);
        User candidate = candidateUser();

        when(jobPostingRepository.findById(1L)).thenReturn(Optional.of(job));
        when(applicationRepository.existsByCandidateIdAndJobId(10L, 1L)).thenReturn(false);
        when(fileStorageService.storeCv(any())).thenReturn("uuid.pdf");
        when(userRepository.findById(10L)).thenReturn(Optional.of(candidate));
        when(applicationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        SubmitApplicationResponse resp = service.submitApplication(1L, validCv(), CANDIDATE);

        assertThat(resp.jobId()).isEqualTo(1L);
        assertThat(resp.status()).isEqualTo(ApplicationStatus.SUBMITTED);
        verify(kafkaEventPublisher).publishCvUploaded(any());
    }

    @Test
    void submitApplication_throwsBusinessException_whenJobNotOpen() {
        User recruiter = User.create("r@eaa.com", "hash", Role.RECRUITER, "Alice");
        JobPosting draft = JobPosting.create("Pilot", "desc", 170, 60, "BSc",
                LocalDate.now().plusDays(1), LocalDate.now().plusDays(30),
                LocalDate.now().plusDays(37), recruiter);
        // status is DRAFT, not OPEN

        when(jobPostingRepository.findById(1L)).thenReturn(Optional.of(draft));

        assertThatThrownBy(() -> service.submitApplication(1L, validCv(), CANDIDATE))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("OPEN");

        verifyNoInteractions(applicationRepository);
    }

    @Test
    void submitApplication_throwsConflictException_onDuplicateApplication() {
        User recruiter = User.create("r@eaa.com", "hash", Role.RECRUITER, "Alice");
        JobPosting job = openJob(recruiter);

        when(jobPostingRepository.findById(1L)).thenReturn(Optional.of(job));
        when(applicationRepository.existsByCandidateIdAndJobId(10L, 1L)).thenReturn(true);

        assertThatThrownBy(() -> service.submitApplication(1L, validCv(), CANDIDATE))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void submitApplication_throwsResourceNotFoundException_whenJobMissing() {
        when(jobPostingRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.submitApplication(99L, validCv(), CANDIDATE))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // FR-27
    @Test
    void applyExamScore_recordsScoreAndComputesFinalScore() {
        User recruiter  = User.create("r@eaa.com", "hash", Role.RECRUITER, "Alice");
        JobPosting job  = openJob(recruiter);
        User candidate  = candidateUser();
        Application app = Application.create(candidate, job, "cv.pdf");
        app.applyAiScore(0.8, "http://report");
        app.markHardFilterPassed();
        app.authorizeExam("token");

        when(applicationRepository.findById(5L)).thenReturn(Optional.of(app));
        when(weightedScoringService.compute(app)).thenReturn(72.0);
        when(applicationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.applyExamScore(5L, new ExamScoreCallbackRequest(80.0));

        assertThat(app.getStatus()).isEqualTo(ApplicationStatus.EXAM_COMPLETED);
        assertThat(app.getExamScore()).isEqualTo(80.0);
    }

    @Test
    void applyExamScore_throwsBusinessException_whenNotExamAuthorized() {
        User recruiter  = User.create("r@eaa.com", "hash", Role.RECRUITER, "Alice");
        JobPosting job  = openJob(recruiter);
        User candidate  = candidateUser();
        Application app = Application.create(candidate, job, "cv.pdf");
        // status is SUBMITTED, not EXAM_AUTHORIZED

        when(applicationRepository.findById(5L)).thenReturn(Optional.of(app));

        assertThatThrownBy(() -> service.applyExamScore(5L, new ExamScoreCallbackRequest(80.0)))
                .isInstanceOf(BusinessException.class);
    }
}
