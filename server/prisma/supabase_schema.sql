-- ====================================================================
-- Smart Campus Lost & Found System - Supabase PostgreSQL Schema
-- Project ID: uzgklxytaixdousaxhtb
-- Region: ap-northeast-1 (Tokyo)
-- ====================================================================

-- Enable pgcrypto / uuid-ossp if needed (built-in gen_random_uuid() is active in Postgres 13+)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firstname VARCHAR(255) NOT NULL,
  lastname VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' NOT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  profile_image TEXT DEFAULT NULL,
  is_blocked BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL,
  location VARCHAR(255) NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  image_url TEXT DEFAULT NULL,
  posted_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' NOT NULL,
  verified_by_admin BOOLEAN DEFAULT FALSE NOT NULL,
  verified_by UUID DEFAULT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  keywords TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
  coordinates_lat DOUBLE PRECISION DEFAULT NULL,
  coordinates_lng DOUBLE PRECISION DEFAULT NULL,
  is_flagged BOOLEAN DEFAULT FALSE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. MATCHES TABLE
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lost_item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  found_item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  match_score DOUBLE PRECISION NOT NULL,
  match_reason TEXT DEFAULT NULL,
  status VARCHAR(50) DEFAULT 'suggested' NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. CLAIMS TABLE
CREATE TABLE IF NOT EXISTS public.claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  match_id UUID DEFAULT NULL REFERENCES public.matches(id) ON DELETE SET NULL,
  claimed_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  proof_images TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
  contact_info VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' NOT NULL,
  reviewed_by UUID DEFAULT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  review_note TEXT DEFAULT NULL,
  resolved_at TIMESTAMPTZ DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_items_posted_by ON public.items(posted_by);
CREATE INDEX IF NOT EXISTS idx_items_status ON public.items(status);
CREATE INDEX IF NOT EXISTS idx_items_type ON public.items(type);
CREATE INDEX IF NOT EXISTS idx_items_category ON public.items(category);
CREATE INDEX IF NOT EXISTS idx_items_is_active ON public.items(is_active);
CREATE INDEX IF NOT EXISTS idx_matches_lost_item ON public.matches(lost_item_id);
CREATE INDEX IF NOT EXISTS idx_matches_found_item ON public.matches(found_item_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_claims_item_id ON public.claims(item_id);
CREATE INDEX IF NOT EXISTS idx_claims_claimed_by ON public.claims(claimed_by);
CREATE INDEX IF NOT EXISTS idx_claims_match_id ON public.claims(match_id);
