package com.eaa.recruit.service;

import com.eaa.recruit.entity.JobPosting;
import com.eaa.recruit.entity.JobPostingStatus;
import com.eaa.recruit.entity.User;
import com.eaa.recruit.exception.BusinessException;
import com.eaa.recruit.exception.ResourceNotFoundException;
import com.eaa.recruit.repository.JobPostingRepository;
import com.eaa.recruit.repository.UserRepository;
import com.eaa.recruit.security.AuthenticatedUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

/**
 * FR-36: Archive closed/exam-scheduled jobs.
 */
@Service
public class ArchiveService {

    private static final Logger log = LoggerFactory.getLogger(ArchiveService.class);

    private static final Set<JobPostingStatus> ARCHIVABLE =
            Set.of(JobPostingStatus.CLOSED, JobPostingStatus.EXAM_SCHEDULED);

    private final JobPostingRepository jobPostingRepository;
    private final UserRepository       userRepository;
    private final AuditLogService      auditLogService;

    public ArchiveService(JobPostingRepository jobPostingRepository,
                           UserRepository userRepository,
                           AuditLogService auditLogService) {
        this.jobPostingRepository = jobPostingRepository;
        this.userRepository       = userRepository;
        this.auditLogService      = auditLogService;
    }

    @Transactional
    public void archive(Long jobId, AuthenticatedUser principal) {
        JobPosting job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));

        if (!ARCHIVABLE.contains(job.getStatus())) {
            throw new BusinessException("Only CLOSED or EXAM_SCHEDULED jobs can be archived");
        }

        User actor = userRepository.findById(principal.id())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String oldStatus = job.getStatus().name();
        job.archive();
        jobPostingRepository.save(job);

        auditLogService.log("JOB_POSTING", jobId, oldStatus,
                JobPostingStatus.ARCHIVED.name(), actor, null);

        log.info("Job archived id={} by={}", jobId, principal.id());
    }
}
