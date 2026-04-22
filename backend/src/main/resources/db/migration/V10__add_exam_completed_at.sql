-- V10: Track when exam score callback was received (FR-27)

ALTER TABLE applications
    ADD COLUMN IF NOT EXISTS exam_completed_at TIMESTAMPTZ;
