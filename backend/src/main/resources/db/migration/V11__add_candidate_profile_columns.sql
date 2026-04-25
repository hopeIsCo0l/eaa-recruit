-- V11: Candidate profile fields on users table (FR-84)
-- height_cm, weight_kg, degree used by HardFilterService; field_of_study, graduation_year, phone for profile display

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS phone           VARCHAR(20),
    ADD COLUMN IF NOT EXISTS height_cm       INTEGER,
    ADD COLUMN IF NOT EXISTS weight_kg       INTEGER,
    ADD COLUMN IF NOT EXISTS degree          VARCHAR(100),
    ADD COLUMN IF NOT EXISTS field_of_study  VARCHAR(150),
    ADD COLUMN IF NOT EXISTS graduation_year INTEGER;
