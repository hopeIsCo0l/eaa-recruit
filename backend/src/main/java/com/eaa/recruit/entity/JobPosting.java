package com.eaa.recruit.entity;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(
    name = "job_postings",
    indexes = {
        @Index(name = "idx_job_postings_status", columnList = "status"),
        @Index(name = "idx_job_postings_created_by", columnList = "created_by")
    }
)
public class JobPosting extends BaseEntity {

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "min_height_cm", nullable = false)
    private Integer minHeightCm;

    @Column(name = "min_weight_kg", nullable = false)
    private Integer minWeightKg;

    @Column(name = "required_degree", nullable = false, length = 100)
    private String requiredDegree;

    @Column(name = "open_date", nullable = false)
    private LocalDate openDate;

    @Column(name = "close_date", nullable = false)
    private LocalDate closeDate;

    @Column(name = "exam_date", nullable = false)
    private LocalDate examDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private JobPostingStatus status;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false, updatable = false)
    private User createdBy;

    protected JobPosting() {}

    private JobPosting(String title, String description, Integer minHeightCm,
                       Integer minWeightKg, String requiredDegree,
                       LocalDate openDate, LocalDate closeDate, LocalDate examDate,
                       User createdBy) {
        this.title         = title;
        this.description   = description;
        this.minHeightCm   = minHeightCm;
        this.minWeightKg   = minWeightKg;
        this.requiredDegree = requiredDegree;
        this.openDate      = openDate;
        this.closeDate     = closeDate;
        this.examDate      = examDate;
        this.status        = JobPostingStatus.DRAFT;
        this.createdBy     = createdBy;
    }

    public static JobPosting create(String title, String description, Integer minHeightCm,
                                    Integer minWeightKg, String requiredDegree,
                                    LocalDate openDate, LocalDate closeDate, LocalDate examDate,
                                    User createdBy) {
        return new JobPosting(title, description, minHeightCm, minWeightKg, requiredDegree,
                              openDate, closeDate, examDate, createdBy);
    }

    public String getTitle()            { return title; }
    public String getDescription()      { return description; }
    public Integer getMinHeightCm()     { return minHeightCm; }
    public Integer getMinWeightKg()     { return minWeightKg; }
    public String getRequiredDegree()   { return requiredDegree; }
    public LocalDate getOpenDate()      { return openDate; }
    public LocalDate getCloseDate()     { return closeDate; }
    public LocalDate getExamDate()      { return examDate; }
    public JobPostingStatus getStatus() { return status; }
    public User getCreatedBy()          { return createdBy; }

    public void publish()               { this.status = JobPostingStatus.OPEN; }
    public void close()                 { this.status = JobPostingStatus.CLOSED; }
    public void scheduleExam()          { this.status = JobPostingStatus.EXAM_SCHEDULED; }
}
