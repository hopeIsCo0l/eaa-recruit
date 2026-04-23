package com.eaa.recruit.scheduler;

import com.eaa.recruit.entity.Application;
import com.eaa.recruit.notification.CandidateNotificationPort;
import com.eaa.recruit.repository.ApplicationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * FR-32: Send interview reminder N days before the scheduled slot.
 * Runs daily at 08:00 by default. Idempotent — reminderSent flag prevents duplicates.
 */
@Component
public class InterviewReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(InterviewReminderScheduler.class);

    @Value("${scheduler.interview-reminder.days-before:1}")
    private int daysBefore;

    private final ApplicationRepository     applicationRepository;
    private final CandidateNotificationPort candidateNotificationPort;

    public InterviewReminderScheduler(ApplicationRepository applicationRepository,
                                       CandidateNotificationPort candidateNotificationPort) {
        this.applicationRepository     = applicationRepository;
        this.candidateNotificationPort = candidateNotificationPort;
    }

    @Scheduled(cron = "${scheduler.interview-reminder.cron:0 0 8 * * *}")
    @Transactional
    public void sendReminders() {
        LocalDate targetDate = LocalDate.now().plusDays(daysBefore);

        List<Application> upcoming = applicationRepository
                .findScheduledForDateWithoutReminder(targetDate);

        if (upcoming.isEmpty()) return;

        for (Application application : upcoming) {
            try {
                String jobTitle    = application.getJob().getTitle();
                String slotDate    = application.getInterviewSlot().getSlotDate().toString();
                String startTime   = application.getInterviewSlot().getStartTime().toString();

                candidateNotificationPort.notifyInterviewReminder(
                        application.getCandidate().getEmail(),
                        application.getCandidate().getFullName(),
                        jobTitle, slotDate, startTime);

                candidateNotificationPort.notifyRecruiterInterviewReminder(
                        application.getJob().getCreatedBy().getEmail(),
                        application.getJob().getCreatedBy().getFullName(),
                        jobTitle,
                        application.getCandidate().getFullName(),
                        slotDate, startTime);

                application.markReminderSent();
                applicationRepository.save(application);

                log.info("Reminder sent applicationId={}", application.getId());
            } catch (Exception e) {
                log.error("Failed to send reminder for applicationId={}: {}",
                        application.getId(), e.getMessage(), e);
            }
        }

        log.info("Interview reminders sent for {} application(s)", upcoming.size());
    }
}
