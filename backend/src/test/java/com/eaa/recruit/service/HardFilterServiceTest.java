package com.eaa.recruit.service;

import com.eaa.recruit.entity.*;
import com.eaa.recruit.notification.CandidateNotificationPort;
import com.eaa.recruit.repository.ApplicationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HardFilterServiceTest {

    @Mock ApplicationRepository       applicationRepository;
    @Mock CandidateNotificationPort   candidateNotificationPort;
    @Mock AuditLogService             auditLogService;

    HardFilterService service;

    @BeforeEach
    void setUp() {
        service = new HardFilterService(applicationRepository, candidateNotificationPort, auditLogService);
    }

    private static User candidateWithProfile(Integer heightCm, Integer weightKg, String degree) {
        User u = User.create("c@eaa.com", "hash", Role.CANDIDATE, "Bob");
        setField(u, "heightCm", heightCm);
        setField(u, "weightKg", weightKg);
        setField(u, "degree",   degree);
        return u;
    }

    private static JobPosting job() {
        User recruiter = User.create("r@eaa.com", "hash", Role.RECRUITER, "Alice");
        return JobPosting.create("Pilot", "desc", 170, 60, "BSc Aviation",
                LocalDate.now().plusDays(1), LocalDate.now().plusDays(30),
                LocalDate.now().plusDays(37), recruiter);
    }

    private static Application applicationFor(User candidate, JobPosting job) {
        return Application.create(candidate, job, "cv.pdf");
    }

    @Test
    void applyHardFilter_passesWhenAllCriteriaMet() {
        User candidate = candidateWithProfile(175, 70, "BSc Aviation");
        Application application = applicationFor(candidate, job());
        application.applyAiScore(0.8, "http://report");

        service.applyHardFilter(application);

        assertThat(application.getHardFilterPassed()).isTrue();
        assertThat(application.getStatus()).isEqualTo(ApplicationStatus.AI_SCREENING);
        verifyNoInteractions(candidateNotificationPort);
    }

    @Test
    void applyHardFilter_failsWhenHeightBelowMinimum() {
        User candidate = candidateWithProfile(160, 70, "BSc Aviation");
        Application application = applicationFor(candidate, job());
        application.applyAiScore(0.8, "http://report");

        service.applyHardFilter(application);

        assertThat(application.getHardFilterPassed()).isFalse();
        assertThat(application.getStatus()).isEqualTo(ApplicationStatus.HARD_FILTER_FAILED);
        verify(candidateNotificationPort).notifyHardFilterFailed(any(), any(), any());
    }

    @Test
    void applyHardFilter_failsWhenNullProfileFields() {
        User candidate = candidateWithProfile(null, null, null);
        Application application = applicationFor(candidate, job());
        application.applyAiScore(0.9, "http://report");

        service.applyHardFilter(application);

        assertThat(application.getHardFilterPassed()).isFalse();
        assertThat(application.getStatus()).isEqualTo(ApplicationStatus.HARD_FILTER_FAILED);
        verify(candidateNotificationPort).notifyHardFilterFailed(any(), any(), any());
    }

    @Test
    void applyHardFilter_failsWhenDegreeMismatch() {
        User candidate = candidateWithProfile(180, 75, "BA English");
        Application application = applicationFor(candidate, job());
        application.applyAiScore(0.8, "http://report");

        service.applyHardFilter(application);

        assertThat(application.getHardFilterPassed()).isFalse();
        assertThat(application.getStatus()).isEqualTo(ApplicationStatus.HARD_FILTER_FAILED);
    }

    private static void setField(Object target, String fieldName, Object value) {
        try {
            Field field = target.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(target, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
