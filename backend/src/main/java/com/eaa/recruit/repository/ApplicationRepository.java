package com.eaa.recruit.repository;

import com.eaa.recruit.entity.Application;
import com.eaa.recruit.entity.ApplicationStatus;
import com.eaa.recruit.repository.projection.DashboardProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    boolean existsByCandidateIdAndJobId(Long candidateId, Long jobId);

    List<Application> findByJobId(Long jobId);

    List<Application> findByJobIdAndStatus(Long jobId, ApplicationStatus status);

    @Query(value = """
            SELECT jp.id           AS jobId,
                   jp.title        AS jobTitle,
                   COUNT(a.id)     AS totalApplications,
                   SUM(CASE WHEN a.status IN ('SUBMITTED','AI_SCREENING')             THEN 1 ELSE 0 END) AS screeningCount,
                   SUM(CASE WHEN a.status IN ('EXAM_AUTHORIZED','EXAM_COMPLETED')     THEN 1 ELSE 0 END) AS examCount,
                   SUM(CASE WHEN a.status IN ('SHORTLISTED','INTERVIEW_SCHEDULED')    THEN 1 ELSE 0 END) AS interviewCount,
                   SUM(CASE WHEN a.status IN ('SELECTED','REJECTED','WAITLISTED','HARD_FILTER_FAILED') THEN 1 ELSE 0 END) AS decidedCount
            FROM job_postings jp
            LEFT JOIN applications a ON a.job_id = jp.id
            WHERE jp.created_by_id = :recruiterId
            GROUP BY jp.id, jp.title
            ORDER BY COUNT(a.id) DESC
            """,
           countQuery = "SELECT COUNT(*) FROM job_postings WHERE created_by_id = :recruiterId",
           nativeQuery = true)
    Page<DashboardProjection> findDashboardByRecruiterId(
            @Param("recruiterId") Long recruiterId, Pageable pageable);
}
