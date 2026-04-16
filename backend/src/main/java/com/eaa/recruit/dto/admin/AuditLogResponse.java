package com.eaa.recruit.dto.admin;

import java.time.Instant;

public record AuditLogResponse(
        Long id,
        String entityType,
        Long entityId,
        String oldStatus,
        String newStatus,
        Long changedById,
        String changedByEmail,
        Instant changedAt,
        String reason
) {}
