-- ==============================================================================
-- MIGRATION : USER PROFILES & EMAIL VERIFICATION
-- ==============================================================================
-- Description : Crée la table user_profiles (si inexistante) et les colonnes
--               nécessaires pour la vérification d'email personnalisée
-- Author      : Comptalyze Growth Team
-- Date        : 2025-11-11
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- TABLE user_profiles
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  plan TEXT DEFAULT 'free',
  plan_status TEXT DEFAULT 'none',
  trial_plan TEXT,
  trial_ends_at TIMESTAMPTZ,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token TEXT,
  email_verification_sent_at TIMESTAMPTZ
);

-- Index rapides
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email_verified ON public.user_profiles(email_verified);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_profiles_updated_at ON public.user_profiles;

CREATE TRIGGER trigger_update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_user_profiles_updated_at();

-- ==============================================================================
-- TRIGGER : Création automatique lors d'un nouvel utilisateur auth
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.user_profiles.full_name),
        updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_auth_user_created();

-- ==============================================================================
-- RLS & POLICIES
-- ==============================================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

GRANT ALL ON public.user_profiles TO service_role;
GRANT SELECT, UPDATE ON public.user_profiles TO authenticated;

-- Backfill : créer les profils manquants
INSERT INTO public.user_profiles (id, email, full_name, created_at, updated_at)
SELECT
  id,
  email,
  raw_user_meta_data->>'full_name',
  created_at,
  created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- ==============================================================================
-- FIN DE MIGRATION
-- ==============================================================================

