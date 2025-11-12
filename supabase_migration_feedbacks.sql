-- Migration : Création de la table feedbacks pour collecter les avis utilisateurs
-- Date : 2025-01-15
-- Description : Table pour stocker les feedbacks utilisateurs depuis le bouton sticky

-- Créer la table feedbacks
CREATE TABLE IF NOT EXISTS public.feedbacks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback TEXT NOT NULL,
  email TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_agent TEXT,
  page_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE,
  admin_notes TEXT,
  
  -- Contraintes
  CONSTRAINT feedback_length CHECK (char_length(feedback) >= 1 AND char_length(feedback) <= 2000)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON public.feedbacks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedbacks_user_id ON public.feedbacks(user_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_is_read ON public.feedbacks(is_read);

-- RLS (Row Level Security)
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent insérer leur propre feedback
CREATE POLICY "Users can insert their own feedback"
  ON public.feedbacks
  FOR INSERT
  WITH CHECK (true); -- Tout le monde peut créer un feedback (même anonyme)

-- Politique : Les admins peuvent tout voir (utilisateurs avec is_premium_forever = true)
CREATE POLICY "Admins can view all feedbacks"
  ON public.feedbacks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.raw_user_meta_data->>'is_premium_forever' = 'true'
        OR auth.users.raw_user_meta_data->>'is_admin' = 'true'
      )
    )
  );

-- Politique : Les admins peuvent mettre à jour les feedbacks
CREATE POLICY "Admins can update feedbacks"
  ON public.feedbacks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.raw_user_meta_data->>'is_premium_forever' = 'true'
        OR auth.users.raw_user_meta_data->>'is_admin' = 'true'
      )
    )
  );

-- Commentaire sur la table
COMMENT ON TABLE public.feedbacks IS 'Feedbacks utilisateurs collectés via le bouton sticky sur la landing page';

-- Commentaires sur les colonnes
COMMENT ON COLUMN public.feedbacks.feedback IS 'Contenu du feedback (max 2000 caractères)';
COMMENT ON COLUMN public.feedbacks.email IS 'Email optionnel pour répondre à l''utilisateur';
COMMENT ON COLUMN public.feedbacks.user_id IS 'ID de l''utilisateur si connecté, NULL sinon';
COMMENT ON COLUMN public.feedbacks.user_agent IS 'User agent du navigateur pour statistiques';
COMMENT ON COLUMN public.feedbacks.page_url IS 'URL de la page où le feedback a été donné';
COMMENT ON COLUMN public.feedbacks.is_read IS 'Marqué comme lu par un admin';
COMMENT ON COLUMN public.feedbacks.admin_notes IS 'Notes internes de l''admin sur ce feedback';

-- Fonction pour compter les feedbacks non lus
CREATE OR REPLACE FUNCTION count_unread_feedbacks()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*)::INTEGER FROM public.feedbacks WHERE is_read = FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION count_unread_feedbacks() TO authenticated;

-- Vue pour les statistiques (optionnel)
CREATE OR REPLACE VIEW feedbacks_stats AS
SELECT
  COUNT(*) as total_feedbacks,
  COUNT(CASE WHEN is_read = FALSE THEN 1 END) as unread_count,
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as from_logged_users,
  COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as with_email,
  DATE_TRUNC('day', created_at)::DATE as feedback_date,
  COUNT(*) as feedbacks_per_day
FROM public.feedbacks
GROUP BY DATE_TRUNC('day', created_at);

-- Grant sur la vue
GRANT SELECT ON feedbacks_stats TO authenticated;

-- Message de succès
DO $$
BEGIN
  RAISE NOTICE '✅ Table feedbacks créée avec succès';
  RAISE NOTICE '✅ Policies RLS configurées';
  RAISE NOTICE '✅ Index créés pour performance';
  RAISE NOTICE '✅ Fonction count_unread_feedbacks créée';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Prochaines étapes:';
  RAISE NOTICE '   1. Tester l''insertion d''un feedback';
  RAISE NOTICE '   2. Vérifier les policies avec un compte admin';
  RAISE NOTICE '   3. Accéder à /admin/feedback pour voir la liste';
END $$;


















