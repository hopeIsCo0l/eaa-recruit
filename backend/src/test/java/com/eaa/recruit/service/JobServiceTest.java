package com.eaa.recruit.service;

import com.eaa.recruit.dto.job.CreateJobRequest;
import com.eaa.recruit.dto.job.CreateJobResponse;
import com.eaa.recruit.entity.JobPosting;
import com.eaa.recruit.entity.JobPostingStatus;
import com.eaa.recruit.entity.Role;
import com.eaa.recruit.entity.User;
import com.eaa.recruit.exception.BusinessException;
import com.eaa.recruit.exception.ResourceNotFoundException;
import com.eaa.recruit.repository.JobPostingRepository;
import com.eaa.recruit.repository.UserRepository;
import com.eaa.recruit.security.AuthenticatedUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock JobPostingRepository jobPostingRepository;
    @Mock UserRepository       userRepository;

    JobService service;

    private static final LocalDate OPEN  = LocalDate.now().plusDays(1);
    private static final LocalDate CLOSE = OPEN.plusDays(30);
    private static final LocalDate EXAM  = CLOSE.plusDays(7);

    private static final AuthenticatedUser RECRUITER_PRINCIPAL =
            new AuthenticatedUser(42L, "recruiter@eaa.com", "RECRUITER");

    @BeforeEach
    void setUp() {
        service = new JobService(jobPostingRepository, userRepository);
    }

    private static CreateJobRequest validRequest() {
        return new CreateJobRequest(
                "Pilot", "Fly planes", 170, 60, "BSc Aviation",
                OPEN, CLOSE, EXAM
        );
    }

    private static User recruiter() {
        return User.create("recruiter@eaa.com", "hash", Role.RECRUITER, "Alice");
    }

    private static JobPosting savedPosting(User recruiter) {
        return JobPosting.create("Pilot", "Fly planes", 170, 60, "BSc Aviation",
                OPEN, CLOSE, EXAM, recruiter);
    }

    @Test
    void createJob_savesPosting_andReturnsResponse() {
        User recruiter = recruiter();
        when(userRepository.findById(42L)).thenReturn(Optional.of(recruiter));
        when(jobPostingRepository.save(any(JobPosting.class))).thenReturn(savedPosting(recruiter));

        CreateJobResponse response = service.createJob(validRequest(), RECRUITER_PRINCIPAL);

        assertThat(response.title()).isEqualTo("Pilot");
        assertThat(response.status()).isEqualTo(JobPostingStatus.DRAFT);
        assertThat(response.openDate()).isEqualTo(OPEN);
        assertThat(response.closeDate()).isEqualTo(CLOSE);
        assertThat(response.examDate()).isEqualTo(EXAM);
    }

    @Test
    void createJob_persistsCorrectFields() {
        User recruiter = recruiter();
        when(userRepository.findById(42L)).thenReturn(Optional.of(recruiter));
        when(jobPostingRepository.save(any(JobPosting.class))).thenAnswer(inv -> inv.getArgument(0));

        service.createJob(validRequest(), RECRUITER_PRINCIPAL);

        ArgumentCaptor<JobPosting> captor = ArgumentCaptor.forClass(JobPosting.class);
        verify(jobPostingRepository).save(captor.capture());
        JobPosting saved = captor.getValue();
        assertThat(saved.getTitle()).isEqualTo("Pilot");
        assertThat(saved.getStatus()).isEqualTo(JobPostingStatus.DRAFT);
        assertThat(saved.getOpenDate()).isEqualTo(OPEN);
        assertThat(saved.getCloseDate()).isEqualTo(CLOSE);
        assertThat(saved.getExamDate()).isEqualTo(EXAM);
    }

    @Test
    void createJob_throwsBusinessException_whenCloseDateNotAfterOpenDate() {
        CreateJobRequest bad = new CreateJobRequest(
                "Pilot", "desc", 170, 60, "BSc",
                OPEN, OPEN,        // closeDate == openDate — not after
                EXAM
        );

        assertThatThrownBy(() -> service.createJob(bad, RECRUITER_PRINCIPAL))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("closeDate must be after openDate");

        verifyNoInteractions(jobPostingRepository);
    }

    @Test
    void createJob_throwsBusinessException_whenExamDateNotAfterCloseDate() {
        CreateJobRequest bad = new CreateJobRequest(
                "Pilot", "desc", 170, 60, "BSc",
                OPEN, CLOSE, CLOSE // examDate == closeDate — not after
        );

        assertThatThrownBy(() -> service.createJob(bad, RECRUITER_PRINCIPAL))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("examDate must be after closeDate");

        verifyNoInteractions(jobPostingRepository);
    }

    @Test
    void createJob_throwsResourceNotFoundException_whenRecruiterMissing() {
        when(userRepository.findById(42L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.createJob(validRequest(), RECRUITER_PRINCIPAL))
                .isInstanceOf(ResourceNotFoundException.class);

        verifyNoInteractions(jobPostingRepository);
    }
}
