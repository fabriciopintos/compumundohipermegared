ALTER TABLE users
    ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'usuario';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'users_role_check'
    ) THEN
        ALTER TABLE users
            ADD CONSTRAINT users_role_check
            CHECK (role IN ('admin', 'entrenador', 'usuario'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

ALTER TABLE class_sessions
    ADD COLUMN IF NOT EXISTS duration_minutes INTEGER NOT NULL DEFAULT 60;
