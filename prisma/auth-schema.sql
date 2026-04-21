-- BetterAuth required tables
-- Run this against your PostgreSQL database

-- Session table (BetterAuth manages this)
CREATE TABLE IF NOT EXISTS "session" (
  "id"          TEXT        NOT NULL PRIMARY KEY,
  "expires_at"  TIMESTAMPTZ NOT NULL,
  "token"       TEXT        NOT NULL UNIQUE,
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "ip_address"  TEXT,
  "user_agent"  TEXT,
  "user_id"     UUID        NOT NULL REFERENCES "users"("id") ON DELETE CASCADE
);

-- Account table (stores hashed credentials per provider)
CREATE TABLE IF NOT EXISTS "account" (
  "id"                   TEXT        NOT NULL PRIMARY KEY,
  "account_id"           TEXT        NOT NULL,
  "provider_id"          TEXT        NOT NULL,
  "user_id"              UUID        NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "access_token"         TEXT,
  "refresh_token"        TEXT,
  "id_token"             TEXT,
  "access_token_expires_at" TIMESTAMPTZ,
  "refresh_token_expires_at" TIMESTAMPTZ,
  "scope"                TEXT,
  "password"             TEXT,
  "created_at"           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Verification table (for email verification / password reset)
CREATE TABLE IF NOT EXISTS "verification" (
  "id"          TEXT        NOT NULL PRIMARY KEY,
  "identifier"  TEXT        NOT NULL,
  "value"       TEXT        NOT NULL,
  "expires_at"  TIMESTAMPTZ NOT NULL,
  "created_at"  TIMESTAMPTZ,
  "updated_at"  TIMESTAMPTZ
);

-- Add emailVerified column to existing users table if not exists
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "image" TEXT;
