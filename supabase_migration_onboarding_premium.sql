-- ============================================
-- MIGRATION : Onboarding Premium + Intégrations
-- Tables pour configuration utilisateur avancée
-- ============================================

-- ============================================
-- Table 1 : Données d'onboarding utilisateur
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_onboarding_data (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Régime fiscal
  ir_mode TEXT CHECK (ir_mode IN ('versement_liberatoire', 'bareme', 'non_soumis', null)),
  ir_rate NUMERIC(5,2), -- Taux VL si applicable (1%, 1.7%, 2.2%)
  
  -- ACRE
  has_acre BOOLEAN DEFAULT false,
  acre_year INTEGER CHECK (acre_year IN (1, 2, 3, null)),
  company_creation_date DATE,
  
  -- Statut onboarding
  onboarding_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  skipped BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_onboarding_user_id ON public.user_onboarding_data(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_completed ON public.user_onboarding_data(onboarding_completed);

-- RLS
ALTER TABLE public.user_onboarding_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own onboarding data" ON public.user_onboarding_data;
DROP POLICY IF EXISTS "Users can insert their own onboarding data" ON public.user_onboarding_data;
DROP POLICY IF EXISTS "Users can update their own onboarding data" ON public.user_onboarding_data;

CREATE POLICY "Users can view their own onboarding data"
  ON public.user_onboarding_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding data"
  ON public.user_onboarding_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding data"
  ON public.user_onboarding_data FOR UPDATE
  USING (auth.uid() = user_id);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_onboarding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_onboarding_updated_at ON public.user_onboarding_data;
CREATE TRIGGER trigger_update_onboarding_updated_at
BEFORE UPDATE ON public.user_onboarding_data
FOR EACH ROW
EXECUTE FUNCTION update_onboarding_updated_at();

-- ============================================
-- Table 2 : Tokens d'intégration (Shopify, Stripe)
-- ============================================
CREATE TABLE IF NOT EXISTS public.integration_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Provider
  provider TEXT NOT NULL CHECK (provider IN ('shopify', 'stripe')),
  
  -- Tokens (seront chiffrés dans l'app)
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  
  -- Métadonnées
  store_url TEXT, -- Pour Shopify
  shop_domain TEXT, -- Pour Shopify
  stripe_account_id TEXT, -- Pour Stripe Connect
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  connected_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Contrainte : Un seul token actif par provider par user
  UNIQUE(user_id, provider)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_integration_tokens_user_id ON public.integration_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_tokens_provider ON public.integration_tokens(provider);
CREATE INDEX IF NOT EXISTS idx_integration_tokens_active ON public.integration_tokens(user_id, is_active);

-- RLS
ALTER TABLE public.integration_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own integration tokens" ON public.integration_tokens;
DROP POLICY IF EXISTS "Users can insert their own integration tokens" ON public.integration_tokens;
DROP POLICY IF EXISTS "Users can update their own integration tokens" ON public.integration_tokens;
DROP POLICY IF EXISTS "Users can delete their own integration tokens" ON public.integration_tokens;

CREATE POLICY "Users can view their own integration tokens"
  ON public.integration_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own integration tokens"
  ON public.integration_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integration tokens"
  ON public.integration_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integration tokens"
  ON public.integration_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger updated_at
DROP TRIGGER IF EXISTS trigger_update_integration_tokens_updated_at ON public.integration_tokens;
CREATE TRIGGER trigger_update_integration_tokens_updated_at
BEFORE UPDATE ON public.integration_tokens
FOR EACH ROW
EXECUTE FUNCTION update_onboarding_updated_at();

-- ============================================
-- Table 3 : Logs de synchronisation
-- ============================================
CREATE TABLE IF NOT EXISTS public.sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Sync info
  provider TEXT NOT NULL CHECK (provider IN ('shopify', 'stripe')),
  sync_type TEXT NOT NULL CHECK (sync_type IN ('manual', 'webhook', 'cron')),
  
  -- Résultats
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'partial')),
  records_synced INTEGER DEFAULT 0,
  error_message TEXT,
  
  -- Details
  metadata JSONB DEFAULT '{}',
  
  -- Timestamp
  synced_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index
CREATE INDEX IF NOT EXISTS idx_sync_logs_user_id ON public.sync_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_provider ON public.sync_logs(provider);
CREATE INDEX IF NOT EXISTS idx_sync_logs_synced_at ON public.sync_logs(synced_at DESC);

-- RLS
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own sync logs" ON public.sync_logs;
CREATE POLICY "Users can view their own sync logs"
  ON public.sync_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Fonction pour nettoyer vieux logs (garder 90 derniers jours)
CREATE OR REPLACE FUNCTION clean_old_sync_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM public.sync_logs
  WHERE synced_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Commentaires pour documentation
-- ============================================
COMMENT ON TABLE public.user_onboarding_data IS 'Préférences fiscales et configuration onboarding Premium';
COMMENT ON TABLE public.integration_tokens IS 'Tokens OAuth pour intégrations Shopify/Stripe (chiffrés)';
COMMENT ON TABLE public.sync_logs IS 'Historique des synchronisations automatiques de CA';

COMMENT ON COLUMN public.user_onboarding_data.ir_mode IS 'Régime impôt : versement_liberatoire ou bareme';
COMMENT ON COLUMN public.user_onboarding_data.has_acre IS 'Bénéficie de l''ACRE (exonération partielle cotisations)';
COMMENT ON COLUMN public.user_onboarding_data.acre_year IS 'Année ACRE (1, 2, ou 3) pour calcul taux réduit';

COMMENT ON COLUMN public.integration_tokens.access_token IS 'Token OAuth chiffré (AES-256)';
COMMENT ON COLUMN public.integration_tokens.provider IS 'shopify ou stripe';

-- ============================================
-- Vues utiles pour analytics admin
-- ============================================
CREATE OR REPLACE VIEW public.onboarding_stats AS
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE onboarding_completed = true) as completed,
  COUNT(*) FILTER (WHERE has_acre = true) as users_with_acre,
  COUNT(*) FILTER (WHERE ir_mode = 'versement_liberatoire') as users_vl,
  COUNT(*) FILTER (WHERE ir_mode = 'bareme') as users_bareme
FROM public.user_onboarding_data;

CREATE OR REPLACE VIEW public.integrations_stats AS
SELECT 
  provider,
  COUNT(*) as total_connections,
  COUNT(*) FILTER (WHERE is_active = true) as active_connections,
  AVG(EXTRACT(EPOCH FROM (NOW() - last_sync_at))/3600) as avg_hours_since_sync
FROM public.integration_tokens
GROUP BY provider;

-- ============================================
-- Grants (si nécessaire pour service role)
-- ============================================
GRANT ALL ON public.user_onboarding_data TO service_role;
GRANT ALL ON public.integration_tokens TO service_role;
GRANT ALL ON public.sync_logs TO service_role;

-- ============================================
-- Migration terminée avec succès ! ✅
-- ============================================

