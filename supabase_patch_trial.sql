-- ============================================================
-- KOLO QUEST KIDS — Trial Period Support
-- Run in: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- 1. Add trial_started_at to families table
--    Set existing families to "started trial 8 days ago" so they
--    immediately see the paywall (existing users = pre-existing)
--    To grandfather in existing paying users, add them to RC instead.
ALTER TABLE families
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ;

-- 2. For NEW families, trial_started_at is set at registration time.
--    Existing families without a value get NULL = trial not started (will see paywall).
--    If you want to grandfather existing families into trial, run:
--    UPDATE families SET trial_started_at = NOW() WHERE trial_started_at IS NULL;

-- 3. Function: start trial for a family (called after onboarding)
CREATE OR REPLACE FUNCTION start_family_trial(p_family_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE families
  SET trial_started_at = NOW()
  WHERE id = p_family_id
    AND trial_started_at IS NULL;  -- only set once
END;
$$;

-- 4. Function: get trial status for a family
CREATE OR REPLACE FUNCTION get_trial_status(p_family_id UUID)
RETURNS TABLE(
  trial_started_at TIMESTAMPTZ,
  trial_days_left  INTEGER,
  trial_active     BOOLEAN,
  trial_expired    BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_started TIMESTAMPTZ;
  v_days_left INTEGER;
BEGIN
  SELECT f.trial_started_at INTO v_started
  FROM families f WHERE f.id = p_family_id;

  IF v_started IS NULL THEN
    -- Trial never started (old account or not yet started)
    RETURN QUERY SELECT
      NULL::TIMESTAMPTZ,
      0::INTEGER,
      false,
      true;  -- treat as expired → show paywall
    RETURN;
  END IF;

  v_days_left := 7 - EXTRACT(DAY FROM (NOW() - v_started))::INTEGER;
  v_days_left := GREATEST(v_days_left, 0);

  RETURN QUERY SELECT
    v_started,
    v_days_left,
    (v_days_left > 0),   -- trial_active
    (v_days_left <= 0);  -- trial_expired
END;
$$;

SELECT 'trial patch applied successfully' AS result;
