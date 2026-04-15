-- V2: Users table — core identity store for all roles

CREATE TABLE users (
    id            BIGSERIAL     PRIMARY KEY,
    email         VARCHAR(255)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    role          VARCHAR(20)   NOT NULL
                    CHECK (role IN ('CANDIDATE', 'RECRUITER', 'ADMIN', 'SUPER_ADMIN')),
    full_name     VARCHAR(100)  NOT NULL,
    is_active     BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
    version       BIGINT        NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX idx_users_email ON users (email);

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
