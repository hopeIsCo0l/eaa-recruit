package com.eaa.recruit.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(
    name = "ai_model_versions",
    indexes = {
        @Index(name = "idx_ai_model_active", columnList = "is_active")
    }
)
public class AiModelVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "model_version", nullable = false, length = 100)
    private String modelVersion;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "activated_at", nullable = false)
    private Instant activatedAt;

    @Column(name = "is_active", nullable = false)
    private boolean active = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected AiModelVersion() {}

    private AiModelVersion(String modelVersion, String description, User createdBy) {
        this.modelVersion = modelVersion;
        this.description  = description;
        this.createdBy    = createdBy;
        this.activatedAt  = Instant.now();
        this.createdAt    = Instant.now();
    }

    public static AiModelVersion create(String modelVersion, String description, User createdBy) {
        return new AiModelVersion(modelVersion, description, createdBy);
    }

    public Long    getId()           { return id; }
    public String  getModelVersion() { return modelVersion; }
    public String  getDescription()  { return description; }
    public Instant getActivatedAt()  { return activatedAt; }
    public boolean isActive()        { return active; }
    public User    getCreatedBy()    { return createdBy; }
    public Instant getCreatedAt()    { return createdAt; }

    public void activate()   { this.active = true;  this.activatedAt = Instant.now(); }
    public void deactivate() { this.active = false; }
}
