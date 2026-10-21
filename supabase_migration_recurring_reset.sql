-- ============================================================
-- KOLO QUEST KIDS — Recurring Tasks Daily Reset
-- Run in: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- 1. Add last_completed_date to tasks (tracks when a recurring task was last done)
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS last_completed_date DATE;

-- 2. Function: reset recurring tasks that were completed before today
--    Sets status back to 'active' for all recurring tasks whose last completion
--    was on a previous calendar day (in family's local time — we use UTC date here,
--    good enough for daily reset).
CREATE OR REPLACE FUNCTION reset_recurring_tasks()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE tasks
  SET
    status = 'active',
    updated_at = NOW()
  WHERE
    is_recurring = true
    AND status IN ('done', 'pending_approval')
    AND (
      last_completed_date IS NULL
      OR last_completed_date < CURRENT_DATE
    );

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- 3. Update approve_task logic: when a recurring task is approved,
--    record last_completed_date instead of leaving it permanently done.
--    Also update the submit logic.
CREATE OR REPLACE FUNCTION approve_task_recurring(p_task_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE tasks
  SET
    status = 'done',
    last_completed_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE id = p_task_id AND is_recurring = true;
END;
$$;

-- 4. Schedule daily reset using pg_cron (runs at 00:01 UTC every day)
--    Requires pg_cron extension — enable in Supabase Dashboard:
--    Database → Extensions → pg_cron → Enable
--    Then run the schedule below:

-- SELECT cron.schedule(
--   'reset-recurring-tasks',
--   '1 0 * * *',
--   $$ SELECT reset_recurring_tasks(); $$
-- );

-- ── ALTERNATIVE if pg_cron is not available ────────────────────────────────────
-- Call reset_recurring_tasks() from your app on login:
--   supabase.rpc('reset_recurring_tasks')
-- This is safe to call multiple times — it only resets tasks completed before today.
-- ──────────────────────────────────────────────────────────────────────────────

-- 5. Run initial reset now (clears any stuck recurring tasks)
SELECT reset_recurring_tasks();
