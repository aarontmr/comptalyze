# 🗄️ Créer la table `history` dans Supabase

## ⚠️ Erreur actuelle

```
Could not find the table 'public.history' in the schema cache
```

Cela signifie que la table `history` n'existe pas encore dans votre base de données Supabase.

## ✅ Solution : Créer la table en 5 minutes

### Étape 1 : Connectez-vous à Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet (celui avec l'URL que vous avez dans `.env.local`)

### Étape 2 : Ouvrez le SQL Editor

1. Dans le menu de gauche, cliquez sur **SQL Editor** (ou **SQL**)
2. Cliquez sur **New query** (Nouvelle requête)

### Étape 3 : Copiez et collez le script SQL

Ouvrez le fichier `supabase_setup.sql` dans votre projet et **copiez tout son contenu**, puis **collez-le** dans l'éditeur SQL de Supabase.

**Ou copiez directement ceci :**

```sql
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
```

### Étape 4 : Exécutez le script

1. Cliquez sur le bouton **Run** (ou **Exécuter**) en bas de l'éditeur
2. Attendez quelques secondes
3. Vous devriez voir un message de succès : **Success. No rows returned**

### Étape 5 : Vérifiez que la table existe

1. Dans le menu de gauche, cliquez sur **Table Editor**
2. Vous devriez voir la table `history` dans la liste
3. Cliquez dessus pour voir sa structure

### Étape 6 : Testez votre application

1. Retournez dans votre application
2. Essayez à nouveau de cliquer sur **"Enregistrer ce calcul"**
3. Ça devrait fonctionner maintenant ! ✅

## 📝 Ce que fait ce script

- ✅ Crée la table `history` avec toutes les colonnes nécessaires
- ✅ Crée des index pour améliorer les performances
- ✅ Active la sécurité Row Level Security (RLS)
- ✅ Configure les politiques pour que chaque utilisateur ne voie que ses propres données

## 🔍 Si vous avez une erreur

### Erreur : "permission denied"

Si vous voyez une erreur de permission, assurez-vous d'être connecté avec un compte qui a les droits administrateur sur le projet Supabase.

### Erreur : "relation already exists"

Si la table existe déjà, vous pouvez :
1. La supprimer d'abord : `DROP TABLE IF EXISTS history CASCADE;`
2. Puis réexécuter le script complet

### Erreur : "function gen_random_uuid() does not exist"

Cette fonction devrait exister par défaut dans Supabase. Si vous avez cette erreur, contactez le support Supabase.

## ✅ Vérification finale

Après avoir exécuté le script, vous pouvez vérifier que tout fonctionne :

1. Dans Supabase, allez dans **Table Editor** > **history**
2. La table doit avoir ces colonnes :
   - `id` (uuid, primary key)
   - `user_id` (uuid)
   - `month` (text)
   - `activity` (text)
   - `ca` (float)
   - `charges` (float)
   - `net` (float)
   - `created_at` (timestamp)

Si tout est correct, votre application devrait maintenant fonctionner ! 🎉

