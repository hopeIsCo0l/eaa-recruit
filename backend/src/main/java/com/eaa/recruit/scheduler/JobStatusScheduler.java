package com.eaa.recruit.scheduler;

import com.eaa.recruit.entity.JobPosting;
import com.eaa.recruit.entity.JobPostingStatus;
import com.eaa.recruit.repository.JobPostingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * FR-15: Auto-closes OPEN job postings whose application deadline has passed.
 * Runs on a configurable cron expression (default: every minute).
 * Idempotent — re-running never produces duplicate transitions.
 */
@Component
public class JobStatusScheduler {

    private static final Logger log = LoggerFactory.getLogger(JobStatusScheduler.class);

    private final JobPostingRepository jobPostingRepository;

    public JobStatusScheduler(JobPostingRepository jobPostingRepository) {
        this.jobPostingRepository = jobPostingRepository;
    }

    @Scheduled(cron = "${scheduler.job-status.cron:0 * * * * *}")
    @Transactional
    public void closeExpiredJobs() {
        LocalDate today = LocalDate.now();
        List<JobPosting> expired = jobPostingRepository
                .findOverdueByStatus(JobPostingStatus.OPEN, today);

        if (expired.isEmpty()) return;

        for (JobPosting job : expired) {
            job.close();
            log.info("Job auto-closed id={} title='{}' closeDate={}", job.getId(), job.getTitle(), job.getCloseDate());
        }

        jobPostingRepository.saveAll(expired);
        log.info("Scheduler closed {} expired job(s)", expired.size());
    }
}
