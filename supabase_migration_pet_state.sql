-- ============================================================
-- KOLO QUEST KIDS — Pet State (persistent across devices)
-- Run in: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- 1. Pet state table — one row per child
CREATE TABLE IF NOT EXISTS pet_state (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  family_id       UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,

  -- Stats (0–100)
  hunger          INTEGER NOT NULL DEFAULT 80 CHECK (hunger BETWEEN 0 AND 100),
  happiness       INTEGER NOT NULL DEFAULT 80 CHECK (happiness BETWEEN 0 AND 100),
  cleanliness     INTEGER NOT NULL DEFAULT 80 CHECK (cleanliness BETWEEN 0 AND 100),
  energy          INTEGER NOT NULL DEFAULT 80 CHECK (energy BETWEEN 0 AND 100),

  -- Inventory
  food_basic      INTEGER NOT NULL DEFAULT 3,  -- from task completions (free)
  food_premium    INTEGER NOT NULL DEFAULT 0,  -- bought with points
  toy_basic       INTEGER NOT NULL DEFAULT 2,  -- default toys
  toy_premium     INTEGER NOT NULL DEFAULT 0,  -- bought with points

  -- Customization (JSON arrays of owned item ids)
  owned_outfits   JSONB NOT NULL DEFAULT '["default"]',
  owned_furniture JSONB NOT NULL DEFAULT '{}',
  active_outfit   TEXT NOT NULL DEFAULT 'default',

  last_updated    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(child_id)
);

CREATE INDEX IF NOT EXISTS idx_pet_state_child  ON pet_state(child_id);
CREATE INDEX IF NOT EXISTS idx_pet_state_family ON pet_state(family_id);

-- 2. Pet shop items catalog
CREATE TABLE IF NOT EXISTS pet_shop_items (
  id          TEXT PRIMARY KEY,           -- e.g. 'food_fish', 'outfit_crown'
  category    TEXT NOT NULL,              -- 'food' | 'toy' | 'outfit' | 'furniture'
  name        TEXT NOT NULL,
  emoji       TEXT NOT NULL,
  description TEXT,
  price       INTEGER NOT NULL,           -- points cost (0 = free/task reward)
  stat_boost  JSONB NOT NULL DEFAULT '{}',-- e.g. {"hunger": 30, "happiness": 5}
  is_premium  BOOLEAN NOT NULL DEFAULT false,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

-- 3. Seed shop catalog
INSERT INTO pet_shop_items (id, category, name, emoji, description, price, stat_boost, is_premium, sort_order) VALUES
  -- Basic food (free, earned from tasks)
  ('food_basic',    'food', 'Звичайна їжа',  '🥣', 'Базова порція — нагодує котика', 0,  '{"hunger": 25}', false, 1),
  -- Premium food (buy with points)
  ('food_fish',     'food', 'Свіжа риба',    '🐟', '+40 ситості, +10 радості',       15, '{"hunger": 40, "happiness": 10}', true, 2),
  ('food_cake',     'food', 'Святковий торт','🎂', '+30 ситості, +20 радості',        20, '{"hunger": 30, "happiness": 20}', true, 3),
  ('food_milk',     'food', 'Молоко',        '🥛', '+20 ситості, +15 енергії',         10, '{"hunger": 20, "energy": 15}', true, 4),
  -- Basic toy (free)
  ('toy_yarn',      'toy',  'Клубок ниток',  '🧶', 'Проста іграшка — +15 радості',   0,  '{"happiness": 15}', false, 10),
  -- Premium toys
  ('toy_fish_lure', 'toy',  'Рибка на мотузці','🎣','Улюблена! +30 радості',          25, '{"happiness": 30}', true, 11),
  ('toy_laser',     'toy',  'Лазерна указка','🔴', 'Неможливо зупинитись! +25 радості',20, '{"happiness": 25}', true, 12),
  ('toy_feather',   'toy',  'Пір\'ячко',     '🪶', '+20 радості, -5 енергії',         15, '{"happiness": 20, "energy": -5}', true, 13),
  -- Outfits
  ('outfit_default','outfit','Звичний вигляд','😺','Стандартний образ',               0,  '{}', false, 20),
  ('outfit_crown',  'outfit','Королівська корона','👑','Для справжнього аристократа', 30, '{}', true, 21),
  ('outfit_bow',    'outfit','Бантик',        '🎀', 'Мило та стильно',                20, '{}', true, 22),
  ('outfit_glasses','outfit','Окуляри',       '🕶️','Дуже розумний вигляд',            25, '{}', true, 23),
  ('outfit_hat',    'outfit','Капелюх',       '🎩','Джентльмен/леді',                 25, '{}', true, 24),
  ('outfit_scarf',  'outfit','Шарфик',        '🧣','Тепло та затишно',                15, '{}', true, 25)
ON CONFLICT (id) DO NOTHING;

-- 4. RPC: get or create pet state for child
CREATE OR REPLACE FUNCTION get_or_create_pet(p_child_id UUID, p_family_id UUID)
RETURNS SETOF pet_state
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Try insert (no-op on conflict)
  INSERT INTO pet_state (child_id, family_id)
  VALUES (p_child_id, p_family_id)
  ON CONFLICT (child_id) DO NOTHING;

  RETURN QUERY SELECT * FROM pet_state WHERE child_id = p_child_id;
END;
$$;

-- 5. RPC: update pet stats + last_updated
CREATE OR REPLACE FUNCTION update_pet_stats(
  p_child_id    UUID,
  p_hunger      INTEGER,
  p_happiness   INTEGER,
  p_cleanliness INTEGER,
  p_energy      INTEGER,
  p_food_basic  INTEGER,
  p_food_premium INTEGER,
  p_toy_basic   INTEGER,
  p_toy_premium INTEGER
)
RETURNS SETOF pet_state
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE pet_state SET
    hunger      = GREATEST(0, LEAST(100, p_hunger)),
    happiness   = GREATEST(0, LEAST(100, p_happiness)),
    cleanliness = GREATEST(0, LEAST(100, p_cleanliness)),
    energy      = GREATEST(0, LEAST(100, p_energy)),
    food_basic  = GREATEST(0, p_food_basic),
    food_premium = GREATEST(0, p_food_premium),
    toy_basic   = GREATEST(0, p_toy_basic),
    toy_premium = GREATEST(0, p_toy_premium),
    last_updated = NOW()
  WHERE child_id = p_child_id;

  RETURN QUERY SELECT * FROM pet_state WHERE child_id = p_child_id;
END;
$$;

-- 6. RPC: reward pet food when task approved (called from approve handler)
CREATE OR REPLACE FUNCTION reward_pet_food(p_child_id UUID, p_amount INTEGER DEFAULT 1)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Upsert: create if missing, add food
  INSERT INTO pet_state (child_id, family_id, food_basic)
  SELECT p_child_id, family_id, p_amount
  FROM users WHERE id = p_child_id
  ON CONFLICT (child_id) DO UPDATE
    SET food_basic = pet_state.food_basic + p_amount,
        last_updated = NOW();
END;
$$;

-- 7. RPC: buy shop item with points
CREATE OR REPLACE FUNCTION buy_pet_item(p_child_id UUID, p_item_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_item      pet_shop_items%ROWTYPE;
  v_pet       pet_state%ROWTYPE;
  v_child     users%ROWTYPE;
  v_boost     JSONB;
BEGIN
  SELECT * INTO v_item FROM pet_shop_items WHERE id = p_item_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'item_not_found'; END IF;

  SELECT * INTO v_child FROM users WHERE id = p_child_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'child_not_found'; END IF;

  IF v_child.points < v_item.price THEN
    RAISE EXCEPTION 'insufficient_points';
  END IF;

  SELECT * INTO v_pet FROM pet_state WHERE child_id = p_child_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'pet_not_found'; END IF;

  v_boost := v_item.stat_boost;

  -- Deduct points
  UPDATE users SET points = points - v_item.price WHERE id = p_child_id;

  -- Apply item effect
  IF v_item.category = 'food' THEN
    IF v_item.is_premium THEN
      UPDATE pet_state SET
        food_premium = food_premium + 1,
        last_updated = NOW()
      WHERE child_id = p_child_id;
    ELSE
      UPDATE pet_state SET
        food_basic = food_basic + 1,
        last_updated = NOW()
      WHERE child_id = p_child_id;
    END IF;

  ELSIF v_item.category = 'toy' THEN
    IF v_item.is_premium THEN
      UPDATE pet_state SET
        toy_premium = toy_premium + 1,
        last_updated = NOW()
      WHERE child_id = p_child_id;
    ELSE
      UPDATE pet_state SET
        toy_basic = toy_basic + 1,
        last_updated = NOW()
      WHERE child_id = p_child_id;
    END IF;

  ELSIF v_item.category = 'outfit' THEN
    UPDATE pet_state SET
      owned_outfits = owned_outfits || jsonb_build_array(p_item_id),
      last_updated = NOW()
    WHERE child_id = p_child_id
      AND NOT (owned_outfits @> jsonb_build_array(p_item_id));

  ELSIF v_item.category = 'furniture' THEN
    UPDATE pet_state SET
      owned_furniture = owned_furniture || jsonb_build_object(p_item_id, true),
      last_updated = NOW()
    WHERE child_id = p_child_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'item_id', p_item_id, 'price', v_item.price);
END;
$$;

-- 8. RPC: equip outfit
CREATE OR REPLACE FUNCTION equip_pet_outfit(p_child_id UUID, p_outfit_id TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE pet_state SET active_outfit = p_outfit_id, last_updated = NOW()
  WHERE child_id = p_child_id
    AND (owned_outfits @> jsonb_build_array(p_outfit_id));
END;
$$;

-- ============================================================
-- DONE. After running:
-- 1. pet_state table created
-- 2. pet_shop_items seeded with 15 items
-- 3. RPCs: get_or_create_pet, update_pet_stats, reward_pet_food,
--          buy_pet_item, equip_pet_outfit
-- ============================================================
