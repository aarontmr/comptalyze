# 🔍 Debug de l'essai gratuit - Guide complet

## 📊 Modifications apportées

J'ai ajouté des **logs détaillés** dans l'API et le frontend pour comprendre exactement ce qui se passe quand vous cliquez sur "Essai gratuit 3 jours".

---

## 🧪 Comment tester et voir les logs

### Étape 1 : Ouvrir la console du navigateur
1. Ouvrez votre site (en local ou en production)
2. Appuyez sur **F12** (ou clic droit > Inspecter)
3. Allez dans l'onglet **Console**

### Étape 2 : Se connecter et aller sur /pricing
1. Connectez-vous avec votre compte
2. Allez sur `/pricing`
3. Cliquez sur **"Essai gratuit 3 jours"**

### Étape 3 : Observer les logs
Vous devriez voir dans la console :

**✅ Si ça marche :**
```
🚀 Démarrage de l'essai pour: [votre-user-id]
📦 Réponse API: {success: true, trialEndsAt: "...", message: "..."}
✅ Essai activé avec succès
🔄 Rechargement de la page...
```

**❌ Si ça ne marche pas, vous verrez :**
```
🚀 Démarrage de l'essai pour: [votre-user-id]
📦 Réponse API: {error: "..."}
❌ Erreur API: [message d'erreur détaillé]
```

---

## 🔍 Logs côté serveur (backend)

Si vous êtes en **développement local** :
- Les logs API s'affichent dans votre **terminal** où tourne `npm run dev`

Si vous êtes sur **Vercel** (production) :
1. Allez sur **Vercel Dashboard**
2. Sélectionnez votre projet **Comptalyze**
3. Allez dans **Logs** ou **Functions**
4. Filtrez par `/api/start-trial`

Vous verrez :
```
🔍 Tentative de démarrage d'essai pour userId: xxx
📋 Métadonnées actuelles: {...}
📅 Dates d'essai: {...}
💾 Mise à jour des métadonnées: {...}
✅ Essai gratuit Premium démarré pour xxx jusqu'au xxx
```

---

## ⚠️ Erreurs possibles et solutions

### 1. "Vous avez déjà utilisé votre essai gratuit"
**Cause :** L'utilisateur a déjà un `premium_trial_started_at` dans ses métadonnées.

**Solution :** Réinitialiser les métadonnées de l'utilisateur :

```sql
-- Dans Supabase SQL Editor
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data - 'premium_trial_started_at' - 'premium_trial_ends_at' - 'premium_trial_active'
WHERE id = 'VOTRE_USER_ID';
```

### 2. "Vous avez déjà un abonnement Premium actif"
**Cause :** `is_premium = true` ET `stripe_subscription_id` existe.

**Solution :** Si c'est un faux positif (abonnement de test), nettoyer :

```sql
-- Dans Supabase SQL Editor
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data - 'stripe_subscription_id',
  '{is_premium}', 
  'false'
)
WHERE id = 'VOTRE_USER_ID';
```

### 3. "Erreur lors de l'activation de l'essai: ..."
**Cause :** Problème avec `SUPABASE_SERVICE_ROLE_KEY`.

**Solution :** Vérifier les variables d'environnement :

#### En local (.env.local) :
```bash
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key_ici
```

#### Sur Vercel :
1. Allez dans **Settings** > **Environment Variables**
2. Vérifiez que `SUPABASE_SERVICE_ROLE_KEY` existe
3. La valeur doit commencer par `eyJ...`
4. Redéployez après modification

### 4. "Utilisateur non trouvé"
**Cause :** La `SUPABASE_SERVICE_ROLE_KEY` est invalide ou manquante.

**Solution :** Récupérer la bonne clé :
1. Allez sur **Supabase Dashboard** > Votre projet
2. **Settings** > **API**
3. Copiez la **service_role key** (section "Project API keys")
4. Ajoutez-la dans vos variables d'environnement

---

## 🔧 Test rapide - Vérifier la variable d'environnement

Vous pouvez créer un endpoint de test temporaire :

```typescript
// app/api/test-trial-env/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const keyLength = process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0;
  
  return NextResponse.json({
    hasServiceKey,
    keyLength,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  });
}
```

Puis visitez `/api/test-trial-env` pour voir si la clé est chargée.

---

## 🎯 Checklist de vérification

- [ ] Variable `SUPABASE_SERVICE_ROLE_KEY` définie
- [ ] Variable `NEXT_PUBLIC_SUPABASE_URL` définie
- [ ] Utilisateur connecté sur la page pricing
- [ ] Utilisateur n'a pas déjà `premium_trial_started_at` dans ses métadonnées
- [ ] Console navigateur ouverte pour voir les logs
- [ ] Terminal/Vercel logs ouverts pour voir les logs serveur

---

## 🚀 Prochaines étapes

1. **Testez** avec les logs activés
2. **Copiez-collez** les logs d'erreur que vous voyez
3. Si l'erreur persiste, je pourrai analyser les logs et trouver la cause exacte

---

## 💡 Astuce

Si vous voulez **activer manuellement** l'essai pour tester :

```sql
-- Supabase SQL Editor
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          raw_user_meta_data,
          '{premium_trial_started_at}',
          to_jsonb(NOW()::text)
        ),
        '{premium_trial_ends_at}',
        to_jsonb((NOW() + interval '3 days')::text)
      ),
      '{is_premium}',
      'true'
    ),
    '{subscription_plan}',
    '"premium"'
  ),
  '{premium_trial_active}',
  'true'
)
WHERE email = 'VOTRE_EMAIL_ICI';
```

Remplacez `VOTRE_EMAIL_ICI` par votre email.

---

## 📞 Si le problème persiste

Envoyez-moi :
1. Les logs de la **console navigateur** (avec les emojis 🚀 📦 ❌)
2. Les logs du **serveur/Vercel** 
3. Votre **user_metadata** actuel (sans infos sensibles)

Je pourrai alors identifier précisément le problème !

