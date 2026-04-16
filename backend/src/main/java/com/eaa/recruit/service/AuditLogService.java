package com.eaa.recruit.service;

import com.eaa.recruit.entity.AuditLog;
import com.eaa.recruit.entity.User;
import com.eaa.recruit.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * FR-37: Centralized audit logging for status changes.
 */
@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String entityType, Long entityId, String oldStatus,
                     String newStatus, User changedBy, String reason) {
        auditLogRepository.save(AuditLog.of(entityType, entityId, oldStatus, newStatus, changedBy, reason));
    }
}
