package com.eaa.recruit.service;

import com.eaa.recruit.dto.application.ShortlistRequest;
import com.eaa.recruit.dto.application.ShortlistResponse;
import com.eaa.recruit.entity.*;
import com.eaa.recruit.exception.ResourceNotFoundException;
import com.eaa.recruit.notification.CandidateNotificationPort;
import com.eaa.recruit.repository.ApplicationRepository;
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
class ShortlistServiceTest {

    @Mock ApplicationRepository     applicationRepository;
    @Mock CandidateNotificationPort candidateNotificationPort;

    ShortlistService service;

    @BeforeEach
    void setUp() {
        service = new ShortlistService(applicationRepository, candidateNotificationPort);
    }

    private Application makeExamCompletedApp(Long fakeId) {
        User recruiter  = User.create("r@eaa.com", "hash", Role.RECRUITER, "Alice");
        JobPosting job  = JobPosting.create("Pilot", "desc", 170, 60, "BSc",
                LocalDate.now(), LocalDate.now().plusDays(30), LocalDate.now().plusDays(37), recruiter);
        User candidate  = User.create("c@eaa.com", "hash", Role.CANDIDATE, "Bob");
        Application app = Application.create(candidate, job, "cv.pdf");
        app.applyAiScore(0.8, "url");
        app.markHardFilterPassed();
        app.authorizeExam("token");
        app.recordExamScore(80.0, 72.0);
        return app;
    }

    @Test
    void shortlist_shortlistsEligibleApplications() {
        Application app = makeExamCompletedApp(1L);
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(app));
        when(applicationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ShortlistResponse response = service.shortlist(new ShortlistRequest(List.of(1L)));

        assertThat(response.shortlisted()).isEqualTo(1);
        assertThat(response.skipped()).isEqualTo(0);
        assertThat(app.getStatus()).isEqualTo(ApplicationStatus.SHORTLISTED);
        verify(candidateNotificationPort).notifyShortlisted(any(), any(), any());
    }

    @Test
    void shortlist_skipsNonExamCompletedApplications() {
        User recruiter  = User.create("r@eaa.com", "hash", Role.RECRUITER, "Alice");
        JobPosting job  = JobPosting.create("Pilot", "desc", 170, 60, "BSc",
                LocalDate.now(), LocalDate.now().plusDays(30), LocalDate.now().plusDays(37), recruiter);
        User candidate  = User.create("c@eaa.com", "hash", Role.CANDIDATE, "Bob");
        Application app = Application.create(candidate, job, "cv.pdf"); // SUBMITTED status

        when(applicationRepository.findById(1L)).thenReturn(Optional.of(app));

        ShortlistResponse response = service.shortlist(new ShortlistRequest(List.of(1L)));

        assertThat(response.shortlisted()).isEqualTo(0);
        assertThat(response.skipped()).isEqualTo(1);
        verifyNoInteractions(candidateNotificationPort);
    }

    @Test
    void shortlist_throwsResourceNotFoundException_whenNotFound() {
        when(applicationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.shortlist(new ShortlistRequest(List.of(99L))))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
