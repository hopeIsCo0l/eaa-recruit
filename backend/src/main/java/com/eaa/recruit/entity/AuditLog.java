package com.eaa.recruit.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;

import java.time.Instant;

/**
 * FR-37: Append-only audit record. Rows are immutable at the JPA layer —
 * Hibernate will not issue UPDATEs for instances of this entity.
 */
@Entity
@Immutable
@Table(
    name = "audit_logs",
    indexes = {
        @Index(name = "idx_audit_entity",       columnList = "entity_type, entity_id"),
        @Index(name = "idx_audit_actor",        columnList = "changed_by"),
        @Index(name = "idx_audit_changed_at",   columnList = "changed_at")
    }
)
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "entity_type", nullable = false, updatable = false, length = 50)
    private String entityType;

    @Column(name = "entity_id", nullable = false, updatable = false)
    private Long entityId;

    @Column(name = "old_status", updatable = false, length = 50)
    private String oldStatus;

    @Column(name = "new_status", nullable = false, updatable = false, length = 50)
    private String newStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by", updatable = false)
    private User changedBy;

    @Column(name = "changed_at", nullable = false, updatable = false)
    private Instant changedAt;

    @Column(name = "reason", updatable = false, length = 500)
    private String reason;

    protected AuditLog() {}

    private AuditLog(String entityType, Long entityId, String oldStatus,
                     String newStatus, User changedBy, String reason) {
        this.entityType = entityType;
        this.entityId   = entityId;
        this.oldStatus  = oldStatus;
        this.newStatus  = newStatus;
        this.changedBy  = changedBy;
        this.reason     = reason;
        this.changedAt  = Instant.now();
    }

    public static AuditLog of(String entityType, Long entityId, String oldStatus,
                               String newStatus, User changedBy, String reason) {
        return new AuditLog(entityType, entityId, oldStatus, newStatus, changedBy, reason);
    }

    public Long    getId()         { return id; }
    public String  getEntityType() { return entityType; }
    public Long    getEntityId()   { return entityId; }
    public String  getOldStatus()  { return oldStatus; }
    public String  getNewStatus()  { return newStatus; }
    public User    getChangedBy()  { return changedBy; }
    public Instant getChangedAt()  { return changedAt; }
    public String  getReason()     { return reason; }
}
