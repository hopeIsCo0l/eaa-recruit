package com.eaa.recruit.entity;

import jakarta.persistence.*;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private JobPostingStatus status;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false, updatable = false)
    private User createdBy;

    protected JobPosting() {}

    private JobPosting(String title, String description, Integer minHeightCm,
                       Integer minWeightKg, String requiredDegree, User createdBy) {
        this.title         = title;
        this.description   = description;
        this.minHeightCm   = minHeightCm;
        this.minWeightKg   = minWeightKg;
        this.requiredDegree = requiredDegree;
        this.status        = JobPostingStatus.DRAFT;
        this.createdBy     = createdBy;
    }

    public static JobPosting create(String title, String description, Integer minHeightCm,
                                    Integer minWeightKg, String requiredDegree, User createdBy) {
        return new JobPosting(title, description, minHeightCm, minWeightKg, requiredDegree, createdBy);
    }

    public String getTitle()           { return title; }
    public String getDescription()     { return description; }
    public Integer getMinHeightCm()    { return minHeightCm; }
    public Integer getMinWeightKg()    { return minWeightKg; }
    public String getRequiredDegree()  { return requiredDegree; }
    public JobPostingStatus getStatus() { return status; }
    public User getCreatedBy()         { return createdBy; }

    public void publish()              { this.status = JobPostingStatus.OPEN; }
    public void close()                { this.status = JobPostingStatus.CLOSED; }
    public void scheduleExam()         { this.status = JobPostingStatus.EXAM_SCHEDULED; }
}
