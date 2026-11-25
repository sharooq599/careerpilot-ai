-- Run once against an existing PostgreSQL database before starting the updated API.
-- Existing application rows are preserved in an archive table because the old
-- schema incorrectly used user_id -> jobs.id and did not contain job_id.
ALTER TABLE public.jobs
    ADD COLUMN IF NOT EXISTS owner_id INTEGER NULL REFERENCES public.users(id) ON DELETE CASCADE;

DO $$
BEGIN
    IF to_regclass('public.applications') IS NOT NULL
       AND NOT EXISTS (
           SELECT 1 FROM information_schema.columns
           WHERE table_schema='public' AND table_name='applications' AND column_name='job_id'
       )
       AND to_regclass('public.applications_legacy_20261115') IS NULL THEN
        ALTER TABLE public.applications RENAME TO applications_legacy_20261115;
    END IF;
END $$;

-- FastAPI SQLAlchemy create_all creates the corrected applications table at startup.
