# 📋 Guide : Exécuter la migration SQL dans Supabase

## 🎯 Où exécuter le script ?

Vous devez utiliser le **SQL Editor** de Supabase, PAS la section "user calculation history".

## 📝 Étapes détaillées

### Étape 1 : Accéder au SQL Editor

1. Connectez-vous à [supabase.com](https://supabase.com)
2. Sélectionnez votre projet Comptalyze
3. Dans le menu de gauche, cliquez sur **SQL Editor** (ou **SQL**)
   - C'est l'icône avec `</>` ou le symbole SQL
   - C'est généralement dans la section "Database" ou "Development"

### Étape 2 : Créer une nouvelle requête

1. Dans le SQL Editor, cliquez sur le bouton **"New query"** (Nouvelle requête)
   - Ou utilisez le raccourci clavier si disponible

### Étape 3 : Coller le script

1. Ouvrez le fichier `supabase_migration_remove_unique.sql` dans votre projet
2. **Sélectionnez tout le contenu** (Ctrl+A puis Ctrl+C)
3. **Collez-le** dans l'éditeur SQL de Supabase (Ctrl+V)

### Étape 4 : Exécuter le script

1. Cliquez sur le bouton **"Run"** (Exécuter) en bas de l'éditeur
   - Ou utilisez Ctrl+Enter
2. Attendez que la requête s'exécute

### Étape 5 : Vérifier le résultat

Vous devriez voir :
- Un message de succès si la contrainte a été supprimée
- Un message "NOTICE" indiquant quelle contrainte a été supprimée
- Une requête SELECT qui ne retourne aucun résultat (ce qui signifie que la contrainte n'existe plus)

## ⚠️ Important

- **N'exécutez PAS** ce script dans :
  - Table Editor
  - Table Browser
  - "user calculation history"
  - Autres sections de l'interface

- **Exécutez-le UNIQUEMENT** dans le **SQL Editor**

## ✅ Résultat attendu

Si tout fonctionne correctement, vous verrez quelque chose comme :
```
NOTICE: Contrainte UNIQUE supprimée: ca_records_user_id_year_month_activity_type_key
```

Et la requête SELECT à la fin ne retournera aucun résultat (tableau vide), ce qui signifie que toutes les contraintes UNIQUE ont bien été supprimées.

## 🐛 Si vous rencontrez une erreur

Si vous voyez une erreur, vérifiez :
1. Que vous êtes bien dans le SQL Editor
2. Que vous avez collé tout le script
3. Que la table `ca_records` existe déjà dans votre base de données

Si la table n'existe pas encore, exécutez d'abord le script `supabase_setup.sql` complet.

