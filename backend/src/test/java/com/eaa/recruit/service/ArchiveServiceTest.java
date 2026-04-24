package com.eaa.recruit.service;

import com.eaa.recruit.entity.*;
import com.eaa.recruit.exception.BusinessException;
import com.eaa.recruit.exception.ResourceNotFoundException;
import com.eaa.recruit.repository.JobPostingRepository;
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
class ArchiveServiceTest {

    @Mock JobPostingRepository jobPostingRepository;
    @Mock UserRepository       userRepository;
    @Mock AuditLogService      auditLogService;

    ArchiveService service;

    private static final AuthenticatedUser ADMIN =
            new AuthenticatedUser(1L, "admin@eaa.com", "ADMIN");

    @BeforeEach
    void setUp() {
        service = new ArchiveService(jobPostingRepository, userRepository, auditLogService);
    }

    private JobPosting jobWithStatus(JobPostingStatus status) {
        User creator = User.create("r@eaa.com", "hash", Role.RECRUITER, "Alice");
        JobPosting job = JobPosting.create("Pilot", "desc", 170, 60, "BSc",
                LocalDate.now(), LocalDate.now().plusDays(30), LocalDate.now().plusDays(37), creator);
        if (status == JobPostingStatus.OPEN)           job.publish();
        if (status == JobPostingStatus.CLOSED)         { job.publish(); job.close(); }
        if (status == JobPostingStatus.EXAM_SCHEDULED) { job.publish(); job.close(); job.scheduleExam(); }
        if (status == JobPostingStatus.ARCHIVED)       { job.publish(); job.close(); job.archive(); }
        return job;
    }

    @Test
    void archive_closedJob_setsStatusToArchived() {
        JobPosting job = jobWithStatus(JobPostingStatus.CLOSED);
        User admin = User.create("admin@eaa.com", "hash", Role.ADMIN, "Admin");

        when(jobPostingRepository.findById(1L)).thenReturn(Optional.of(job));
        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(jobPostingRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.archive(1L, ADMIN);

        assertThat(job.getStatus()).isEqualTo(JobPostingStatus.ARCHIVED);
        verify(auditLogService).log(eq("JOB_POSTING"), eq(1L),
                eq("CLOSED"), eq("ARCHIVED"), any(), isNull());
    }

    @Test
    void archive_examScheduledJob_setsStatusToArchived() {
        JobPosting job = jobWithStatus(JobPostingStatus.EXAM_SCHEDULED);
        User admin = User.create("admin@eaa.com", "hash", Role.ADMIN, "Admin");

        when(jobPostingRepository.findById(2L)).thenReturn(Optional.of(job));
        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(jobPostingRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.archive(2L, ADMIN);

        assertThat(job.getStatus()).isEqualTo(JobPostingStatus.ARCHIVED);
        verify(auditLogService).log(eq("JOB_POSTING"), eq(2L),
                eq("EXAM_SCHEDULED"), eq("ARCHIVED"), any(), isNull());
    }

    @Test
    void archive_throwsResourceNotFoundException_whenJobNotFound() {
        when(jobPostingRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.archive(99L, ADMIN))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void archive_throwsBusinessException_whenJobIsOpen() {
        JobPosting job = jobWithStatus(JobPostingStatus.OPEN);
        when(jobPostingRepository.findById(1L)).thenReturn(Optional.of(job));

        assertThatThrownBy(() -> service.archive(1L, ADMIN))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("CLOSED or EXAM_SCHEDULED");
    }

    @Test
    void archive_throwsBusinessException_whenJobAlreadyArchived() {
        JobPosting job = jobWithStatus(JobPostingStatus.ARCHIVED);
        when(jobPostingRepository.findById(1L)).thenReturn(Optional.of(job));

        assertThatThrownBy(() -> service.archive(1L, ADMIN))
                .isInstanceOf(BusinessException.class);
    }
}
