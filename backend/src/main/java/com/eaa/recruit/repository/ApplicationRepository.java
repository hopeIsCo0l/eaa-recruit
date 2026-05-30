package com.eaa.recruit.repository;

import com.eaa.recruit.entity.Application;
import com.eaa.recruit.entity.ApplicationStatus;
import com.eaa.recruit.repository.projection.DashboardProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    boolean existsByCandidateIdAndJobId(Long candidateId, Long jobId);

    Optional<Application> findByCandidateIdAndJobId(Long candidateId, Long jobId);

    List<Application> findByCandidateIdOrderBySubmittedAtDesc(Long candidateId);

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

    // FR-32: fetch candidates with upcoming interviews where reminder not yet sent
    @Query("""
            SELECT a FROM Application a
            WHERE a.status = com.eaa.recruit.entity.ApplicationStatus.INTERVIEW_SCHEDULED
              AND a.reminderSent = false
              AND a.interviewSlot.slotDate = :date
            """)
    List<Application> findScheduledForDateWithoutReminder(@Param("date") LocalDate date);

    // Recruiter: all applications across their jobs
    @Query(value = """
            SELECT a.id              AS id,
                   a.job_id          AS jobId,
                   jp.title          AS jobTitle,
                   u.full_name       AS candidateName,
                   u.email           AS candidateEmail,
                   a.status          AS status,
                   a.cv_relevance_score AS cvRelevanceScore,
                   a.exam_score      AS examScore,
                   a.final_score     AS finalScore,
                   a.hard_filter_passed AS hardFilterPassed,
                   a.submitted_at    AS submittedAt,
                   s.slot_date       AS interviewDate,
                   s.start_time      AS interviewTime,
                   a.xai_report_url  AS xaiReportUrl,
                   a.decision_notes  AS decisionNotes
            FROM applications a
            JOIN job_postings jp ON jp.id = a.job_id
            JOIN users u ON u.id = a.candidate_id
            LEFT JOIN availability_slots s ON s.id = a.interview_slot_id
            WHERE jp.created_by_id = :recruiterId
            ORDER BY a.submitted_at DESC
            """, nativeQuery = true)
    List<Object[]> findAllByRecruiterId(@Param("recruiterId") Long recruiterId);

    // FR-40: analytics
    @Query(value = """
            SELECT jp.title          AS jobTitle,
                   COUNT(a.id)       AS total,
                   AVG(a.final_score) AS avgScore,
                   SUM(CASE WHEN a.status = 'SELECTED'   THEN 1 ELSE 0 END) AS selected,
                   SUM(CASE WHEN a.status = 'REJECTED'   THEN 1 ELSE 0 END) AS rejected,
                   SUM(CASE WHEN a.status = 'WAITLISTED' THEN 1 ELSE 0 END) AS waitlisted
            FROM applications a
            JOIN job_postings jp ON jp.id = a.job_id
            GROUP BY jp.id, jp.title
            ORDER BY jp.title
            """, nativeQuery = true)
    List<Object[]> findAnalyticsSummary();

    // FR-35: set XAI report URL and summary without optimistic lock conflict
    @Modifying
    @Query(value = "UPDATE applications SET xai_report_url = :url WHERE id = :id", nativeQuery = true)
    void updateXaiReportUrl(@Param("id") Long id, @Param("url") String url);

    @Modifying
    @Query(value = "UPDATE applications SET xai_report_url = :url, xai_summary = :summary WHERE id = :id", nativeQuery = true)
    void updateXaiReportUrlAndSummary(@Param("id") Long id, @Param("url") String url, @Param("summary") String summary);
}
