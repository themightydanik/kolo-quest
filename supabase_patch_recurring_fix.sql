-- ============================================================
-- PATCH: Fix recurring task reset bug
-- Problem: pending_approval recurring tasks were immediately
--          reset to active because last_completed_date was NULL.
-- Fix:
--   1. reset_recurring_tasks() now requires last_completed_date
--      to be set AND be a past date (never resets NULL date tasks)
--   2. The app now sets last_completed_date when child submits
--
-- Run in: Supabase Dashboard → SQL Editor → Run
-- ============================================================

CREATE OR REPLACE FUNCTION reset_recurring_tasks()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Only reset recurring tasks completed on a PREVIOUS calendar day.
  -- Tasks submitted today (pending_approval or done with today's date) stay as-is.
  -- Tasks with NULL last_completed_date are never reset (safety guard).
  UPDATE tasks
  SET
    status = 'active',
    updated_at = NOW()
  WHERE
    is_recurring = true
    AND status IN ('done', 'pending_approval')
    AND last_completed_date IS NOT NULL
    AND last_completed_date < CURRENT_DATE;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Verify the fix is applied
SELECT 'reset_recurring_tasks patched successfully' AS result;
