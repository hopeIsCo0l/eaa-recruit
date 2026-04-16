-- V9: AI model version registry (FR-39)

CREATE TABLE ai_model_versions (
    id              BIGSERIAL     PRIMARY KEY,
    model_version   VARCHAR(100)  NOT NULL,
    description     TEXT,
    activated_at    TIMESTAMPTZ   NOT NULL,
    is_active       BOOLEAN       NOT NULL DEFAULT FALSE,
    created_by_id   BIGINT        REFERENCES users(id),
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_model_active ON ai_model_versions (is_active);
