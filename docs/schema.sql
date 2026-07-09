-- ─────────────────────────────────────────
-- HOUSEHOLDS
-- ─────────────────────────────────────────
CREATE TABLE households (
  household_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          TEXT NOT NULL
);

-- ─────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────
CREATE TABLE users (
  user_id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  auth_id         TEXT NOT NULL UNIQUE, -- FK to neon_auth.users_sync.id
  display_name    TEXT,
  email           TEXT NOT NULL,
  email_validated BOOLEAN DEFAULT FALSE,
  household_id    BIGINT REFERENCES households(household_id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
  -- no password field - Google OAuth only, auth handled by Neon Auth
);

-- ─────────────────────────────────────────
-- LOCATIONS
-- ─────────────────────────────────────────
CREATE TYPE location_category AS ENUM (
  'household', 'vehicle', 'external', 'unknown'
);

CREATE TABLE locations (
  location_id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name               TEXT NOT NULL,
  parent_location_id BIGINT REFERENCES locations(location_id),
  floor              INT,   -- 0 = ground, 1 = up, -1 = basement, NULL = n/a
  category           location_category NOT NULL DEFAULT 'household',
  map_x              NUMERIC,  -- nullable until phase 2 map feature
  map_y              NUMERIC,
  household_id       BIGINT REFERENCES households(household_id)
);

-- ─────────────────────────────────────────
-- ITEMS
-- ─────────────────────────────────────────
CREATE TYPE item_status AS ENUM (
  'located', 'missing', 'in_pile', 'outgoing'
);

CREATE TABLE items (
  item_id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name           TEXT NOT NULL,
  status         item_status NOT NULL DEFAULT 'located',
  location_id    BIGINT REFERENCES locations(location_id),
  parent_item_id BIGINT REFERENCES items(item_id), -- for part/whole relationships
  notes          TEXT,
  household_id   BIGINT REFERENCES households(household_id),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- MISSING ITEMS
-- ─────────────────────────────────────────
CREATE TYPE missing_status AS ENUM (
  'searching', 'found', 'gave_up'
);

CREATE TABLE missing_items (
  missing_id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  item_id           BIGINT REFERENCES items(item_id), -- nullable - may not be a catalogued item
  name              TEXT NOT NULL,                    -- freeform, in case item_id is null
  last_location_id  BIGINT REFERENCES locations(location_id),
  last_seen_by      TEXT,
  last_seen_date    DATE,
  places_searched   TEXT,
  urgency           INT DEFAULT 2,  -- 1 low, 2 medium, 3 urgent (crying child)
  status            missing_status NOT NULL DEFAULT 'searching',
  found_date        DATE,
  found_how         TEXT,           -- "in a pile", "exactly where I checked"
  household_id      BIGINT REFERENCES households(household_id),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- PILES
-- ─────────────────────────────────────────
CREATE TYPE pile_milestone AS ENUM (
  'identified',
  'home_found',
  'put_away',
  'can_see_bottom',
  'defeated'
);

CREATE TABLE piles (
  pile_id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  location_id      BIGINT REFERENCES locations(location_id),
  photo_key        TEXT,             -- Cloudflare R2 object key
  milestone        pile_milestone NOT NULL DEFAULT 'identified',
  reminder_count   INT DEFAULT 0,
  next_checkin     TIMESTAMPTZ,
  resolved_at      TIMESTAMPTZ,      -- set when milestone = 'defeated'
  epitaph          TEXT,             -- auto-generated from vision API item list for graveyard
  household_id     BIGINT REFERENCES households(household_id),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- PILE ITEMS (partial - vision API identified)
-- ─────────────────────────────────────────
CREATE TABLE pile_items (
  pile_id     BIGINT REFERENCES piles(pile_id),
  item_id     BIGINT REFERENCES items(item_id),  -- nullable
  name        TEXT NOT NULL,                      -- as identified by vision API
  confidence  NUMERIC,                            -- 0-1
  PRIMARY KEY (pile_id, name)                     -- composite PK on pile + name
);

-- ─────────────────────────────────────────
-- PILE REMINDERS
-- ─────────────────────────────────────────
CREATE TABLE pile_reminders (
  reminder_id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pile_id          BIGINT REFERENCES piles(pile_id),
  scheduled_at     TIMESTAMPTZ NOT NULL,
  fired_at         TIMESTAMPTZ,
  acknowledged_at  TIMESTAMPTZ,
  buddy_escalated  BOOLEAN DEFAULT FALSE
);

-- ─────────────────────────────────────────
-- STUCK ITEM DIAGNOSIS
-- ─────────────────────────────────────────
CREATE TYPE stuck_reason AS ENUM (
  'gift_guilt',
  'belongs_to_other',
  'destination_occupied',
  'needs_container',
  'needs_task_first',
  'other'
);

CREATE TYPE plan_status AS ENUM (
  'pending', 'accepted', 'regenerated', 'manually_edited'
);

CREATE TABLE stuck_items (
  stuck_id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pile_id             BIGINT REFERENCES piles(pile_id),
  item_name           TEXT NOT NULL,
  reason              stuck_reason,
  reason_freetext     TEXT,           -- only populated when reason = 'other'
  ai_plan             TEXT,
  plan_status         plan_status DEFAULT 'pending',
  regeneration_count  INT DEFAULT 0,  -- hard cap at 3
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- OUTGOING ITEMS
-- ─────────────────────────────────────────
CREATE TYPE outgoing_disposition AS ENUM (
  'dump', 'donate', 'sell'
);

CREATE TYPE haul_milestone AS ENUM (
  'bagged', 'in_car', 'scheduled', 'done'
);

CREATE TABLE outgoing_items (
  outgoing_id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  item_id       BIGINT REFERENCES items(item_id),
  name          TEXT NOT NULL,
  disposition   outgoing_disposition NOT NULL,
  drop_off_id   BIGINT,               -- FK to drop_off_days, added after that table
  flagged_at    TIMESTAMPTZ DEFAULT NOW(),
  household_id  BIGINT REFERENCES households(household_id)
);

CREATE TABLE drop_off_days (
  drop_off_id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  scheduled_date DATE,
  milestone      haul_milestone NOT NULL DEFAULT 'bagged',
  completed_at   TIMESTAMPTZ,
  household_id   BIGINT REFERENCES households(household_id)
);

-- add FK now that drop_off_days exists
ALTER TABLE outgoing_items
  ADD CONSTRAINT fk_drop_off
  FOREIGN KEY (drop_off_id) REFERENCES drop_off_days(drop_off_id);

-- ─────────────────────────────────────────
-- BUDDIES
-- ─────────────────────────────────────────
CREATE TABLE buddies (
  buddy_id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id       BIGINT REFERENCES users(user_id),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  timezone      TEXT,
  send_photos   BOOLEAN DEFAULT FALSE,
  verified      BOOLEAN DEFAULT FALSE,
  verified_at   TIMESTAMPTZ,
  household_id  BIGINT REFERENCES households(household_id)
);

-- ─────────────────────────────────────────
-- EMAIL VALIDATIONS (buddy opt-in)
-- ─────────────────────────────────────────
CREATE TABLE email_validations (
  validation_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  buddy_id       BIGINT REFERENCES buddies(buddy_id),
  token          TEXT NOT NULL UNIQUE,  -- the link token emailed to the buddy
  first_sent_at  TIMESTAMPTZ DEFAULT NOW(),
  last_sent_at   TIMESTAMPTZ,
  validated_at   TIMESTAMPTZ
);

-- ─────────────────────────────────────────
-- USER CONFIG
-- ─────────────────────────────────────────
CREATE TABLE user_config (
  config_id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id                BIGINT REFERENCES users(user_id) UNIQUE,
  buddy_id               BIGINT REFERENCES buddies(buddy_id),
  reminder_offset_days   INT DEFAULT 3,
  escalation_threshold   INT DEFAULT 3,  -- missed reminders before buddy added
  rainbow_mode           BOOLEAN DEFAULT FALSE,
  rainbow_unlocked       BOOLEAN DEFAULT FALSE,
  piles_defeated         INT DEFAULT 0,  -- counter for rainbow unlock trigger
  created_at             TIMESTAMPTZ DEFAULT NOW()
);
