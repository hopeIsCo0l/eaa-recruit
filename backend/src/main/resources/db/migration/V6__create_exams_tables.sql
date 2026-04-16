-- V6: Exams and questions

CREATE TABLE exams (
    id               BIGSERIAL     PRIMARY KEY,
    job_id           BIGINT        NOT NULL UNIQUE REFERENCES job_postings(id),
    title            VARCHAR(255)  NOT NULL,
    duration_minutes INTEGER       NOT NULL CHECK (duration_minutes > 0),
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
    version          BIGINT        NOT NULL DEFAULT 0
);

CREATE TRIGGER trg_exams_updated_at
    BEFORE UPDATE ON exams
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE questions (
    id              BIGSERIAL     PRIMARY KEY,
    exam_id         BIGINT        NOT NULL REFERENCES exams(id),
    type            VARCHAR(20)   NOT NULL CHECK (type IN ('MCQ', 'SHORT_ANSWER')),
    question_text   TEXT          NOT NULL,
    options         TEXT,
    correct_answer  INTEGER,
    marks           INTEGER       NOT NULL CHECK (marks > 0),
    display_order   INTEGER       NOT NULL,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
    version         BIGINT        NOT NULL DEFAULT 0
);

CREATE INDEX idx_questions_exam ON questions (exam_id, display_order);

CREATE TRIGGER trg_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
