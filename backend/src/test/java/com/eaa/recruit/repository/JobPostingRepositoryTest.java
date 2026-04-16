package com.eaa.recruit.repository;

import com.eaa.recruit.config.TestJpaAuditingConfig;
import com.eaa.recruit.entity.JobPosting;
import com.eaa.recruit.entity.JobPostingStatus;
import com.eaa.recruit.entity.Role;
import com.eaa.recruit.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
@Import(TestJpaAuditingConfig.class)
class JobPostingRepositoryTest {

    @Autowired JobPostingRepository jobPostingRepository;
    @Autowired UserRepository userRepository;

    private static final LocalDate OPEN  = LocalDate.now().plusDays(1);
    private static final LocalDate CLOSE = OPEN.plusDays(30);
    private static final LocalDate EXAM  = CLOSE.plusDays(7);

    private User recruiter;

    @BeforeEach
    void setUp() {
        recruiter = userRepository.save(
            User.create("recruiter@eaa.com", "hash", Role.RECRUITER, "Alice")
        );
    }

    @Test
    void saveAndFindById() {
        JobPosting saved = jobPostingRepository.save(
            JobPosting.create("Pilot", "Fly planes", 170, 60, "BSc Aviation", OPEN, CLOSE, EXAM, recruiter)
        );

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getStatus()).isEqualTo(JobPostingStatus.DRAFT);
    }

    @Test
    void findByStatus_returnsMatchingPostings() {
        JobPosting draft = jobPostingRepository.save(
            JobPosting.create("Draft Job", "desc", 165, 55, "BSc", OPEN, CLOSE, EXAM, recruiter)
        );
        JobPosting open = jobPostingRepository.save(
            JobPosting.create("Open Job", "desc", 165, 55, "BSc", OPEN, CLOSE, EXAM, recruiter)
        );
        open.publish();
        jobPostingRepository.save(open);

        List<JobPosting> openPostings = jobPostingRepository.findByStatus(JobPostingStatus.OPEN);
        List<JobPosting> draftPostings = jobPostingRepository.findByStatus(JobPostingStatus.DRAFT);

        assertThat(openPostings).hasSize(1);
        assertThat(openPostings.get(0).getTitle()).isEqualTo("Open Job");
        assertThat(draftPostings).hasSize(1);
        assertThat(draftPostings.get(0).getTitle()).isEqualTo("Draft Job");
    }

    @Test
    void findByCreatedById_returnsRecruiterPostings() {
        jobPostingRepository.save(
            JobPosting.create("Job A", "desc", 170, 60, "BSc", OPEN, CLOSE, EXAM, recruiter)
        );
        jobPostingRepository.save(
            JobPosting.create("Job B", "desc", 175, 65, "MSc", OPEN, CLOSE, EXAM, recruiter)
        );

        User other = userRepository.save(
            User.create("other@eaa.com", "hash", Role.RECRUITER, "Bob")
        );
        jobPostingRepository.save(
            JobPosting.create("Job C", "desc", 160, 50, "BSc", OPEN, CLOSE, EXAM, other)
        );

        List<JobPosting> mine = jobPostingRepository.findByCreatedById(recruiter.getId());
        assertThat(mine).hasSize(2);
    }

    @Test
    void allStatusTransitions_persistCorrectly() {
        JobPosting jp = jobPostingRepository.save(
            JobPosting.create("Flight Eng", "desc", 168, 58, "BSc", OPEN, CLOSE, EXAM, recruiter)
        );

        jp.publish();
        jobPostingRepository.save(jp);
        assertThat(jobPostingRepository.findById(jp.getId()).orElseThrow().getStatus())
            .isEqualTo(JobPostingStatus.OPEN);

        jp.scheduleExam();
        jobPostingRepository.save(jp);
        assertThat(jobPostingRepository.findById(jp.getId()).orElseThrow().getStatus())
            .isEqualTo(JobPostingStatus.EXAM_SCHEDULED);

        jp.close();
        jobPostingRepository.save(jp);
        assertThat(jobPostingRepository.findById(jp.getId()).orElseThrow().getStatus())
            .isEqualTo(JobPostingStatus.CLOSED);
    }
}
