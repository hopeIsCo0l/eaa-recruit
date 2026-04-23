package com.eaa.recruit.service;

import com.eaa.recruit.dto.application.FeedbackReportResponse;
import com.eaa.recruit.entity.*;
import com.eaa.recruit.exception.BusinessException;
import com.eaa.recruit.exception.ResourceNotFoundException;
import com.eaa.recruit.repository.ApplicationRepository;
import com.eaa.recruit.security.AuthenticatedUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FeedbackReportServiceTest {

    @Mock ApplicationRepository applicationRepository;

    FeedbackReportService service;

    @BeforeEach
    void setUp() {
        service = new FeedbackReportService(applicationRepository);
    }

    private User recruiter(Long id) {
        User r = User.create("r@eaa.com", "hash", Role.RECRUITER, "Alice");
        setId(r, id);
        return r;
    }

    private Application decidedApp(User rec) {
        User cand = User.create("c@eaa.com", "hash", Role.CANDIDATE, "Bob");
        setId(cand, 10L);
        JobPosting job = JobPosting.create("Pilot", "desc", 170, 60, "BSc",
                LocalDate.now().plusDays(1), LocalDate.now().plusDays(30),
                LocalDate.now().plusDays(37), rec);
        setId(job, 1L);
        Application app = Application.create(cand, job, "cv.pdf");
        app.applyAiScore(0.9, "http://xai");
        app.markHardFilterPassed();
        app.authorizeExam("tok");
        app.recordExamScore(80.0, 85.0, Instant.now());
        app.shortlist();
        app.recordDecision(ApplicationStatus.SELECTED, "Great candidate", rec);
        setId(app, 5L);
        return app;
    }

    private static void setId(Object entity, Long id) {
        try {
            var f = BaseEntity.class.getDeclaredField("id");
            f.setAccessible(true);
            f.set(entity, id);
        } catch (ReflectiveOperationException e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void getFeedback_candidateSeesOwnApplication() {
        User rec = recruiter(7L);
        Application app = decidedApp(rec);
        AuthenticatedUser candidate = new AuthenticatedUser(10L, "c@eaa.com", "CANDIDATE");

        when(applicationRepository.findById(5L)).thenReturn(Optional.of(app));

        FeedbackReportResponse resp = service.getFeedback(5L, candidate);

        assertThat(resp.applicationId()).isEqualTo(5L);
        assertThat(resp.status()).isEqualTo(ApplicationStatus.SELECTED);
        assertThat(resp.cvRelevanceScore()).isEqualTo(0.9);
        assertThat(resp.examScore()).isEqualTo(80.0);
        assertThat(resp.hardFilterPassed()).isTrue();
        assertThat(resp.decisionNotes()).isEqualTo("Great candidate");
    }

    @Test
    void getFeedback_recruiterSeesApplicationOnOwnJob() {
        User rec = recruiter(7L);
        Application app = decidedApp(rec);
        AuthenticatedUser recruiterPrincipal = new AuthenticatedUser(7L, "r@eaa.com", "RECRUITER");

        when(applicationRepository.findById(5L)).thenReturn(Optional.of(app));

        FeedbackReportResponse resp = service.getFeedback(5L, recruiterPrincipal);

        assertThat(resp.jobTitle()).isEqualTo("Pilot");
    }

    @Test
    void getFeedback_throws404_whenNoFinalDecision() {
        User rec = recruiter(7L);
        User cand = User.create("c@eaa.com", "hash", Role.CANDIDATE, "Bob");
        setId(cand, 10L);
        JobPosting job = JobPosting.create("Pilot", "desc", 170, 60, "BSc",
                LocalDate.now().plusDays(1), LocalDate.now().plusDays(30),
                LocalDate.now().plusDays(37), rec);
        Application app = Application.create(cand, job, "cv.pdf");
        setId(app, 5L);

        when(applicationRepository.findById(5L)).thenReturn(Optional.of(app));

        assertThatThrownBy(() -> service.getFeedback(5L, new AuthenticatedUser(10L, "c@eaa.com", "CANDIDATE")))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("no final decision");
    }

    @Test
    void getFeedback_throws400_whenCandidateAccessesOtherApplication() {
        User rec = recruiter(7L);
        Application app = decidedApp(rec);
        AuthenticatedUser other = new AuthenticatedUser(99L, "other@eaa.com", "CANDIDATE");

        when(applicationRepository.findById(5L)).thenReturn(Optional.of(app));

        assertThatThrownBy(() -> service.getFeedback(5L, other))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void getFeedback_throws400_whenRecruiterAccessesOtherJobApplication() {
        User rec = recruiter(7L);
        Application app = decidedApp(rec);
        AuthenticatedUser otherRecruiter = new AuthenticatedUser(99L, "other@eaa.com", "RECRUITER");

        when(applicationRepository.findById(5L)).thenReturn(Optional.of(app));

        assertThatThrownBy(() -> service.getFeedback(5L, otherRecruiter))
                .isInstanceOf(BusinessException.class);
    }
}
