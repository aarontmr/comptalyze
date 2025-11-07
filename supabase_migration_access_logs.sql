-- Migration : Création de la table access_logs pour journaux d'accès
-- Date : 2025-01-15
-- Description : Table pour enregistrer les accès, erreurs et tentatives de connexion

-- Créer la table access_logs
CREATE TABLE IF NOT EXISTS public.access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_agent TEXT,
  response_time_ms INTEGER,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT valid_method CHECK (method IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS')),
  CONSTRAINT valid_status_code CHECK (status_code >= 100 AND status_code < 600)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON public.access_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON public.access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_endpoint ON public.access_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_access_logs_status_code ON public.access_logs(status_code);
CREATE INDEX IF NOT EXISTS idx_access_logs_ip_address ON public.access_logs(ip_address);

-- Index composite pour les tentatives de login ratées
CREATE INDEX IF NOT EXISTS idx_failed_auth_attempts 
  ON public.access_logs(ip_address, endpoint, status_code, created_at DESC)
  WHERE status_code >= 400 AND (endpoint LIKE '%/login%' OR endpoint LIKE '%/signup%');

-- RLS (Row Level Security)
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- Politique : Insertion publique (pour l'API)
CREATE POLICY "API can insert logs"
  ON public.access_logs
  FOR INSERT
  WITH CHECK (true);

-- Politique : Les admins peuvent tout voir
CREATE POLICY "Admins can view all logs"
  ON public.access_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.raw_user_meta_data->>'is_admin' = 'true'
        OR auth.users.raw_user_meta_data->>'is_premium_forever' = 'true'
      )
    )
  );

-- Commentaires sur la table
COMMENT ON TABLE public.access_logs IS 'Journaux d''accès pour sécurité et monitoring';
COMMENT ON COLUMN public.access_logs.ip_address IS 'Adresse IP du client';
COMMENT ON COLUMN public.access_logs.endpoint IS 'URL endpoint appelé';
COMMENT ON COLUMN public.access_logs.method IS 'Méthode HTTP (GET, POST, etc.)';
COMMENT ON COLUMN public.access_logs.status_code IS 'Code de statut HTTP de la réponse';
COMMENT ON COLUMN public.access_logs.user_id IS 'ID de l''utilisateur si authentifié';
COMMENT ON COLUMN public.access_logs.user_agent IS 'User agent du navigateur';
COMMENT ON COLUMN public.access_logs.response_time_ms IS 'Temps de réponse en millisecondes';
COMMENT ON COLUMN public.access_logs.error_message IS 'Message d''erreur si échec';
COMMENT ON COLUMN public.access_logs.metadata IS 'Données additionnelles en JSON';

-- Vue pour les tentatives de connexion échouées
CREATE OR REPLACE VIEW failed_login_attempts AS
SELECT
  ip_address,
  endpoint,
  status_code,
  error_message,
  created_at,
  user_agent,
  COUNT(*) OVER (PARTITION BY ip_address ORDER BY created_at DESC ROWS BETWEEN 9 PRECEDING AND CURRENT ROW) as recent_failures
FROM public.access_logs
WHERE 
  status_code >= 400
  AND (endpoint LIKE '%/login%' OR endpoint LIKE '%/signup%' OR endpoint LIKE '%auth%')
ORDER BY created_at DESC;

-- Grant sur la vue
GRANT SELECT ON failed_login_attempts TO authenticated;

-- Vue pour les statistiques par endpoint
CREATE OR REPLACE VIEW endpoint_stats AS
SELECT
  endpoint,
  method,
  COUNT(*) as total_requests,
  COUNT(CASE WHEN status_code < 400 THEN 1 END) as success_count,
  COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count,
  ROUND(AVG(response_time_ms)::numeric, 2) as avg_response_time,
  MAX(created_at) as last_accessed
FROM public.access_logs
GROUP BY endpoint, method
ORDER BY total_requests DESC;

-- Grant sur la vue
GRANT SELECT ON endpoint_stats TO authenticated;

-- Fonction pour compter les tentatives récentes d'une IP
CREATE OR REPLACE FUNCTION count_recent_attempts(
  p_ip_address TEXT,
  p_endpoint TEXT,
  p_minutes INTEGER DEFAULT 10
)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.access_logs
    WHERE 
      ip_address = p_ip_address
      AND endpoint = p_endpoint
      AND created_at > NOW() - (p_minutes || ' minutes')::INTERVAL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION count_recent_attempts(TEXT, TEXT, INTEGER) TO authenticated;

-- Fonction pour détecter les IPs suspectes
CREATE OR REPLACE FUNCTION get_suspicious_ips(
  p_threshold INTEGER DEFAULT 20,
  p_minutes INTEGER DEFAULT 60
)
RETURNS TABLE (
  ip_address TEXT,
  attempt_count BIGINT,
  last_attempt TIMESTAMP WITH TIME ZONE,
  failed_attempts BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.ip_address,
    COUNT(*) as attempt_count,
    MAX(al.created_at) as last_attempt,
    COUNT(CASE WHEN al.status_code >= 400 THEN 1 END) as failed_attempts
  FROM public.access_logs al
  WHERE al.created_at > NOW() - (p_minutes || ' minutes')::INTERVAL
  GROUP BY al.ip_address
  HAVING COUNT(*) > p_threshold
  ORDER BY attempt_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_suspicious_ips(INTEGER, INTEGER) TO authenticated;

-- Politique de rétention : supprimer les logs de plus de 90 jours automatiquement
-- (À configurer via un CRON job ou fonction)
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM public.access_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION cleanup_old_logs() TO service_role;

-- Message de succès
DO $$
BEGIN
  RAISE NOTICE '✅ Table access_logs créée avec succès';
  RAISE NOTICE '✅ Policies RLS configurées';
  RAISE NOTICE '✅ Index créés pour performance';
  RAISE NOTICE '✅ Vues et fonctions utilitaires créées';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Prochaines étapes:';
  RAISE NOTICE '   1. Intégrer le logging dans les API routes';
  RAISE NOTICE '   2. Tester le rate-limiting';
  RAISE NOTICE '   3. Accéder à /admin/logs pour voir les journaux';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  Configurer un CRON pour nettoyer les vieux logs (optionnel):';
  RAISE NOTICE '   Utiliser pg_cron extension si disponible';
END $$;

