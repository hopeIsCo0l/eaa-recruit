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
import com.eaa.recruit.messaging.KafkaEventPublisher;
import com.eaa.recruit.notification.CandidateNotificationPort;
import com.eaa.recruit.repository.ApplicationRepository;
import com.eaa.recruit.repository.ExamRepository;
import com.eaa.recruit.repository.JobPostingRepository;
import com.eaa.recruit.security.AuthenticatedUser;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExamServiceTest {

    @Mock ExamRepository            examRepository;
    @Mock JobPostingRepository      jobPostingRepository;
    @Mock ApplicationRepository     applicationRepository;
    @Mock CandidateNotificationPort candidateNotificationPort;
    @Mock KafkaEventPublisher       kafkaEventPublisher;

    ExamService service;

    private static final AuthenticatedUser RECRUITER =
            new AuthenticatedUser(42L, "r@eaa.com", "RECRUITER");

    @BeforeEach
    void setUp() {
        service = new ExamService(examRepository, jobPostingRepository, applicationRepository,
                candidateNotificationPort, kafkaEventPublisher, new ObjectMapper());
    }

    private static JobPosting job(User recruiter) {
        return JobPosting.create("Pilot", "desc", 170, 60, "BSc",
                LocalDate.now().plusDays(1), LocalDate.now().plusDays(30),
                LocalDate.now().plusDays(37), recruiter);
    }

    private static CreateExamRequest validRequest() {
        return new CreateExamRequest("Pilot Exam", 60, List.of(
                new QuestionRequest(QuestionType.MCQ, "What is ICAO?",
                        List.of("A", "B", "C", "D"), 0, 5)
        ));
    }

    @Test
    void createExam_savesExamWithQuestions() {
        User recruiter = User.create("r@eaa.com", "hash", Role.RECRUITER, "Alice");
        JobPosting job = job(recruiter);

        when(jobPostingRepository.findByIdAndCreatedById(1L, 42L)).thenReturn(Optional.of(job));
        when(examRepository.existsByJobId(1L)).thenReturn(false);
        when(examRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CreateExamResponse response = service.createExam(1L, validRequest(), RECRUITER);

        assertThat(response.title()).isEqualTo("Pilot Exam");
        assertThat(response.durationMinutes()).isEqualTo(60);
        assertThat(response.questionCount()).isEqualTo(1);
        verify(examRepository).save(any(Exam.class));
    }

    @Test
    void createExam_throwsConflict_whenExamExists() {
        User recruiter = User.create("r@eaa.com", "hash", Role.RECRUITER, "Alice");
        when(jobPostingRepository.findByIdAndCreatedById(1L, 42L)).thenReturn(Optional.of(job(recruiter)));
        when(examRepository.existsByJobId(1L)).thenReturn(true);

        assertThatThrownBy(() -> service.createExam(1L, validRequest(), RECRUITER))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void createExam_throwsBusinessException_whenMcqMissingOptions() {
        User recruiter = User.create("r@eaa.com", "hash", Role.RECRUITER, "Alice");
        when(jobPostingRepository.findByIdAndCreatedById(1L, 42L)).thenReturn(Optional.of(job(recruiter)));
        when(examRepository.existsByJobId(1L)).thenReturn(false);

        CreateExamRequest badRequest = new CreateExamRequest("Exam", 60, List.of(
                new QuestionRequest(QuestionType.MCQ, "Question?", null, null, 5)
        ));

        assertThatThrownBy(() -> service.createExam(1L, badRequest, RECRUITER))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("options");
    }

    @Test
    void authorizeExamBatch_skipsNonExistentApplications() {
        User recruiter = User.create("r@eaa.com", "hash", Role.RECRUITER, "Alice");
        JobPosting job = job(recruiter);
        Exam exam = Exam.create(job, "Pilot Exam", 60);

        when(jobPostingRepository.findByIdAndCreatedById(1L, 42L)).thenReturn(Optional.of(job));
        when(examRepository.findByJobId(1L)).thenReturn(Optional.of(exam));
        when(applicationRepository.findById(99L)).thenReturn(Optional.empty());

        BatchAuthorizeResponse response = service.authorizeExamBatch(
                1L, new BatchAuthorizeRequest(List.of(99L)), RECRUITER);

        assertThat(response.authorizedCount()).isZero();
        assertThat(response.skipped()).hasSize(1);
        assertThat(response.skipped().get(0).reason()).contains("not found");
    }

    @Test
    void createExam_throwsResourceNotFoundException_whenJobNotOwned() {
        when(jobPostingRepository.findByIdAndCreatedById(1L, 42L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.createExam(1L, validRequest(), RECRUITER))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
