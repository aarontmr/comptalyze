-- Migration pour ajouter les champs d'impôt sur le revenu (IR) à la table ca_records
-- Date: 2024

-- Ajouter la colonne ir_mode (none, vl, bareme)
ALTER TABLE public.ca_records 
  ADD COLUMN IF NOT EXISTS ir_mode TEXT NULL 
  CHECK (ir_mode IS NULL OR ir_mode IN ('none', 'vl', 'bareme'));

-- Ajouter la colonne ir_amount_eur pour stocker le montant d'IR calculé
ALTER TABLE public.ca_records 
  ADD COLUMN IF NOT EXISTS ir_amount_eur NUMERIC(12,2) NULL;

-- Ajouter un commentaire pour documenter les colonnes
COMMENT ON COLUMN public.ca_records.ir_mode IS 'Régime d''impôt sur le revenu : none (aucun), vl (versement libératoire), bareme (barème classique avec provision)';
COMMENT ON COLUMN public.ca_records.ir_amount_eur IS 'Montant d''impôt sur le revenu calculé en euros';

