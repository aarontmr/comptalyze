-- ==============================================================================
-- MIGRATION SIMPLIFIÉE : MARKETING_SIGNUPS UNIQUEMENT
-- ==============================================================================
-- Description : Crée uniquement la table marketing_signups pour tracker les conversions
-- Author : Comptalyze Growth Team
-- Date : 2025-11-11
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- CRÉER LA TABLE marketing_signups
-- ==============================================================================

CREATE TABLE IF NOT EXISTS marketing_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
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
CREATE INDEX IF NOT EXISTS idx_marketing_signups_email ON marketing_signups(email);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_marketing_signups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_marketing_signups_updated_at ON marketing_signups;

CREATE TRIGGER trigger_update_marketing_signups_updated_at
  BEFORE UPDATE ON marketing_signups
  FOR EACH ROW
  EXECUTE FUNCTION update_marketing_signups_updated_at();

-- ==============================================================================
-- RLS (Row Level Security) POLICIES
-- ==============================================================================

-- Enable RLS
ALTER TABLE marketing_signups ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can read own marketing_signups" ON marketing_signups;
DROP POLICY IF EXISTS "Service role can insert marketing_signups" ON marketing_signups;
DROP POLICY IF EXISTS "Service role can update marketing_signups" ON marketing_signups;

-- Policy : les utilisateurs peuvent lire leurs propres signups
CREATE POLICY "Users can read own marketing_signups"
  ON marketing_signups
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Policy : insertion publique (pour les server actions)
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
-- GRANT PERMISSIONS
-- ==============================================================================

-- Grant au service role pour les opérations backend
GRANT ALL ON marketing_signups TO service_role;

-- Grant lecture aux utilisateurs authentifiés (via RLS)
GRANT SELECT ON marketing_signups TO authenticated;

-- Grant pour anon (insertion via server actions)
GRANT INSERT ON marketing_signups TO anon;

-- ==============================================================================
-- COMMENTAIRES POUR DOCUMENTATION
-- ==============================================================================

COMMENT ON TABLE marketing_signups IS 'Table de tracking des signups avec attribution marketing (UTM, gclid, fbclid)';
COMMENT ON COLUMN marketing_signups.gclid IS 'Google Click ID - pour tracking Google Ads';
COMMENT ON COLUMN marketing_signups.fbclid IS 'Facebook Click ID - pour tracking Meta Ads';
COMMENT ON COLUMN marketing_signups.landing_slug IS 'Page de destination initiale (ex: /simulateur-urssaf)';
COMMENT ON COLUMN marketing_signups.referrer IS 'URL du referrer HTTP';

-- ==============================================================================
-- TEST D'INSERTION
-- ==============================================================================

-- Test : insérer une row de test
INSERT INTO marketing_signups (
  email, 
  utm_source, 
  utm_medium, 
  utm_campaign, 
  gclid, 
  landing_slug
) VALUES (
  'test-migration@comptalyze.com',
  'google',
  'cpc',
  'test-migration',
  'test-gclid-migration',
  '/simulateur-urssaf'
);

-- Vérifier l'insertion
SELECT * FROM marketing_signups WHERE email = 'test-migration@comptalyze.com';

-- Nettoyage de la row de test (laissée pour vérification)
DELETE FROM marketing_signups WHERE email = 'test-migration@comptalyze.com';

COMMIT;

-- ==============================================================================
-- NOTE : user_profiles sera géré séparément
-- ==============================================================================


