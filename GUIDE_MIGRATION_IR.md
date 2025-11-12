# 🔧 Guide : Ajouter les colonnes IR à la table ca_records

## ⚠️ Erreur actuelle

```
Erreur lors de l'enregistrement: Could not find the 'ir_amount_eur' column of 'ca_records' in the schema cache
```

Cette erreur signifie que les colonnes `ir_mode` et `ir_amount_eur` n'existent pas dans la table `ca_records` de votre base de données Supabase.

## ✅ Solution : Exécuter la migration SQL

### Étape 1 : Connectez-vous à Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet Comptalyze

### Étape 2 : Ouvrez le SQL Editor

1. Dans le menu de gauche, cliquez sur **SQL Editor** (ou **SQL**)
2. Cliquez sur **New query** (Nouvelle requête)

### Étape 3 : Copiez et collez le script SQL

**Copiez directement ceci :**

```sql
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
```

### Étape 4 : Exécutez le script

1. Cliquez sur le bouton **"Run"** (Exécuter) en bas de l'éditeur
   - Ou utilisez `Ctrl+Enter` (Windows) ou `Cmd+Enter` (Mac)
2. Attendez que la requête s'exécute
3. Vous devriez voir un message de succès

### Étape 5 : Vérifier que les colonnes ont été ajoutées

Exécutez cette requête pour vérifier que les colonnes existent :

```sql
-- Vérifier que les colonnes existent
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'ca_records'
  AND column_name IN ('ir_mode', 'ir_amount_eur');
```

Cette requête doit retourner 2 lignes :
- `ir_mode` (TEXT, nullable)
- `ir_amount_eur` (NUMERIC, nullable)

## 🎯 Après la migration

1. **Rechargez votre application** (F5 ou Ctrl+R)
2. **Essayez d'enregistrer un chiffre d'affaires** 
3. L'enregistrement devrait maintenant fonctionner correctement

## 🆘 Si vous avez encore des erreurs

Si après avoir exécuté la migration vous avez encore des erreurs :

1. **Vérifiez que la migration a bien été exécutée** :
   ```sql
   SELECT column_name 
   FROM information_schema.columns
   WHERE table_name = 'ca_records' 
     AND column_name IN ('ir_mode', 'ir_amount_eur');
   ```

2. **Vérifiez que la table existe** :
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name = 'ca_records';
   ```

3. **Redémarrez le serveur de développement** :
   ```bash
   # Arrêtez le serveur (Ctrl+C)
   # Puis relancez :
   npm run dev
   # ou
   .\start-dev.ps1
   ```

---

**TL;DR** : Exécutez le script SQL ci-dessus dans le SQL Editor de Supabase pour ajouter les colonnes `ir_mode` et `ir_amount_eur` à la table `ca_records`. 🚀
