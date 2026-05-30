package com.eaa.recruit.repository;

import com.eaa.recruit.entity.JobPosting;
import com.eaa.recruit.entity.JobPostingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {

    List<JobPosting> findByStatus(JobPostingStatus status);

    // Used by candidate-facing listing — jobs are visible to candidates while
    // OPEN or EXAM_SCHEDULED (after a recruiter sets the exam date they should
    // still be applyable until the close date).
    List<JobPosting> findByStatusIn(List<JobPostingStatus> statuses);

    List<JobPosting> findByCreatedById(Long recruiterId);

    Optional<JobPosting> findByIdAndCreatedById(Long id, Long recruiterId);

    @Query("SELECT jp FROM JobPosting jp WHERE jp.status = :status AND jp.closeDate < :today")
    List<JobPosting> findOverdueByStatus(@Param("status") JobPostingStatus status,
                                         @Param("today") LocalDate today);
}
