-- V13: Enable pgvector and create chunk embedding tables for semantic XAI explanation.
-- cv_chunks  : one row per CV sentence chunk, keyed by application_id
-- jd_chunks  : one row per JD requirement chunk, keyed by job_id (indexed once, reused for all applicants)

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE cv_chunks (
    id             BIGSERIAL PRIMARY KEY,
    application_id BIGINT       NOT NULL,
    chunk_index    INT          NOT NULL,
    chunk_text     TEXT         NOT NULL,
    embedding      vector(384)  NOT NULL,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_cv_chunk UNIQUE (application_id, chunk_index)
);

CREATE INDEX idx_cv_chunks_application_id ON cv_chunks (application_id);
CREATE INDEX idx_cv_chunks_embedding      ON cv_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

CREATE TABLE jd_chunks (
    id          BIGSERIAL PRIMARY KEY,
    job_id      BIGINT       NOT NULL,
    chunk_index INT          NOT NULL,
    chunk_text  TEXT         NOT NULL,
    embedding   vector(384)  NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_jd_chunk UNIQUE (job_id, chunk_index)
);

CREATE INDEX idx_jd_chunks_job_id   ON jd_chunks (job_id);
CREATE INDEX idx_jd_chunks_embedding ON jd_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);
