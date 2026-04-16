-- V3: Job postings table

CREATE TABLE job_postings (
    id               BIGSERIAL     PRIMARY KEY,
    title            VARCHAR(255)  NOT NULL,
    description      TEXT          NOT NULL,
    min_height_cm    INTEGER       NOT NULL,
    min_weight_kg    INTEGER       NOT NULL,
    required_degree  VARCHAR(100)  NOT NULL,
    open_date        DATE          NOT NULL,
    close_date       DATE          NOT NULL,
    exam_date        DATE          NOT NULL,
    status           VARCHAR(20)   NOT NULL
                       CHECK (status IN ('DRAFT', 'OPEN', 'CLOSED', 'EXAM_SCHEDULED')),
    created_by_id    BIGINT        NOT NULL REFERENCES users(id),
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
    version          BIGINT        NOT NULL DEFAULT 0
);

CREATE INDEX idx_job_postings_status     ON job_postings (status);
CREATE INDEX idx_job_postings_created_by ON job_postings (created_by_id);

CREATE TRIGGER trg_job_postings_updated_at
    BEFORE UPDATE ON job_postings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
