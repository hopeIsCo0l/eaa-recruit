package com.eaa.recruit.repository;

import com.eaa.recruit.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    // Eagerly load the changedBy User — the response DTO reads id+email, and
    // these methods are called outside a Spring-managed transaction (controller
    // layer), so lazy access would throw LazyInitializationException.

    @EntityGraph(attributePaths = "changedBy")
    Page<AuditLog> findByEntityTypeAndEntityIdOrderByChangedAtDesc(
            String entityType, Long entityId, Pageable pageable);

    @EntityGraph(attributePaths = "changedBy")
    Page<AuditLog> findAllByOrderByChangedAtDesc(Pageable pageable);
}
