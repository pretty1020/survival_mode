-- Survival Mode Budget Challenge - Supabase Schema
-- Run this in Supabase SQL Editor to create tables
-- For anonymous auth, enable it in Authentication > Providers

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Budget settings (user_id from auth.users)
CREATE TABLE IF NOT EXISTS budget_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_budget DECIMAL(12,2) DEFAULT 500,
  weekly_budget DECIMAL(12,2) DEFAULT 3500,
  monthly_budget DECIMAL(12,2) DEFAULT 15000,
  budget_period TEXT DEFAULT 'daily' CHECK (budget_period IN ('daily', 'weekly', 'monthly')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Categories (null user_id = default, else custom)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '💰',
  is_default BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_user_name ON categories(COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid), name);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  category_name TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  note TEXT,
  emoji TEXT,
  date_key DATE NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, date_key);

-- Financial events
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  impact DECIMAL(12,2) NOT NULL,
  emoji TEXT,
  date_key DATE NOT NULL,
  timestamp BIGINT NOT NULL,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_user_date ON events(user_id, date_key);

-- Streaks
CREATE TABLE IF NOT EXISTS streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  days_survived INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  last_reset_daily DATE,
  last_reset_weekly DATE,
  last_reset_monthly DATE,
  badges TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historical stats (premium)
CREATE TABLE IF NOT EXISTS historical_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
  period_key TEXT NOT NULL,
  total_spent DECIMAL(12,2) DEFAULT 0,
  budget_amount DECIMAL(12,2) DEFAULT 0,
  survived BOOLEAN DEFAULT true,
  category_breakdown JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, period_type, period_key)
);
