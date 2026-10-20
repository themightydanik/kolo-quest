-- ============================================================
-- KOLO QUEST KIDS — Secure Auth Migration
-- Run in: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- 1. Add auth_id column to users table (links parent to Supabase Auth)
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);

-- 2. Add email column to users table (for parents)
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;

-- 3. Install pgcrypto extension (for bcrypt — usually already enabled)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 4. Function: hash a password with bcrypt (used when creating a child account)
CREATE OR REPLACE FUNCTION hash_password(p_password TEXT)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT crypt(p_password, gen_salt('bf', 10));
$$;

-- 5. Function: verify child login (bcrypt check)
-- Replaces the old verify_login that compared plaintext
-- DROP first because CREATE OR REPLACE cannot change return-type signature
DROP FUNCTION IF EXISTS verify_login(text, text);
CREATE OR REPLACE FUNCTION verify_login(p_login TEXT, p_password TEXT)
RETURNS TABLE(id UUID, login TEXT, display_name TEXT, role TEXT, family_id UUID, avatar_emoji TEXT, points INTEGER, total_points_earned INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id, u.login, u.display_name, u.role, u.family_id,
    u.avatar_emoji, u.points, u.total_points_earned
  FROM users u
  WHERE
    u.login = p_login
    AND u.role = 'child'
    AND (
      -- Support both bcrypt hashes and legacy plaintext during migration
      u.password_hash = crypt(p_password, u.password_hash)
      OR u.password_hash = p_password  -- legacy plaintext fallback
    );
END;
$$;

-- 6. Function: create child account with hashed password
-- Called by parent when adding a child (replaces direct INSERT from client)
CREATE OR REPLACE FUNCTION create_child_account(
  p_family_id UUID,
  p_display_name TEXT,
  p_login TEXT,
  p_password TEXT,
  p_avatar_emoji TEXT DEFAULT '🦊'
)
RETURNS TABLE(id UUID, login TEXT, display_name TEXT, avatar_emoji TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_hashed TEXT;
  v_id UUID;
BEGIN
  -- Hash the password
  v_hashed := crypt(p_password, gen_salt('bf', 10));

  -- Check login uniqueness
  IF EXISTS (SELECT 1 FROM users WHERE users.login = p_login) THEN
    RAISE EXCEPTION 'login_taken';
  END IF;

  -- Insert child
  INSERT INTO users (login, password_hash, display_name, role, family_id, avatar_emoji, points, total_points_earned)
  VALUES (p_login, v_hashed, p_display_name, 'child', p_family_id, p_avatar_emoji, 0, 0)
  RETURNING users.id INTO v_id;

  RETURN QUERY SELECT u.id, u.login, u.display_name, u.avatar_emoji
  FROM users u WHERE u.id = v_id;
END;
$$;

-- 7. Function: update child credentials (hashes new password if provided)
CREATE OR REPLACE FUNCTION update_child_credentials(
  p_child_id UUID,
  p_display_name TEXT,
  p_login TEXT,
  p_password TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_password IS NOT NULL AND p_password != '' THEN
    UPDATE users SET
      display_name = p_display_name,
      login = p_login,
      password_hash = crypt(p_password, gen_salt('bf', 10))
    WHERE id = p_child_id AND role = 'child';
  ELSE
    UPDATE users SET
      display_name = p_display_name,
      login = p_login
    WHERE id = p_child_id AND role = 'child';
  END IF;
END;
$$;

-- 8. Function: link existing parent to Supabase Auth after migration
-- Called once when old parent sets their email for the first time
CREATE OR REPLACE FUNCTION link_parent_auth(p_user_id UUID, p_auth_id UUID, p_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE users SET auth_id = p_auth_id, email = p_email
  WHERE id = p_user_id AND role = 'parent';
END;
$$;

-- ============================================================
-- DONE. After running this:
-- 1. pgcrypto is enabled
-- 2. users table has auth_id + email columns
-- 3. verify_login supports both bcrypt and legacy plaintext
-- 4. New child accounts will use bcrypt
-- 5. Parent login goes through Supabase Auth (no DB changes needed)
-- ============================================================
