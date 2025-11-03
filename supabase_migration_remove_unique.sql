-- Migration : Supprimer la contrainte UNIQUE sur ca_records
-- Ce script permet de supprimer la contrainte UNIQUE pour permettre plusieurs enregistrements
-- pour le même mois/activité (utile pour enregistrer plusieurs CA par mois)

-- IMPORTANT : Si la table n'existe pas encore, exécutez d'abord supabase_setup.sql

-- Supprimer la contrainte UNIQUE si elle existe
DO $$ 
DECLARE
  constraint_record RECORD;
  table_exists BOOLEAN;
BEGIN
  -- Vérifier si la table existe
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'ca_records'
  ) INTO table_exists;

  IF NOT table_exists THEN
    RAISE NOTICE 'La table ca_records n''existe pas encore. Exécutez d''abord supabase_setup.sql pour créer la table.';
    RETURN;
  END IF;

  -- Chercher toutes les contraintes UNIQUE sur la table ca_records
  -- et les supprimer
  FOR constraint_record IN 
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'public.ca_records'::regclass
      AND contype = 'u'
  LOOP
    EXECUTE format('ALTER TABLE public.ca_records DROP CONSTRAINT IF EXISTS %I', constraint_record.conname);
    RAISE NOTICE 'Contrainte UNIQUE supprimée: %', constraint_record.conname;
  END LOOP;

  IF NOT FOUND THEN
    RAISE NOTICE 'Aucune contrainte UNIQUE trouvée sur la table ca_records.';
  END IF;
END $$;

-- Vérifier que la contrainte a bien été supprimée
SELECT 
  conname as constraint_name,
  contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'public.ca_records'::regclass
  AND contype = 'u';

-- Si aucun résultat n'est retourné, la contrainte UNIQUE a bien été supprimée

