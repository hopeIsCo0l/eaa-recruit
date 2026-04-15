package com.eaa.recruit.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(
    name = "applications",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_applications_candidate_job",
        columnNames = {"candidate_id", "job_id"}
    ),
    indexes = {
        @Index(name = "idx_applications_candidate", columnList = "candidate_id"),
        @Index(name = "idx_applications_job",       columnList = "job_id"),
        @Index(name = "idx_applications_status",    columnList = "status")
    }
)
public class Application extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "candidate_id", nullable = false, updatable = false)
    private User candidate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "job_id", nullable = false, updatable = false)
    private JobPosting job;

    @Column(name = "cv_file_path", nullable = false, length = 500)
    private String cvFilePath;

    @Column(name = "cv_relevance_score")
    private Double cvRelevanceScore;

    @Column(name = "exam_score")
    private Double examScore;

    @Column(name = "hard_filter_passed")
    private Boolean hardFilterPassed;

    @Column(name = "final_score")
    private Double finalScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private ApplicationStatus status;

    @Column(name = "xai_report_url", length = 500)
    private String xaiReportUrl;

    @Column(name = "exam_token", length = 36)
    private String examToken;

    @Column(name = "submitted_at", nullable = false, updatable = false)
    private Instant submittedAt;

    protected Application() {}

    private Application(User candidate, JobPosting job, String cvFilePath) {
        this.candidate   = candidate;
        this.job         = job;
        this.cvFilePath  = cvFilePath;
        this.status      = ApplicationStatus.SUBMITTED;
        this.submittedAt = Instant.now();
    }

    public static Application create(User candidate, JobPosting job, String cvFilePath) {
        return new Application(candidate, job, cvFilePath);
    }

    // ── Getters ──────────────────────────────────────────────────────────────

    public User           getCandidate()          { return candidate; }
    public JobPosting     getJob()                { return job; }
    public String         getCvFilePath()         { return cvFilePath; }
    public Double         getCvRelevanceScore()   { return cvRelevanceScore; }
    public Double         getExamScore()          { return examScore; }
    public Boolean        getHardFilterPassed()   { return hardFilterPassed; }
    public Double         getFinalScore()         { return finalScore; }
    public ApplicationStatus getStatus()          { return status; }
    public String         getXaiReportUrl()       { return xaiReportUrl; }
    public String         getExamToken()          { return examToken; }
    public Instant        getSubmittedAt()        { return submittedAt; }

    // ── State transitions ─────────────────────────────────────────────────────

    public void applyAiScore(double score, String reportUrl) {
        this.cvRelevanceScore = score;
        this.xaiReportUrl     = reportUrl;
        this.status           = ApplicationStatus.AI_SCREENING;
    }

    public void markHardFilterPassed() {
        this.hardFilterPassed = true;
    }

    public void markHardFilterFailed() {
        this.hardFilterPassed = false;
        this.status           = ApplicationStatus.HARD_FILTER_FAILED;
    }

    public void authorizeExam(String token) {
        this.examToken = token;
        this.status    = ApplicationStatus.EXAM_AUTHORIZED;
    }
}
