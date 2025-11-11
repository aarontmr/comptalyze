-- ==============================================================================
-- MIGRATION : MARKETING ATTRIBUTION & SIGNUPS TRACKING
-- ==============================================================================
-- Description : Ajoute les champs d'attribution marketing (UTM, gclid, fbclid)
--               et crée la table marketing_signups pour tracker les conversions
-- Author : Comptalyze Growth Team
-- Date : 2025-01-11
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- 1) AJOUTER LES CHAMPS UTM À user_profiles
-- ==============================================================================

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS utm_source TEXT,
ADD COLUMN IF NOT EXISTS utm_medium TEXT,
ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
ADD COLUMN IF NOT EXISTS utm_content TEXT,
ADD COLUMN IF NOT EXISTS utm_term TEXT,
ADD COLUMN IF NOT EXISTS gclid TEXT,
ADD COLUMN IF NOT EXISTS fbclid TEXT,
ADD COLUMN IF NOT EXISTS landing_slug TEXT,
ADD COLUMN IF NOT EXISTS referrer TEXT;

-- Index pour recherche rapide par source
CREATE INDEX IF NOT EXISTS idx_user_profiles_utm_source ON user_profiles(utm_source);
CREATE INDEX IF NOT EXISTS idx_user_profiles_utm_campaign ON user_profiles(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_user_profiles_gclid ON user_profiles(gclid);

-- ==============================================================================
-- 2) CRÉER LA TABLE marketing_signups
-- ==============================================================================

CREATE TABLE IF NOT EXISTS marketing_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  gclid TEXT,
  fbclid TEXT,
  landing_slug TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour analytics et reporting
CREATE INDEX IF NOT EXISTS idx_marketing_signups_created_at ON marketing_signups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketing_signups_utm_source ON marketing_signups(utm_source);
CREATE INDEX IF NOT EXISTS idx_marketing_signups_utm_campaign ON marketing_signups(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_marketing_signups_gclid ON marketing_signups(gclid);
CREATE INDEX IF NOT EXISTS idx_marketing_signups_landing_slug ON marketing_signups(landing_slug);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_marketing_signups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_marketing_signups_updated_at
  BEFORE UPDATE ON marketing_signups
  FOR EACH ROW
  EXECUTE FUNCTION update_marketing_signups_updated_at();

-- ==============================================================================
-- 3) RLS (Row Level Security) POLICIES
-- ==============================================================================

-- Enable RLS
ALTER TABLE marketing_signups ENABLE ROW LEVEL SECURITY;

-- Policy : les utilisateurs ne peuvent lire que leurs propres données
CREATE POLICY "Users can read own marketing_signups"
  ON marketing_signups
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy : seul le service role peut insérer (via server actions)
-- Pas de policy SELECT publique, insertion seulement via backend
CREATE POLICY "Service role can insert marketing_signups"
  ON marketing_signups
  FOR INSERT
  WITH CHECK (true);

-- Policy : seul le service role peut UPDATE
CREATE POLICY "Service role can update marketing_signups"
  ON marketing_signups
  FOR UPDATE
  USING (true);

-- ==============================================================================
-- 4) GRANT PERMISSIONS
-- ==============================================================================

-- Grant au service role pour les opérations backend
GRANT ALL ON marketing_signups TO service_role;

-- Grant lecture aux utilisateurs authentifiés (via RLS)
GRANT SELECT ON marketing_signups TO authenticated;

-- ==============================================================================
-- 5) COMMENTAIRES POUR DOCUMENTATION
-- ==============================================================================

COMMENT ON TABLE marketing_signups IS 'Table de tracking des signups avec attribution marketing (UTM, gclid, fbclid)';
COMMENT ON COLUMN marketing_signups.gclid IS 'Google Click ID - pour tracking Google Ads';
COMMENT ON COLUMN marketing_signups.fbclid IS 'Facebook Click ID - pour tracking Meta Ads';
COMMENT ON COLUMN marketing_signups.landing_slug IS 'Page de destination initiale (ex: /simulateur-urssaf)';
COMMENT ON COLUMN marketing_signups.referrer IS 'URL du referrer HTTP';

COMMENT ON COLUMN user_profiles.utm_source IS 'Source marketing (ex: google, facebook, newsletter)';
COMMENT ON COLUMN user_profiles.utm_medium IS 'Medium marketing (ex: cpc, email, social)';
COMMENT ON COLUMN user_profiles.utm_campaign IS 'Nom de la campagne marketing';
COMMENT ON COLUMN user_profiles.gclid IS 'Google Click ID pour attribution Google Ads';
COMMENT ON COLUMN user_profiles.fbclid IS 'Facebook Click ID pour attribution Meta Ads';

-- ==============================================================================
-- 6) EXEMPLE D'INSERTION (pour test)
-- ==============================================================================

-- Décommentez pour tester :
/*
INSERT INTO marketing_signups (
  email, 
  utm_source, 
  utm_medium, 
  utm_campaign, 
  gclid, 
  landing_slug
) VALUES (
  'test@example.com',
  'google',
  'cpc',
  'simulateur-urssaf-lancement',
  'Cj0KCQiA1234...',
  '/simulateur-urssaf'
);
*/

COMMIT;

-- ==============================================================================
-- ROLLBACK (en cas d'erreur)
-- ==============================================================================
-- Si la migration échoue, exécutez ce script :
/*
BEGIN;
DROP TABLE IF EXISTS marketing_signups CASCADE;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS utm_source;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS utm_medium;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS utm_campaign;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS utm_content;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS utm_term;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS gclid;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS fbclid;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS landing_slug;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS referrer;
COMMIT;
*/

