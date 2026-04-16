-- V5: Recruiter interview availability slots

CREATE TABLE availability_slots (
    id            BIGSERIAL     PRIMARY KEY,
    recruiter_id  BIGINT        NOT NULL REFERENCES users(id),
    slot_date     DATE          NOT NULL,
    start_time    TIME          NOT NULL,
    end_time      TIME          NOT NULL,
    is_booked     BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
    version       BIGINT        NOT NULL DEFAULT 0,
    CONSTRAINT chk_slot_times CHECK (end_time > start_time)
);

CREATE INDEX idx_slots_recruiter ON availability_slots (recruiter_id);
CREATE INDEX idx_slots_date      ON availability_slots (slot_date);

CREATE TRIGGER trg_availability_slots_updated_at
    BEFORE UPDATE ON availability_slots
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
