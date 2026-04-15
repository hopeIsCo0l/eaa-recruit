-- V1: Database initialisation
-- Sets up extensions and conventions used across all migrations.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Utility function: auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
