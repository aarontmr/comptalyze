-- Créer la table custom_fiscal_events pour stocker les événements personnalisés des utilisateurs
CREATE TABLE IF NOT EXISTS public.custom_fiscal_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_custom_fiscal_events_user_id ON public.custom_fiscal_events(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_fiscal_events_date ON public.custom_fiscal_events(date);

-- Activer Row Level Security (RLS)
ALTER TABLE public.custom_fiscal_events ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Users can select their own custom_fiscal_events" ON public.custom_fiscal_events;
DROP POLICY IF EXISTS "Users can insert their own custom_fiscal_events" ON public.custom_fiscal_events;
DROP POLICY IF EXISTS "Users can update their own custom_fiscal_events" ON public.custom_fiscal_events;
DROP POLICY IF EXISTS "Users can delete their own custom_fiscal_events" ON public.custom_fiscal_events;

-- Politiques RLS pour custom_fiscal_events
CREATE POLICY "Users can select their own custom_fiscal_events"
  ON public.custom_fiscal_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own custom_fiscal_events"
  ON public.custom_fiscal_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom_fiscal_events"
  ON public.custom_fiscal_events FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom_fiscal_events"
  ON public.custom_fiscal_events FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_custom_fiscal_events_updated_at ON public.custom_fiscal_events;
CREATE TRIGGER update_custom_fiscal_events_updated_at
  BEFORE UPDATE ON public.custom_fiscal_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


