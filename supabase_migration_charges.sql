-- Table pour les charges déductibles
CREATE TABLE IF NOT EXISTS charges_deductibles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_charges_user_id ON charges_deductibles(user_id);
CREATE INDEX IF NOT EXISTS idx_charges_date ON charges_deductibles(date);
CREATE INDEX IF NOT EXISTS idx_charges_category ON charges_deductibles(category);

-- RLS (Row Level Security)
ALTER TABLE charges_deductibles ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs ne peuvent voir que leurs propres charges
CREATE POLICY "Users can view own charges"
  ON charges_deductibles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique : Les utilisateurs ne peuvent insérer que leurs propres charges
CREATE POLICY "Users can insert own charges"
  ON charges_deductibles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique : Les utilisateurs ne peuvent modifier que leurs propres charges
CREATE POLICY "Users can update own charges"
  ON charges_deductibles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Politique : Les utilisateurs ne peuvent supprimer que leurs propres charges
CREATE POLICY "Users can delete own charges"
  ON charges_deductibles
  FOR DELETE
  USING (auth.uid() = user_id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_charges_updated_at ON charges_deductibles;
CREATE TRIGGER update_charges_updated_at
  BEFORE UPDATE ON charges_deductibles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

