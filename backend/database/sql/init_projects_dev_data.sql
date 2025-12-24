-- Initialize project-scoped dev_data permissions tables
-- Target DB: PostgreSQL
--
-- Tables:
--   - projects
--   - project_members
--   - dev_data
--
-- Notes:
--   - This repo uses SQLAlchemy models, but doesn't appear to ship Alembic migrations.
--   - If you already have any of these tables, remove the corresponding CREATE TABLE or adjust.

BEGIN;

CREATE TABLE IF NOT EXISTS projects (
    id uuid PRIMARY KEY,
    name text NOT NULL,
    created_by text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_members (
    id uuid PRIMARY KEY,
    project_id text NOT NULL,
    user_id text NOT NULL,
    role text NOT NULL DEFAULT 'user',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Prevent duplicate membership rows per (project_id, user_id)
CREATE UNIQUE INDEX IF NOT EXISTS ux_project_members_project_user
    ON project_members(project_id, user_id);

CREATE INDEX IF NOT EXISTS ix_project_members_project_id
    ON project_members(project_id);

CREATE INDEX IF NOT EXISTS ix_project_members_user_id
    ON project_members(user_id);

CREATE TABLE IF NOT EXISTS dev_data (
    id uuid PRIMARY KEY,
    project_id text NOT NULL,
    data jsonb NOT NULL,
    created_by text NOT NULL,
    updated_by text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_dev_data_project_id
    ON dev_data(project_id);

COMMIT;
