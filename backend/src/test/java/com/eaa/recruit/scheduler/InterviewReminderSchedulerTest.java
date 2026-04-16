package com.eaa.recruit.scheduler;

import com.eaa.recruit.entity.*;
import com.eaa.recruit.notification.CandidateNotificationPort;
import com.eaa.recruit.repository.ApplicationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InterviewReminderSchedulerTest {

    @Mock ApplicationRepository     applicationRepository;
    @Mock CandidateNotificationPort candidateNotificationPort;

    InterviewReminderScheduler scheduler;

    @BeforeEach
    void setUp() {
        scheduler = new InterviewReminderScheduler(applicationRepository, candidateNotificationPort);
    }

    @Test
    void sendReminders_notifiesAndMarksSent() {
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

        AvailabilitySlot slot = AvailabilitySlot.create(recruiter,
                LocalDate.now().plusDays(1), LocalTime.of(9, 0), LocalTime.of(10, 0));
        app.bookInterviewSlot(slot);

        when(applicationRepository.findScheduledForDateWithoutReminder(any()))
                .thenReturn(List.of(app));
        when(applicationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        scheduler.sendReminders();

        verify(candidateNotificationPort).notifyInterviewReminder(any(), any(), any(), any(), any());
        verify(applicationRepository).save(app);
    }

    @Test
    void sendReminders_doesNothingWhenNoUpcoming() {
        when(applicationRepository.findScheduledForDateWithoutReminder(any()))
                .thenReturn(List.of());

        scheduler.sendReminders();

        verifyNoInteractions(candidateNotificationPort);
    }
}
