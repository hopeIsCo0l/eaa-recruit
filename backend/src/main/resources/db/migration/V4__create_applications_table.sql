-- V4: Applications table + candidate profile fields on users

-- Candidate profile fields (nullable — only populated for CANDIDATE role)
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS phone      VARCHAR(20),
    ADD COLUMN IF NOT EXISTS height_cm  INTEGER,
    ADD COLUMN IF NOT EXISTS weight_kg  INTEGER,
    ADD COLUMN IF NOT EXISTS degree     VARCHAR(100);

CREATE TABLE applications (
    id                   BIGSERIAL        PRIMARY KEY,
    candidate_id         BIGINT           NOT NULL REFERENCES users(id),
    job_id               BIGINT           NOT NULL REFERENCES job_postings(id),
    cv_file_path         VARCHAR(500)     NOT NULL,
    cv_relevance_score   DOUBLE PRECISION,
    exam_score           DOUBLE PRECISION,
    hard_filter_passed   BOOLEAN,
    final_score          DOUBLE PRECISION,
    status               VARCHAR(30)      NOT NULL DEFAULT 'SUBMITTED'
                           CHECK (status IN (
                               'SUBMITTED', 'AI_SCREENING', 'HARD_FILTER_FAILED',
                               'EXAM_AUTHORIZED', 'EXAM_COMPLETED',
                               'SHORTLISTED', 'INTERVIEW_SCHEDULED',
                               'SELECTED', 'REJECTED', 'WAITLISTED'
                           )),
    xai_report_url       VARCHAR(500),
    exam_token           VARCHAR(36),
    submitted_at         TIMESTAMPTZ      NOT NULL DEFAULT now(),
    created_at           TIMESTAMPTZ      NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ      NOT NULL DEFAULT now(),
    version              BIGINT           NOT NULL DEFAULT 0,
    UNIQUE (candidate_id, job_id)
);

CREATE INDEX idx_applications_candidate ON applications (candidate_id);
CREATE INDEX idx_applications_job       ON applications (job_id);
CREATE INDEX idx_applications_status    ON applications (status);

CREATE TRIGGER trg_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
