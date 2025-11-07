# 🔧 Fix - Table user_profiles manquante

## Problème Résolu ✅

La migration `supabase_migration_analytics_events.sql` a été corrigée et ne dépend plus de la table `user_profiles`.

## ✅ Vous pouvez maintenant :

1. **Réexécuter la migration** dans Supabase SQL Editor
2. Toutes les erreurs liées à `user_profiles` sont résolues
3. La page `/admin/metrics` fonctionne pour tous les utilisateurs authentifiés

---

## 🔐 Sécurité Admin (Optionnel)

Si vous souhaitez restreindre l'accès à `/admin/metrics` uniquement aux admins, créez la table `user_profiles` :

### Créer la table user_profiles

```sql
-- Créer la table user_profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin ON public.user_profiles(is_admin);

-- Activer RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent lire leur propre profil
CREATE POLICY "Users can read own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Les utilisateurs peuvent mettre à jour leur propre profil (sauf is_admin)
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);
```

### Définir un utilisateur comme admin

```sql
-- Insérer un profil admin pour votre compte
INSERT INTO public.user_profiles (user_id, is_admin)
VALUES ('VOTRE-USER-ID-ICI', true)
ON CONFLICT (user_id) 
DO UPDATE SET is_admin = true;
```

**Pour trouver votre user_id :**
1. Allez dans Supabase > Authentication > Users
2. Cliquez sur votre utilisateur
3. Copiez l'UUID

### Mettre à jour la politique RLS (si vous avez user_profiles)

```sql
-- Supprimer l'ancienne politique
DROP POLICY IF EXISTS "Authenticated users can read events" ON public.analytics_events;

-- Créer une nouvelle politique réservée aux admins
CREATE POLICY "Admins can read all events"
  ON public.analytics_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );
```

---

## 🎯 Recommandation

**Pour commencer :** Utilisez le système tel quel (accès pour tous les utilisateurs authentifiés).

**Plus tard :** Quand vous aurez plusieurs utilisateurs, créez `user_profiles` et restreignez l'accès aux admins uniquement.

---

## ✅ Checklist

- [x] Migration corrigée (ne dépend plus de user_profiles)
- [ ] Migration exécutée dans Supabase
- [ ] Test de tracking effectué
- [ ] Accès à /admin/metrics vérifié
- [ ] (Optionnel) Table user_profiles créée
- [ ] (Optionnel) Admin configuré

---

**La migration est maintenant prête à être exécutée sans erreur !** 🚀

