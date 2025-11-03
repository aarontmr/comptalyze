-- Créer la table history pour stocker les calculs des utilisateurs
CREATE TABLE IF NOT EXISTS history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  activity TEXT NOT NULL,
  ca FLOAT NOT NULL,
  charges FLOAT NOT NULL,
  net FLOAT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Créer un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_history_user_id ON history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_created_at ON history(created_at);

-- Activer Row Level Security (RLS)
ALTER TABLE history ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent, puis les recréer
DROP POLICY IF EXISTS "Users can view their own history" ON history;
DROP POLICY IF EXISTS "Users can insert their own history" ON history;
DROP POLICY IF EXISTS "Users can delete their own history" ON history;

-- Politique RLS : Les utilisateurs peuvent seulement voir leurs propres données
CREATE POLICY "Users can view their own history"
  ON history FOR SELECT
  USING (auth.uid() = user_id);

-- Politique RLS : Les utilisateurs peuvent seulement insérer leurs propres données
CREATE POLICY "Users can insert their own history"
  ON history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique RLS : Les utilisateurs peuvent seulement supprimer leurs propres données
CREATE POLICY "Users can delete their own history"
  ON history FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Table ca_records pour enregistrer les revenus mensuels
-- ============================================
CREATE TABLE IF NOT EXISTS public.ca_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  activity_type TEXT NOT NULL,
  amount_eur NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  computed_net_eur NUMERIC(12,2) NULL,
  computed_contrib_eur NUMERIC(12,2) NULL
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_ca_records_user_id ON public.ca_records(user_id);
CREATE INDEX IF NOT EXISTS idx_ca_records_year_month ON public.ca_records(user_id, year, month DESC);
CREATE INDEX IF NOT EXISTS idx_ca_records_created_at ON public.ca_records(created_at DESC);

-- Supprimer toutes les contraintes UNIQUE si elles existent (pour permettre plusieurs enregistrements par mois/activité)
DO $$ 
DECLARE
  constraint_record RECORD;
BEGIN
  -- Chercher et supprimer toutes les contraintes UNIQUE sur la table ca_records
  FOR constraint_record IN 
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'public.ca_records'::regclass
      AND contype = 'u'
  LOOP
    EXECUTE format('ALTER TABLE public.ca_records DROP CONSTRAINT IF EXISTS %I', constraint_record.conname);
    RAISE NOTICE 'Contrainte UNIQUE supprimée: %', constraint_record.conname;
  END LOOP;
END $$;

-- Activer RLS
ALTER TABLE public.ca_records ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent, puis les recréer
DROP POLICY IF EXISTS "Users can select their own ca_records" ON public.ca_records;
DROP POLICY IF EXISTS "Users can insert their own ca_records" ON public.ca_records;
DROP POLICY IF EXISTS "Users can update their own ca_records" ON public.ca_records;
DROP POLICY IF EXISTS "Users can delete their own ca_records" ON public.ca_records;

-- Politiques RLS pour ca_records
CREATE POLICY "Users can select their own ca_records"
  ON public.ca_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ca_records"
  ON public.ca_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ca_records"
  ON public.ca_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ca_records"
  ON public.ca_records FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Table email_preferences pour les préférences email (Premium)
-- ============================================
CREATE TABLE IF NOT EXISTS public.email_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  monthly_reminder BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index
CREATE INDEX IF NOT EXISTS idx_email_preferences_monthly_reminder ON public.email_preferences(monthly_reminder) 
  WHERE monthly_reminder = true;

-- Activer RLS
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent, puis les recréer
DROP POLICY IF EXISTS "Users can select their own email_preferences" ON public.email_preferences;
DROP POLICY IF EXISTS "Users can insert their own email_preferences" ON public.email_preferences;
DROP POLICY IF EXISTS "Users can update their own email_preferences" ON public.email_preferences;

-- Politiques RLS pour email_preferences
CREATE POLICY "Users can select their own email_preferences"
  ON public.email_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email_preferences"
  ON public.email_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email_preferences"
  ON public.email_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- Table subscriptions (si elle n'existe pas déjà)
-- ============================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  price_id TEXT,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- Index pour subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- Activer RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Supprimer la politique existante si elle existe, puis la recréer
DROP POLICY IF EXISTS "Users can select their own subscriptions" ON public.subscriptions;

-- Politiques RLS pour subscriptions
CREATE POLICY "Users can select their own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);




