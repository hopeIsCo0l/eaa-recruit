-- V7: Interview booking, final decisions, archive support

-- Add interview slot FK + decision fields to applications
ALTER TABLE applications
    ADD COLUMN IF NOT EXISTS interview_slot_id BIGINT REFERENCES availability_slots(id),
    ADD COLUMN IF NOT EXISTS reminder_sent      BOOLEAN       NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS decision_notes     TEXT,
    ADD COLUMN IF NOT EXISTS decision_by_id     BIGINT        REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS decided_at         TIMESTAMPTZ;

CREATE INDEX idx_applications_slot ON applications (interview_slot_id)
    WHERE interview_slot_id IS NOT NULL;

-- Add booking fields to availability_slots (FR-30, FR-31)
ALTER TABLE availability_slots
    ADD COLUMN IF NOT EXISTS booked_by_id BIGINT REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS booked_at    TIMESTAMPTZ;

-- Unique constraint: one slot per candidate (prevents double-booking at DB level)
ALTER TABLE availability_slots
    ADD CONSTRAINT uq_slot_booked_by UNIQUE (booked_by_id)
    DEFERRABLE INITIALLY IMMEDIATE;

-- Add ARCHIVED status to job_postings (FR-36)
ALTER TABLE job_postings
    DROP CONSTRAINT IF EXISTS job_postings_status_check;

ALTER TABLE job_postings
    ADD CONSTRAINT job_postings_status_check
    CHECK (status IN ('DRAFT', 'OPEN', 'CLOSED', 'EXAM_SCHEDULED', 'ARCHIVED'));
