-- Migration: Système de quota de simulations pour plan Free
-- Date: 2025-01-08
-- Description: Table pour tracker l'utilisation mensuelle des simulations

-- Créer la table simulation_usage
CREATE TABLE IF NOT EXISTS simulation_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  year INT NOT NULL CHECK (year >= 2024 AND year <= 2100),
  count INT NOT NULL DEFAULT 0 CHECK (count >= 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, year, month)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_simulation_usage_user_date 
  ON simulation_usage(user_id, year DESC, month DESC);

-- Row Level Security (RLS)
ALTER TABLE simulation_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Les users ne peuvent voir que leurs propres données
CREATE POLICY "Users can view own simulation usage"
  ON simulation_usage
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Les users ne peuvent insérer que leurs propres données
CREATE POLICY "Users can insert own simulation usage"
  ON simulation_usage
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Les users ne peuvent update que leurs propres données
CREATE POLICY "Users can update own simulation usage"
  ON simulation_usage
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function pour incrémenter le compteur de simulations
CREATE OR REPLACE FUNCTION increment_simulation_count(p_user_id UUID)
RETURNS TABLE(new_count INT, is_at_limit BOOLEAN) AS $$
DECLARE
  v_current_month INT := EXTRACT(MONTH FROM CURRENT_DATE);
  v_current_year INT := EXTRACT(YEAR FROM CURRENT_DATE);
  v_count INT;
BEGIN
  -- Upsert (insert or update) le compteur
  INSERT INTO simulation_usage (user_id, month, year, count, updated_at)
  VALUES (p_user_id, v_current_month, v_current_year, 1, now())
  ON CONFLICT (user_id, year, month)
  DO UPDATE SET 
    count = simulation_usage.count + 1,
    updated_at = now()
  RETURNING simulation_usage.count INTO v_count;
  
  -- Retourner le nouveau compte et si on est à la limite (3 pour Free)
  RETURN QUERY SELECT v_count, (v_count >= 3);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function pour récupérer le compteur actuel
CREATE OR REPLACE FUNCTION get_simulation_count(p_user_id UUID)
RETURNS INT AS $$
DECLARE
  v_current_month INT := EXTRACT(MONTH FROM CURRENT_DATE);
  v_current_year INT := EXTRACT(YEAR FROM CURRENT_DATE);
  v_count INT;
BEGIN
  SELECT count INTO v_count
  FROM simulation_usage
  WHERE user_id = p_user_id
    AND month = v_current_month
    AND year = v_current_year;
  
  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour auto-update de updated_at
CREATE OR REPLACE FUNCTION update_simulation_usage_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_simulation_usage_timestamp
  BEFORE UPDATE ON simulation_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_simulation_usage_timestamp();

-- Commentaires pour documentation
COMMENT ON TABLE simulation_usage IS 'Tracking mensuel de l''utilisation des simulations URSSAF par utilisateur';
COMMENT ON COLUMN simulation_usage.count IS 'Nombre de simulations effectuées ce mois (max 3 pour Free)';
COMMENT ON FUNCTION increment_simulation_count IS 'Incrémente le compteur de simulations et retourne le nouveau total';
COMMENT ON FUNCTION get_simulation_count IS 'Récupère le nombre de simulations effectuées ce mois';

