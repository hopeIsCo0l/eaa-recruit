package com.eaa.recruit.service;

import com.eaa.recruit.dto.application.DecisionRequest;
import com.eaa.recruit.dto.application.DecisionResponse;
import com.eaa.recruit.entity.*;
import com.eaa.recruit.exception.BusinessException;
import com.eaa.recruit.exception.ResourceNotFoundException;
import com.eaa.recruit.notification.CandidateNotificationPort;
import com.eaa.recruit.repository.ApplicationRepository;
import com.eaa.recruit.repository.UserRepository;
import com.eaa.recruit.security.AuthenticatedUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FinalDecisionServiceTest {

    @Mock ApplicationRepository     applicationRepository;
    @Mock UserRepository            userRepository;
    @Mock CandidateNotificationPort candidateNotificationPort;
    @Mock AuditLogService           auditLogService;

    FinalDecisionService service;

    private static final AuthenticatedUser RECRUITER =
            new AuthenticatedUser(20L, "r@eaa.com", "RECRUITER");

    @BeforeEach
    void setUp() {
        service = new FinalDecisionService(applicationRepository, userRepository,
                candidateNotificationPort, auditLogService);
    }

    private Application makeShortlistedApp() {
        User recruiter  = User.create("r@eaa.com", "hash", Role.RECRUITER, "Alice");
        JobPosting job  = JobPosting.create("Pilot", "desc", 170, 60, "BSc",
                LocalDate.now(), LocalDate.now().plusDays(30), LocalDate.now().plusDays(37), recruiter);
        User candidate  = User.create("c@eaa.com", "hash", Role.CANDIDATE, "Bob");
        Application app = Application.create(candidate, job, "cv.pdf");
        app.applyAiScore(0.8, "url");
        app.markHardFilterPassed();
        app.authorizeExam("token");
        app.recordExamScore(80.0, 72.0);
        app.shortlist();
        return app;
    }

    @Test
    void recordDecision_selected_updatesStatusAndNotifies() {
        Application app = makeShortlistedApp();
        User recruiter  = User.create("r@eaa.com", "hash", Role.RECRUITER, "Alice");

        when(applicationRepository.findById(1L)).thenReturn(Optional.of(app));
        when(userRepository.findById(20L)).thenReturn(Optional.of(recruiter));
        when(applicationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        DecisionResponse response = service.recordDecision(1L,
                new DecisionRequest(ApplicationStatus.SELECTED, "Great candidate"), RECRUITER);

        assertThat(response.status()).isEqualTo(ApplicationStatus.SELECTED);
        assertThat(app.getDecisionNotes()).isEqualTo("Great candidate");
        verify(candidateNotificationPort).notifyDecision(any(), any(), any(), eq("SELECTED"), any());
        verify(auditLogService).log(any(), eq(1L), any(), eq("SELECTED"), any(), any());
    }

    @Test
    void recordDecision_throwsBusinessException_onInvalidDecisionStatus() {
        // SHORTLISTED is not a valid final decision — validation happens before repo lookup
        assertThatThrownBy(() -> service.recordDecision(1L,
                new DecisionRequest(ApplicationStatus.SHORTLISTED, null), RECRUITER))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void recordDecision_throwsResourceNotFoundException_whenNotFound() {
        when(applicationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.recordDecision(99L,
                new DecisionRequest(ApplicationStatus.SELECTED, null), RECRUITER))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
