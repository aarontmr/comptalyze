-- ============================================
-- Migration complète pour toutes les améliorations
-- ============================================

-- 1. Table pour le suivi d'onboarding amélioré
CREATE TABLE IF NOT EXISTS public.user_onboarding_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  completed_steps JSONB DEFAULT '[]'::jsonb,
  current_step INTEGER DEFAULT 0,
  checklist_progress JSONB DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_onboarding_progress_user_id ON public.user_onboarding_progress(user_id);
ALTER TABLE public.user_onboarding_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own onboarding" ON public.user_onboarding_progress;
CREATE POLICY "Users can manage their own onboarding"
  ON public.user_onboarding_progress FOR ALL
  USING (auth.uid() = user_id);

-- 2. Table pour les notifications et alertes
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'deadline', 'threshold', 'reminder', 'achievement'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_read ON public.user_notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON public.user_notifications(created_at DESC);
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own notifications" ON public.user_notifications;
CREATE POLICY "Users can manage their own notifications"
  ON public.user_notifications FOR ALL
  USING (auth.uid() = user_id);

-- 3. Table pour multi-comptes / multi-activités
CREATE TABLE IF NOT EXISTS public.user_businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  siret TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_businesses_user_id ON public.user_businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_businesses_primary ON public.user_businesses(user_id, is_primary);
ALTER TABLE public.user_businesses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own businesses" ON public.user_businesses;
CREATE POLICY "Users can manage their own businesses"
  ON public.user_businesses FOR ALL
  USING (auth.uid() = user_id);

-- 4. Table pour les imports bancaires
CREATE TABLE IF NOT EXISTS public.bank_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.user_businesses(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  type TEXT NOT NULL, -- 'income', 'expense'
  category TEXT,
  reconciled BOOLEAN DEFAULT FALSE,
  matched_record_id UUID, -- Référence vers ca_records ou charges_deductibles
  import_source TEXT, -- 'csv', 'ofx', 'manual'
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bank_transactions_user_id ON public.bank_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_date ON public.bank_transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_reconciled ON public.bank_transactions(user_id, reconciled);
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own transactions" ON public.bank_transactions;
CREATE POLICY "Users can manage their own transactions"
  ON public.bank_transactions FOR ALL
  USING (auth.uid() = user_id);

-- 5. Table pour les templates de factures
CREATE TABLE IF NOT EXISTS public.invoice_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_data JSONB NOT NULL, -- Structure complète du template
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_invoice_templates_user_id ON public.invoice_templates(user_id);
ALTER TABLE public.invoice_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own templates" ON public.invoice_templates;
CREATE POLICY "Users can manage their own templates"
  ON public.invoice_templates FOR ALL
  USING (auth.uid() = user_id);

-- 6. Table pour les règles automatiques
CREATE TABLE IF NOT EXISTS public.automation_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL, -- 'ca_threshold', 'date', 'record_created'
  trigger_condition JSONB NOT NULL,
  action_type TEXT NOT NULL, -- 'create_invoice', 'send_notification', 'categorize'
  action_config JSONB NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_automation_rules_user_id ON public.automation_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_enabled ON public.automation_rules(user_id, enabled);
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own rules" ON public.automation_rules;
CREATE POLICY "Users can manage their own rules"
  ON public.automation_rules FOR ALL
  USING (auth.uid() = user_id);

-- 7. Table pour les budgets et planification
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.user_businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  period_type TEXT NOT NULL, -- 'monthly', 'quarterly', 'yearly'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  budget_amount NUMERIC(12,2) NOT NULL,
  spent_amount NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_period ON public.budgets(user_id, period_start, period_end);
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own budgets" ON public.budgets;
CREATE POLICY "Users can manage their own budgets"
  ON public.budgets FOR ALL
  USING (auth.uid() = user_id);

-- 8. Table pour la gamification
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL, -- 'streak', 'milestone', 'challenge'
  achievement_key TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, achievement_key)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_completed ON public.user_achievements(user_id, completed);
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own achievements" ON public.user_achievements;
CREATE POLICY "Users can view their own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

-- 9. Table pour le programme de parrainage
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'rewarded'
  reward_type TEXT, -- 'credit', 'discount'
  reward_amount NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON public.referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own referrals" ON public.referrals;
CREATE POLICY "Users can view their own referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- 10. Table pour les rapports automatisés
CREATE TABLE IF NOT EXISTS public.automated_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL, -- 'monthly', 'quarterly', 'yearly'
  frequency TEXT NOT NULL, -- 'monthly', 'quarterly', 'yearly'
  format TEXT NOT NULL, -- 'pdf', 'excel', 'csv'
  recipients JSONB NOT NULL, -- Liste des emails
  last_sent_at TIMESTAMPTZ,
  next_send_at TIMESTAMPTZ,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_automated_reports_user_id ON public.automated_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_automated_reports_next_send ON public.automated_reports(next_send_at) WHERE enabled = TRUE;
ALTER TABLE public.automated_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own reports" ON public.automated_reports;
CREATE POLICY "Users can manage their own reports"
  ON public.automated_reports FOR ALL
  USING (auth.uid() = user_id);

-- 11. Table pour le mode comptable (partage avec comptable)
CREATE TABLE IF NOT EXISTS public.accountant_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  accountant_email TEXT NOT NULL,
  shared_data_types JSONB NOT NULL, -- ['invoices', 'ca_records', 'charges']
  access_level TEXT DEFAULT 'read', -- 'read', 'comment'
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'revoked'
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_accountant_shares_user_id ON public.accountant_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_accountant_shares_token ON public.accountant_shares(token);
ALTER TABLE public.accountant_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own shares" ON public.accountant_shares;
CREATE POLICY "Users can manage their own shares"
  ON public.accountant_shares FOR ALL
  USING (auth.uid() = user_id);

-- 12. Table pour l'authentification renforcée (2FA)
CREATE TABLE IF NOT EXISTS public.user_security (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret TEXT,
  backup_codes TEXT[],
  login_history JSONB DEFAULT '[]'::jsonb,
  last_login_at TIMESTAMPTZ,
  last_login_ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_security_user_id ON public.user_security(user_id);
ALTER TABLE public.user_security ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own security" ON public.user_security;
CREATE POLICY "Users can manage their own security"
  ON public.user_security FOR ALL
  USING (auth.uid() = user_id);

-- 13. Table pour le centre d'aide (base de connaissances)
CREATE TABLE IF NOT EXISTS public.help_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[],
  views INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_help_articles_category ON public.help_articles(category) WHERE published = TRUE;
CREATE INDEX IF NOT EXISTS idx_help_articles_tags ON public.help_articles USING GIN(tags);
ALTER TABLE public.help_articles ENABLE ROW LEVEL SECURITY;

-- Les articles d'aide sont publics (lecture seule pour tous)
DROP POLICY IF EXISTS "Anyone can read help articles" ON public.help_articles;
CREATE POLICY "Anyone can read help articles"
  ON public.help_articles FOR SELECT
  USING (published = TRUE);

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger à toutes les tables avec updated_at
DO $$
DECLARE
  table_name TEXT;
  tables TEXT[] := ARRAY[
    'user_onboarding_progress',
    'user_businesses',
    'bank_transactions',
    'invoice_templates',
    'automation_rules',
    'budgets',
    'user_achievements',
    'automated_reports',
    'accountant_shares',
    'user_security'
  ];
BEGIN
  FOREACH table_name IN ARRAY tables
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I', table_name, table_name);
    EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', table_name, table_name);
  END LOOP;
END $$;





