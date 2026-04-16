-- ============================================================
-- Childminder Invoice — full database schema
-- Run this once against your Vercel Postgres (Neon) database.
--
-- Vercel Dashboard → Storage → your DB → Query tab → paste & run
-- ============================================================

-- ── NextAuth required tables ─────────────────────────────────

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT        NOT NULL,
  token      TEXT        NOT NULL,
  expires    TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier, token)
);

CREATE TABLE IF NOT EXISTS accounts (
  id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"            TEXT        NOT NULL,
  type                TEXT        NOT NULL,
  provider            TEXT        NOT NULL,
  "providerAccountId" TEXT        NOT NULL,
  refresh_token       TEXT,
  access_token        TEXT,
  expires_at          BIGINT,
  id_token            TEXT,
  scope               TEXT,
  session_state       TEXT,
  token_type          TEXT,
  UNIQUE (provider, "providerAccountId")
);

CREATE TABLE IF NOT EXISTS sessions (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"       TEXT        NOT NULL,
  expires        TIMESTAMPTZ NOT NULL,
  "sessionToken" TEXT        NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name            TEXT,
  email           TEXT UNIQUE,
  "emailVerified" TIMESTAMPTZ,
  image           TEXT
);

-- ── App tables ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS provider_settings (
  id                       TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id                  TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name                     TEXT DEFAULT '',
  business_name            TEXT DEFAULT '',
  address                  TEXT DEFAULT '',
  email                    TEXT DEFAULT '',
  phone                    TEXT DEFAULT '',
  ofsted_number            TEXT DEFAULT '',
  hourly_rate              NUMERIC(10,2) DEFAULT 7.00,
  bank_account_name        TEXT DEFAULT '',
  sort_code                TEXT DEFAULT '',
  account_number           TEXT DEFAULT '',
  payment_reference_format TEXT DEFAULT '{SURNAME}-{MON}{YEAR}',
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS families (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  surname     TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  address     TEXT DEFAULT '',
  email       TEXT DEFAULT '',
  phone       TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS children (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  family_id     TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  date_of_birth TEXT DEFAULT '',
  funding_type  TEXT NOT NULL DEFAULT 'none',
  -- schedule stored as JSONB:
  -- Simple:   {"mode":"simple","days":[true,true,true,true,true],"startTime":"08:00","endTime":"18:00"}
  -- Advanced: {"mode":"advanced","days":[{"enabled":true,"startTime":"08:00","endTime":"18:00"}, ...]}
  schedule      JSONB NOT NULL DEFAULT '{"mode":"simple","days":[true,true,true,true,true],"startTime":"08:00","endTime":"18:00"}',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS families_user_id_idx  ON families(user_id);
CREATE INDEX IF NOT EXISTS children_family_id_idx ON children(family_id);
