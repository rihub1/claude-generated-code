-- ProposalKit Database Schema
-- Run with: psql $DATABASE_URL < schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Users (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Brand Kits
CREATE TABLE IF NOT EXISTS public.brand_kits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  agency_name TEXT NOT NULL DEFAULT '',
  logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#3B82F6',
  tone_of_voice TEXT NOT NULL DEFAULT 'professional',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT brand_kits_user_id_unique UNIQUE (user_id)
);

-- Proposals
CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'sent')),
  proposal_json JSONB,
  rendered_html TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Templates
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general',
  proposal_json JSONB NOT NULL,
  is_builtin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Files
CREATE TABLE IF NOT EXISTS public.files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS proposals_user_id_idx ON public.proposals(user_id);
CREATE INDEX IF NOT EXISTS proposals_created_at_idx ON public.proposals(created_at DESC);
CREATE INDEX IF NOT EXISTS templates_is_builtin_idx ON public.templates(is_builtin);
CREATE INDEX IF NOT EXISTS files_user_id_idx ON public.files(user_id);
CREATE INDEX IF NOT EXISTS files_proposal_id_idx ON public.files(proposal_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER proposals_updated_at
  BEFORE UPDATE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER brand_kits_updated_at
  BEFORE UPDATE ON public.brand_kits
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Users policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Brand kits policies
DROP POLICY IF EXISTS "Users can view own brand kit" ON public.brand_kits;
CREATE POLICY "Users can view own brand kit"
  ON public.brand_kits FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own brand kit" ON public.brand_kits;
CREATE POLICY "Users can insert own brand kit"
  ON public.brand_kits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own brand kit" ON public.brand_kits;
CREATE POLICY "Users can update own brand kit"
  ON public.brand_kits FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own brand kit" ON public.brand_kits;
CREATE POLICY "Users can delete own brand kit"
  ON public.brand_kits FOR DELETE
  USING (auth.uid() = user_id);

-- Proposals policies
DROP POLICY IF EXISTS "Users can view own proposals" ON public.proposals;
CREATE POLICY "Users can view own proposals"
  ON public.proposals FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own proposals" ON public.proposals;
CREATE POLICY "Users can insert own proposals"
  ON public.proposals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own proposals" ON public.proposals;
CREATE POLICY "Users can update own proposals"
  ON public.proposals FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own proposals" ON public.proposals;
CREATE POLICY "Users can delete own proposals"
  ON public.proposals FOR DELETE
  USING (auth.uid() = user_id);

-- Templates policies (built-ins readable by all authenticated)
DROP POLICY IF EXISTS "Authenticated users can view builtin templates" ON public.templates;
CREATE POLICY "Authenticated users can view builtin templates"
  ON public.templates FOR SELECT
  USING (is_builtin = true AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can view own templates" ON public.templates;
CREATE POLICY "Users can view own templates"
  ON public.templates FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own templates" ON public.templates;
CREATE POLICY "Users can insert own templates"
  ON public.templates FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_builtin = false);

DROP POLICY IF EXISTS "Users can update own templates" ON public.templates;
CREATE POLICY "Users can update own templates"
  ON public.templates FOR UPDATE
  USING (auth.uid() = user_id AND is_builtin = false);

DROP POLICY IF EXISTS "Users can delete own templates" ON public.templates;
CREATE POLICY "Users can delete own templates"
  ON public.templates FOR DELETE
  USING (auth.uid() = user_id AND is_builtin = false);

-- Files policies
DROP POLICY IF EXISTS "Users can view own files" ON public.files;
CREATE POLICY "Users can view own files"
  ON public.files FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own files" ON public.files;
CREATE POLICY "Users can insert own files"
  ON public.files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own files" ON public.files;
CREATE POLICY "Users can delete own files"
  ON public.files FOR DELETE
  USING (auth.uid() = user_id);
