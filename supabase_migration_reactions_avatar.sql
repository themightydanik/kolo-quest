-- ── Migration: reactions on activity_feed + avatar_url for users ──────────────
-- Run in Supabase Dashboard → SQL Editor

-- 1. Add reactions column to activity_feed
--    Format: { "❤️": ["user_id_1", "user_id_2"], "⭐": ["user_id_1"] }
ALTER TABLE activity_feed
  ADD COLUMN IF NOT EXISTS reactions JSONB NOT NULL DEFAULT '{}';

-- 2. Add avatar_url column to users (for custom photo avatars)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 3. RPC: toggle_reaction(p_feed_id, p_user_id, p_emoji)
--    Adds user to reaction list if absent, removes if present.
--    Returns updated reactions object.
CREATE OR REPLACE FUNCTION toggle_reaction(
  p_feed_id   UUID,
  p_user_id   UUID,
  p_emoji     TEXT
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_reactions JSONB;
  v_users     JSONB;
BEGIN
  SELECT reactions INTO v_reactions FROM activity_feed WHERE id = p_feed_id;
  IF v_reactions IS NULL THEN
    RETURN '{}'::JSONB;
  END IF;

  -- Get current list for this emoji (default empty array)
  v_users := COALESCE(v_reactions -> p_emoji, '[]'::JSONB);

  -- Toggle: remove if present, add if absent
  IF v_users @> to_jsonb(p_user_id::TEXT) THEN
    v_users := (
      SELECT jsonb_agg(u)
      FROM jsonb_array_elements_text(v_users) AS u
      WHERE u <> p_user_id::TEXT
    );
    IF v_users IS NULL THEN v_users := '[]'::JSONB; END IF;
  ELSE
    v_users := v_users || to_jsonb(p_user_id::TEXT);
  END IF;

  -- Update reactions object
  IF jsonb_array_length(v_users) = 0 THEN
    v_reactions := v_reactions - p_emoji;
  ELSE
    v_reactions := jsonb_set(v_reactions, ARRAY[p_emoji], v_users);
  END IF;

  UPDATE activity_feed SET reactions = v_reactions WHERE id = p_feed_id;
  RETURN v_reactions;
END;
$$;

-- 4. Storage bucket for avatars (run once)
-- Create bucket via Dashboard: Storage → New bucket → "avatars" → Public: ON
-- Or via SQL (requires storage extension):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
-- ON CONFLICT (id) DO NOTHING;

-- 5. RLS policy: allow authenticated users to upload their own avatar
-- (Run these only after creating the 'avatars' bucket in Dashboard)
-- CREATE POLICY "Users can upload own avatar"
--   ON storage.objects FOR INSERT TO authenticated
--   WITH CHECK (bucket_id = 'avatars' AND name = auth.uid()::text || '/avatar');
-- CREATE POLICY "Avatars are publicly readable"
--   ON storage.objects FOR SELECT TO public
--   USING (bucket_id = 'avatars');
-- CREATE POLICY "Users can update own avatar"
--   ON storage.objects FOR UPDATE TO authenticated
--   USING (bucket_id = 'avatars' AND name = auth.uid()::text || '/avatar');
