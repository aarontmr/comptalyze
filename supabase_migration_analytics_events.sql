-- Migration pour créer la table des événements d'analytics
-- Objectif : Suivre les événements clés et les sources d'acquisition (UTM)

-- Créer la table analytics_events
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Informations utilisateur
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT, -- ID de session pour tracking anonyme
  
  -- Type d'événement
  event_name TEXT NOT NULL,
  
  -- Données UTM (sources d'acquisition)
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  
  -- Métadonnées supplémentaires (JSON)
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Information de navigation
  page_path TEXT,
  referrer TEXT,
  
  -- Information technique
  user_agent TEXT,
  ip_address TEXT
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_utm_source ON public.analytics_events(utm_source);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON public.analytics_events(session_id);

-- Activer RLS (Row Level Security)
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs authentifiés peuvent lire tous les événements
-- Note: La page /admin/metrics vérifiera le statut admin côté application
-- Si vous avez une table user_profiles, vous pouvez modifier cette politique plus tard
CREATE POLICY "Authenticated users can read events"
  ON public.analytics_events
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Politique : Tout le monde peut insérer (pour le tracking)
CREATE POLICY "Anyone can insert events"
  ON public.analytics_events
  FOR INSERT
  WITH CHECK (true);

-- Vue pour faciliter l'analyse des signups par source
CREATE OR REPLACE VIEW public.analytics_signups_by_source AS
SELECT 
  COALESCE(utm_source, 'direct') AS source,
  COALESCE(utm_medium, 'none') AS medium,
  COALESCE(utm_campaign, 'none') AS campaign,
  COUNT(*) AS signup_count,
  COUNT(DISTINCT user_id) AS unique_users,
  DATE_TRUNC('day', created_at) AS signup_date
FROM public.analytics_events
WHERE event_name = 'signup_completed'
GROUP BY utm_source, utm_medium, utm_campaign, DATE_TRUNC('day', created_at)
ORDER BY signup_date DESC, signup_count DESC;

-- Vue pour calculer le taux de conversion free → pay
CREATE OR REPLACE VIEW public.analytics_conversion_funnel AS
WITH signups AS (
  SELECT 
    COUNT(DISTINCT user_id) AS total_signups,
    COALESCE(utm_source, 'direct') AS source
  FROM public.analytics_events
  WHERE event_name = 'signup_completed'
  GROUP BY utm_source
),
upgrades AS (
  SELECT 
    COUNT(DISTINCT user_id) AS total_upgrades,
    COALESCE(utm_source, 'direct') AS source
  FROM public.analytics_events
  WHERE event_name = 'upgrade_completed'
  GROUP BY utm_source
)
SELECT 
  s.source,
  s.total_signups,
  COALESCE(u.total_upgrades, 0) AS total_upgrades,
  CASE 
    WHEN s.total_signups > 0 
    THEN ROUND((COALESCE(u.total_upgrades, 0)::NUMERIC / s.total_signups::NUMERIC) * 100, 2)
    ELSE 0
  END AS conversion_rate_percent
FROM signups s
LEFT JOIN upgrades u ON s.source = u.source
ORDER BY s.total_signups DESC;

-- Commentaires pour la documentation
COMMENT ON TABLE public.analytics_events IS 'Table de suivi des événements et sources d''acquisition';
COMMENT ON COLUMN public.analytics_events.event_name IS 'Nom de l''événement (signup_started, signup_completed, record_created, upgrade_clicked, upgrade_completed)';
COMMENT ON COLUMN public.analytics_events.utm_source IS 'Source UTM (google, facebook, email, etc.)';
COMMENT ON COLUMN public.analytics_events.session_id IS 'ID de session pour lier les événements avant l''inscription';

