package com.eaa.recruit.repository;

import com.eaa.recruit.entity.AuditLog;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;

/**
 * FR-37: composable query filters for /admin/audit-logs.
 */
public final class AuditLogSpecifications {

    private AuditLogSpecifications() {}

    public static Specification<AuditLog> entityTypeIs(String entityType) {
        return (root, q, cb) -> entityType == null ? null
                : cb.equal(cb.upper(root.get("entityType")), entityType.toUpperCase());
    }

    public static Specification<AuditLog> entityIdIs(Long entityId) {
        return (root, q, cb) -> entityId == null ? null
                : cb.equal(root.get("entityId"), entityId);
    }

    public static Specification<AuditLog> actorIs(Long actorId) {
        return (root, q, cb) -> actorId == null ? null
                : cb.equal(root.get("changedBy").get("id"), actorId);
    }

    public static Specification<AuditLog> changedAfter(Instant from) {
        return (root, q, cb) -> from == null ? null
                : cb.greaterThanOrEqualTo(root.get("changedAt"), from);
    }

    public static Specification<AuditLog> changedBefore(Instant to) {
        return (root, q, cb) -> to == null ? null
                : cb.lessThanOrEqualTo(root.get("changedAt"), to);
    }
}
