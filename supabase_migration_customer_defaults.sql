-- ============================================
-- Table customer_defaults pour l'auto-complétion des factures
-- ============================================

-- Table pour stocker les informations par défaut du client
CREATE TABLE IF NOT EXISTS public.customer_defaults (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  customer_name TEXT,
  customer_email TEXT,
  customer_address TEXT,
  vat_rate NUMERIC(5,2) DEFAULT 0.00,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_customer_defaults_user_id ON public.customer_defaults(user_id);

-- Activer RLS
ALTER TABLE public.customer_defaults ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Users can select their own defaults" ON public.customer_defaults;
DROP POLICY IF EXISTS "Users can insert their own defaults" ON public.customer_defaults;
DROP POLICY IF EXISTS "Users can update their own defaults" ON public.customer_defaults;
DROP POLICY IF EXISTS "Users can delete their own defaults" ON public.customer_defaults;

-- Politiques RLS pour customer_defaults
CREATE POLICY "Users can select their own defaults"
  ON public.customer_defaults FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own defaults"
  ON public.customer_defaults FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own defaults"
  ON public.customer_defaults FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own defaults"
  ON public.customer_defaults FOR DELETE
  USING (auth.uid() = user_id);

-- Commentaires
COMMENT ON TABLE public.customer_defaults IS 'Stocke les informations par défaut pour l''auto-complétion des factures';
COMMENT ON COLUMN public.customer_defaults.customer_name IS 'Nom du client par défaut';
COMMENT ON COLUMN public.customer_defaults.customer_email IS 'Email du client par défaut';
COMMENT ON COLUMN public.customer_defaults.customer_address IS 'Adresse du client par défaut';
COMMENT ON COLUMN public.customer_defaults.vat_rate IS 'Taux de TVA par défaut';


