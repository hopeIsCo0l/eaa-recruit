package com.eaa.recruit.repository;

import com.eaa.recruit.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findByEntityTypeAndEntityIdOrderByChangedAtDesc(
            String entityType, Long entityId, Pageable pageable);

    Page<AuditLog> findAllByOrderByChangedAtDesc(Pageable pageable);
}
