-- Migration : Table pour tracker les emails marketing envoyés
-- Permet d'éviter d'envoyer plusieurs fois le même email au même utilisateur

-- Créer la table marketing_emails
CREATE TABLE IF NOT EXISTS public.marketing_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL, -- 'upgrade_day3', 'upgrade_day7', 'abandoned_cart', etc.
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_content TEXT, -- Type de contenu envoyé
  opened BOOLEAN DEFAULT FALSE,
  clicked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_marketing_emails_user_id ON public.marketing_emails(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_emails_email_type ON public.marketing_emails(email_type);
CREATE INDEX IF NOT EXISTS idx_marketing_emails_sent_at ON public.marketing_emails(sent_at);

-- Index composite pour éviter les doublons
CREATE UNIQUE INDEX IF NOT EXISTS idx_marketing_emails_user_type 
ON public.marketing_emails(user_id, email_type);

-- Commentaires
COMMENT ON TABLE public.marketing_emails IS 'Suivi des emails marketing envoyés aux utilisateurs';
COMMENT ON COLUMN public.marketing_emails.email_type IS 'Type d''email : upgrade_day3, upgrade_day7, etc.';
COMMENT ON COLUMN public.marketing_emails.opened IS 'Si l''email a été ouvert (nécessite tracking)';
COMMENT ON COLUMN public.marketing_emails.clicked IS 'Si un lien a été cliqué (nécessite tracking)';

-- RLS (Row Level Security)
ALTER TABLE public.marketing_emails ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leurs propres emails marketing
CREATE POLICY "Users can view their own marketing emails"
  ON public.marketing_emails
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique : Seul le service (avec service_role) peut insérer
CREATE POLICY "Service can insert marketing emails"
  ON public.marketing_emails
  FOR INSERT
  WITH CHECK (true); -- Sera exécuté avec service_role uniquement

-- Fonction pour nettoyer les anciens logs (optionnel, à exécuter manuellement)
CREATE OR REPLACE FUNCTION clean_old_marketing_emails()
RETURNS void AS $$
BEGIN
  DELETE FROM public.marketing_emails
  WHERE sent_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION clean_old_marketing_emails IS 'Nettoie les emails marketing de plus de 90 jours';

