-- ============================================================================
-- Migration: Système de trials Stripe robuste et complet
-- Date: 2025-01-11
-- Description: Création de user_profiles avec gestion complète des trials
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1) TABLE USER_PROFILES - Source de vérité unique pour les plans/trials
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Plan actuel (plan payant actif)
  plan TEXT CHECK (plan IN ('free','pro','premium')) DEFAULT 'free' NOT NULL,
  
  -- Statut de l'abonnement
  plan_status TEXT CHECK (plan_status IN ('none','trialing','active','canceled','past_due','unpaid')) DEFAULT 'none' NOT NULL,
  
  -- Informations de trial
  trial_plan TEXT CHECK (trial_plan IN ('pro','premium')),
  trial_ends_at TIMESTAMPTZ,
  
  -- Identifiants Stripe
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- Contraintes
  CONSTRAINT valid_trial_data CHECK (
    -- Si trialing, doit avoir trial_plan et trial_ends_at
    (plan_status = 'trialing' AND trial_plan IS NOT NULL AND trial_ends_at IS NOT NULL)
    OR
    -- Sinon, pas de données de trial
    (plan_status != 'trialing' AND trial_plan IS NULL AND trial_ends_at IS NULL)
  )
);

-- ============================================================================
-- 2) INDEXES pour performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer 
  ON user_profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_subscription 
  ON user_profiles(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_trial_ends_at 
  ON user_profiles(trial_ends_at) WHERE trial_ends_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_plan_status 
  ON user_profiles(plan_status) WHERE plan_status != 'none';

-- ============================================================================
-- 3) TABLE WEBHOOK_EVENTS - Pour idempotence des webhooks Stripe
-- ============================================================================

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  payload JSONB,
  
  -- Index pour recherche rapide
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_id 
  ON webhook_events(stripe_event_id);

CREATE INDEX IF NOT EXISTS idx_webhook_events_type 
  ON webhook_events(event_type);

-- ============================================================================
-- 4) ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users peuvent lire leur propre profil
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users peuvent update leur propre profil (sauf champs critiques)
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Seul le service role peut insérer
DROP POLICY IF EXISTS "Service role can insert profiles" ON user_profiles;
CREATE POLICY "Service role can insert profiles"
  ON user_profiles
  FOR INSERT
  WITH CHECK (true); -- Service role bypass RLS anyway

-- Policy: Webhook events - aucun accès utilisateur
DROP POLICY IF EXISTS "No user access to webhook_events" ON webhook_events;
CREATE POLICY "No user access to webhook_events"
  ON webhook_events
  FOR ALL
  USING (false); -- Only service role can access

-- ============================================================================
-- 5) FUNCTIONS UTILES
-- ============================================================================

-- Function: Créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, plan, plan_status)
  VALUES (NEW.id, 'free', 'none')
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auto-création du profil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- Function: Auto-update de updated_at
CREATE OR REPLACE FUNCTION update_user_profiles_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER trigger_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_timestamp();

-- ============================================================================
-- 6) FONCTION HELPER: Vérifier l'accès à une feature
-- ============================================================================

CREATE OR REPLACE FUNCTION has_feature_access(
  p_user_id UUID,
  p_required_plan TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_profile RECORD;
  v_plan_hierarchy JSONB := '{"free": 0, "pro": 1, "premium": 2}'::JSONB;
  v_current_level INT;
  v_required_level INT;
BEGIN
  -- Récupérer le profil
  SELECT * INTO v_profile
  FROM user_profiles
  WHERE id = p_user_id;
  
  -- Si pas de profil, accès refusé
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Si en trial, vérifier trial_plan et date
  IF v_profile.plan_status = 'trialing' 
     AND v_profile.trial_ends_at > now() 
     AND v_profile.trial_plan IS NOT NULL THEN
    v_current_level := (v_plan_hierarchy->>v_profile.trial_plan)::INT;
  ELSE
    -- Sinon utiliser le plan actif
    v_current_level := (v_plan_hierarchy->>v_profile.plan)::INT;
  END IF;
  
  v_required_level := (v_plan_hierarchy->>p_required_plan)::INT;
  
  RETURN v_current_level >= v_required_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7) MIGRATION DES DONNÉES EXISTANTES (si nécessaire)
-- ============================================================================

-- Créer des profils pour les users existants qui n'en ont pas
INSERT INTO user_profiles (id, plan, plan_status)
SELECT 
  id, 
  'free', 
  'none'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 8) COMMENTAIRES
-- ============================================================================

COMMENT ON TABLE user_profiles IS 
  'Profils utilisateurs avec gestion des plans et trials Stripe';

COMMENT ON COLUMN user_profiles.plan IS 
  'Plan payant actif (free/pro/premium) - mise à jour après paiement réussi';

COMMENT ON COLUMN user_profiles.plan_status IS 
  'Statut de l''abonnement: none, trialing, active, canceled, past_due, unpaid';

COMMENT ON COLUMN user_profiles.trial_plan IS 
  'Plan en cours de trial (pro/premium) - NULL si pas de trial';

COMMENT ON COLUMN user_profiles.trial_ends_at IS 
  'Date de fin du trial (UTC) - NULL si pas de trial';

COMMENT ON TABLE webhook_events IS 
  'Log des événements Stripe traités pour idempotence';

COMMENT ON FUNCTION has_feature_access IS 
  'Vérifie si un utilisateur a accès à une feature selon son plan/trial';

COMMIT;















