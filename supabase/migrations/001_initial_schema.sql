-- supabase/migrations/001_initial_schema.sql
-- ─────────────────────────────────────────────────────────────
-- Swindon Airsoft — Complete database schema
-- Run via Supabase dashboard > SQL Editor
-- ─────────────────────────────────────────────────────────────

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── PROFILES ──────────────────────────────────────────────────
CREATE TABLE profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email             TEXT NOT NULL,
  full_name         TEXT,
  phone             TEXT,
  date_of_birth     DATE,
  address_line1     TEXT,
  address_line2     TEXT,
  city              TEXT,
  postcode          TEXT,
  ukara_number      TEXT,
  ukara_expires_at  TIMESTAMPTZ,
  is_admin          BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Pending profile edits (require admin approval)
CREATE TABLE pending_profile_edits (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name     TEXT,
  phone         TEXT,
  date_of_birth DATE,
  address_line1 TEXT,
  address_line2 TEXT,
  city          TEXT,
  postcode      TEXT,
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  submitted_at  TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at   TIMESTAMPTZ
);

-- ── ADMIN USERS ───────────────────────────────────────────────
CREATE TABLE admin_users (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id   UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── EVENTS ────────────────────────────────────────────────────
CREATE TABLE events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  description   TEXT,
  event_date    TIMESTAMPTZ NOT NULL,
  start_time    TEXT NOT NULL,
  end_time      TEXT NOT NULL,
  location      TEXT NOT NULL DEFAULT 'Swindon Airsoft Site',
  event_type    TEXT NOT NULL CHECK (event_type IN ('outdoor','indoor','milsim','cqb')),
  capacity      INTEGER NOT NULL DEFAULT 40,
  price_walkon  INTEGER NOT NULL,  -- in pence
  price_hire    INTEGER NOT NULL,  -- in pence
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── BOOKINGS ──────────────────────────────────────────────────
CREATE TABLE bookings (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_ref           TEXT NOT NULL UNIQUE DEFAULT UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8)),
  user_id               UUID NOT NULL REFERENCES profiles(id),
  event_id              UUID NOT NULL REFERENCES events(id),
  package_type          TEXT NOT NULL CHECK (package_type IN ('walkon','hire')),
  player_count          INTEGER NOT NULL DEFAULT 1,
  addons                JSONB DEFAULT '[]',
  amount_paid           INTEGER NOT NULL DEFAULT 0,  -- pence
  stripe_session_id     TEXT,
  stripe_payment_intent TEXT,
  status                TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','refunded')),
  cancellation_reason   TEXT,
  cancelled_at          TIMESTAMPTZ,
  moved_at              TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ── GAME DAY LOG (for UKARA eligibility tracking) ─────────────
CREATE TABLE game_day_log (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id      UUID REFERENCES events(id),
  attended_date TIMESTAMPTZ NOT NULL,
  logged_by     UUID REFERENCES profiles(id),  -- admin who logged it
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── WAIVERS ───────────────────────────────────────────────────
CREATE TABLE waivers (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  sections_agreed  JSONB NOT NULL DEFAULT '{}',
  date_of_birth    DATE,
  is_under18       BOOLEAN DEFAULT FALSE,
  parent_data      JSONB,  -- { parentName, parentEmail, parentPhone, parentSignature }
  signed_at        TIMESTAMPTZ,
  status           TEXT DEFAULT 'pending_approval' CHECK (status IN ('pending_approval','approved','rejected')),
  approved_at      TIMESTAMPTZ,
  rejection_reason TEXT,
  submitted_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Pending waiver edits (require admin approval)
CREATE TABLE pending_waiver_edits (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  waiver_id        UUID NOT NULL REFERENCES waivers(id) ON DELETE CASCADE,
  sections_agreed  JSONB NOT NULL DEFAULT '{}',
  date_of_birth    DATE,
  is_under18       BOOLEAN DEFAULT FALSE,
  parent_data      JSONB,
  signed_at        TIMESTAMPTZ,
  status           TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  rejection_reason TEXT,
  submitted_at     TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at      TIMESTAMPTZ
);

-- ── UKARA APPLICATIONS ────────────────────────────────────────
CREATE TABLE ukara_applications (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_payment_intent  TEXT,
  stripe_session_id      TEXT,
  amount_paid            NUMERIC(10,2) DEFAULT 5.00,
  ukara_number           TEXT,
  status                 TEXT DEFAULT 'pending_payment' CHECK (status IN ('pending_payment','pending_review','approved','rejected')),
  rejection_reason       TEXT,
  expires_at             TIMESTAMPTZ,
  applied_at             TIMESTAMPTZ DEFAULT NOW(),
  approved_at            TIMESTAMPTZ,
  reviewed_at            TIMESTAMPTZ
);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────

-- Profiles: users can read/own their own row
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- Events: public read, admin write
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events are public" ON events FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage events" ON events FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- Bookings: users see own, admins see all
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage all bookings" ON bookings FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- Waivers: users see own, admins see all
ALTER TABLE waivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own waiver" ON waivers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins view all waivers" ON waivers FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- Game day log: users read own, admins write
ALTER TABLE game_day_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own game days" ON game_day_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage game days" ON game_day_log FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- UKARA: users see own, admins see all
ALTER TABLE ukara_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own UKARA" ON ukara_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create UKARA application" ON ukara_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage all UKARA" ON ukara_applications FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- ── INDEXES ───────────────────────────────────────────────────
CREATE INDEX idx_bookings_event_id   ON bookings(event_id);
CREATE INDEX idx_bookings_user_id    ON bookings(user_id);
CREATE INDEX idx_bookings_status     ON bookings(status);
CREATE INDEX idx_game_day_user_date  ON game_day_log(user_id, attended_date);
CREATE INDEX idx_events_date         ON events(event_date);
CREATE INDEX idx_waivers_user_id     ON waivers(user_id);
CREATE INDEX idx_ukara_user_id       ON ukara_applications(user_id);

-- ── TRIGGER: auto-update updated_at ───────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER waivers_updated_at  BEFORE UPDATE ON waivers  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── WAIVER ADDITIONS (esign + text fields) ──────────────────
ALTER TABLE waivers ADD COLUMN IF NOT EXISTS text_values   JSONB DEFAULT '{}';
ALTER TABLE waivers ADD COLUMN IF NOT EXISTS esign_name    TEXT;
ALTER TABLE waivers ADD COLUMN IF NOT EXISTS esign_date    TEXT;

ALTER TABLE pending_waiver_edits ADD COLUMN IF NOT EXISTS text_values  JSONB DEFAULT '{}';
ALTER TABLE pending_waiver_edits ADD COLUMN IF NOT EXISTS esign_name   TEXT;
ALTER TABLE pending_waiver_edits ADD COLUMN IF NOT EXISTS esign_date   TEXT;

-- updated_at for bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- ── AUTO-CREATE PROFILE ON SIGNUP (TRIGGER) ──────────────────
-- Backup trigger: creates profile row whenever a new auth user is created
-- This ensures profiles always exist even if the API call fails

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email      = EXCLUDED.email,
    full_name  = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop if exists first, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── ADDITIONAL WAIVERS (extra players on same account) ────────
CREATE TABLE IF NOT EXISTS additional_waivers (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  primary_user_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name        TEXT NOT NULL,
  date_of_birth    DATE NOT NULL,
  relationship     TEXT DEFAULT 'guest',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE additional_waivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own additional waivers" ON additional_waivers FOR ALL USING (auth.uid() = primary_user_id);
CREATE POLICY "Admins manage all additional waivers" ON additional_waivers FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- ── MAPS COLUMNS ON EVENTS ────────────────────────────────────
ALTER TABLE events ADD COLUMN IF NOT EXISTS maps_url   TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS maps_embed TEXT;

-- ── EVENT PACKAGE DETAILS & ADDONS ───────────────────────────
ALTER TABLE events ADD COLUMN IF NOT EXISTS walkon_includes TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS hire_includes   TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS addons_config   TEXT;
