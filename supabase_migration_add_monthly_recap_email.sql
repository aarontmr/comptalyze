-- ============================================
-- MIGRATION : Ajouter préférence email récap CA mensuel
-- ============================================

-- Ajouter la colonne monthly_recap_email dans user_preferences
ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS monthly_recap_email BOOLEAN DEFAULT true;

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_user_preferences_monthly_recap 
ON public.user_preferences(user_id, monthly_recap_email);

-- Commentaire
COMMENT ON COLUMN public.user_preferences.monthly_recap_email 
IS 'Recevoir un email récapitulatif du CA chaque fin de mois (pour utilisateurs avec intégrations Shopify/Stripe)';

-- ============================================
-- Migration terminée ✅
-- ============================================

