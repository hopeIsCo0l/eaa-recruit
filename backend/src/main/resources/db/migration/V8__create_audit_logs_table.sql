-- V8: Audit log — immutable record of all status transitions and admin actions

CREATE TABLE audit_logs (
    id           BIGSERIAL     PRIMARY KEY,
    entity_type  VARCHAR(50)   NOT NULL,
    entity_id    BIGINT        NOT NULL,
    old_status   VARCHAR(50),
    new_status   VARCHAR(50)   NOT NULL,
    changed_by   BIGINT,
    changed_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),
    reason       VARCHAR(500)
);

CREATE INDEX idx_audit_entity    ON audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_actor     ON audit_logs (changed_by);
CREATE INDEX idx_audit_changed_at ON audit_logs (changed_at);
