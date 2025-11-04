# 📋 Guide : Créer la table `invoices` dans Supabase

## ⚠️ Erreur actuelle

```
Erreur lors de la création de la facture: Could not find the table 'public.invoices' in the schema cache
```

Cette erreur signifie que la table `invoices` n'existe pas encore dans votre base de données Supabase.

## ✅ Solution : Créer la table en 5 minutes

### Étape 1 : Connectez-vous à Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet Comptalyze

### Étape 2 : Ouvrez le SQL Editor

1. Dans le menu de gauche, cliquez sur **SQL Editor** (ou **SQL**)
   - C'est l'icône avec `</>` ou le symbole SQL
   - C'est généralement dans la section "Database" ou "Development"
2. Cliquez sur **New query** (Nouvelle requête)

### Étape 3 : Copiez et collez le script SQL

1. Ouvrez le fichier `supabase_migration_invoices.sql` dans votre projet
2. **Sélectionnez tout le contenu** (Ctrl+A puis Ctrl+C)
3. **Collez-le** dans l'éditeur SQL de Supabase (Ctrl+V)

### Étape 4 : Exécutez le script

1. Cliquez sur le bouton **"Run"** (Exécuter) en bas de l'éditeur
   - Ou utilisez Ctrl+Enter
2. Attendez que la requête s'exécute

### Étape 5 : Vérifier le résultat

Vous devriez voir un message de succès. Pour vérifier que la table a bien été créée, exécutez cette requête :

```sql
-- Vérifier que la table existe
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'invoices';
```

Cette requête doit retourner 1 ligne.

## 🔍 Vérification complète

Pour vérifier que tout est correctement configuré :

```sql
-- Vérifier que la table existe
SELECT table_name, table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'invoices';

-- Vérifier les politiques RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'invoices';

-- Vérifier les index
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'invoices' AND schemaname = 'public';
```

Vous devriez voir :
- ✅ La table `invoices` existe
- ✅ 4 politiques RLS (SELECT, INSERT, UPDATE, DELETE)
- ✅ 3 index (user_id, invoice_number, created_at)

## 📝 Résumé

1. **Connectez-vous** à Supabase
2. **Ouvrez SQL Editor**
3. **Copiez-collez** le contenu de `supabase_migration_invoices.sql`
4. **Exécutez** la requête (Run)
5. **Vérifiez** que la table existe

## ✅ Après la création

Une fois la table créée :
1. **Rechargez votre application**
2. **Essayez de créer une facture** depuis le dashboard
3. La facture devrait maintenant être sauvegardée correctement

## ⚠️ Important

- **N'exécutez PAS** ce script dans :
  - Table Editor
  - Table Browser
  - Autres sections de l'interface

- **Exécutez-le UNIQUEMENT** dans le **SQL Editor**

## 🆘 Si vous rencontrez des erreurs

Si vous voyez des erreurs lors de l'exécution du script :

1. **Vérifiez que vous êtes dans le bon projet** Supabase
2. **Vérifiez que vous avez les permissions** d'administration
3. **Vérifiez les messages d'erreur** dans le SQL Editor
4. **Assurez-vous que le schéma `public` existe** dans votre projet

Si une table existe déjà, le script utilisera `CREATE TABLE IF NOT EXISTS`, donc il ne devrait pas générer d'erreur.


