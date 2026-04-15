package com.eaa.recruit.scheduler;

import com.eaa.recruit.entity.JobPosting;
import com.eaa.recruit.entity.JobPostingStatus;
import com.eaa.recruit.entity.Role;
import com.eaa.recruit.entity.User;
import com.eaa.recruit.repository.JobPostingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobStatusSchedulerTest {

    @Mock JobPostingRepository jobPostingRepository;

    JobStatusScheduler scheduler;

    @BeforeEach
    void setUp() {
        scheduler = new JobStatusScheduler(jobPostingRepository);
    }

    @Test
    void closeExpiredJobs_closesOpenJobsPastDeadline() {
        User recruiter = User.create("r@eaa.com", "hash", Role.RECRUITER, "Alice");
        LocalDate yesterday = LocalDate.now().minusDays(1);
        JobPosting expiredJob = JobPosting.create(
                "Pilot", "desc", 170, 60, "BSc",
                yesterday.minusDays(30), yesterday, yesterday.plusDays(7), recruiter);
        expiredJob.publish(); // make OPEN

        when(jobPostingRepository.findOverdueByStatus(eq(JobPostingStatus.OPEN), any(LocalDate.class)))
                .thenReturn(List.of(expiredJob));

        scheduler.closeExpiredJobs();

        assertThat(expiredJob.getStatus()).isEqualTo(JobPostingStatus.CLOSED);

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<JobPosting>> captor = ArgumentCaptor.forClass(List.class);
        verify(jobPostingRepository).saveAll(captor.capture());
        assertThat(captor.getValue()).contains(expiredJob);
    }

    @Test
    void closeExpiredJobs_doesNothingWhenNoExpiredJobs() {
        when(jobPostingRepository.findOverdueByStatus(any(), any())).thenReturn(List.of());

        scheduler.closeExpiredJobs();

        verify(jobPostingRepository, never()).saveAll(any());
    }

    @Test
    void closeExpiredJobs_isIdempotent() {
        when(jobPostingRepository.findOverdueByStatus(any(), any())).thenReturn(List.of());

        scheduler.closeExpiredJobs();
        scheduler.closeExpiredJobs();

        verify(jobPostingRepository, times(2)).findOverdueByStatus(any(), any());
        verify(jobPostingRepository, never()).saveAll(any());
    }
}
