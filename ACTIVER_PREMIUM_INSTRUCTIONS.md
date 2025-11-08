# 🎯 Activer Premium pour yorad35712@nyfhk.com

## 🚀 Méthode 1 : Via l'API Admin (RECOMMANDÉ)

### Option A : Avec curl (rapide)

Ouvrez un terminal et exécutez :

```bash
curl -X POST https://comptalyze.com/api/admin/set-premium \
  -H "Content-Type: application/json" \
  -d '{"email":"yorad35712@nyfhk.com"}'
```

### Option B : Avec le script Node.js

```bash
node activate-premium-yorad35712.js
```

### Option C : Avec Postman / Insomnia

- **Method:** POST
- **URL:** `https://comptalyze.com/api/admin/set-premium`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "email": "yorad35712@nyfhk.com"
}
```

### Option D : Directement dans le navigateur

1. Ouvrez la **console du navigateur** (F12)
2. Collez ce code :

```javascript
fetch('https://comptalyze.com/api/admin/set-premium', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'yorad35712@nyfhk.com' })
})
.then(res => res.json())
.then(data => console.log('✅ Résultat:', data))
.catch(err => console.error('❌ Erreur:', err));
```

3. Appuyez sur **Entrée**
4. Vous verrez la réponse dans la console

---

## 🗄️ Méthode 2 : Via Supabase SQL Editor

Si l'API ne fonctionne pas, utilisez SQL directement :

1. Allez sur **Supabase Dashboard**
2. **SQL Editor** (dans le menu de gauche)
3. Cliquez sur **"New query"**
4. Collez ce script :

```sql
-- Activer Premium pour yorad35712@nyfhk.com
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{subscription_plan}',
        '"premium"'
      ),
      '{is_pro}',
      'true'
    ),
    '{is_premium}',
    'true'
  ),
  '{subscription_status}',
  '"active"'
)
WHERE email = 'yorad35712@nyfhk.com';

-- Créer l'enregistrement subscription
INSERT INTO public.subscriptions (user_id, status, price_id, stripe_subscription_id, stripe_customer_id)
SELECT 
  id,
  'active',
  'price_premium_manual',
  'sub_manual_premium',
  'cus_manual_premium'
FROM auth.users
WHERE email = 'yorad35712@nyfhk.com'
ON CONFLICT (user_id) 
DO UPDATE SET
  status = 'active',
  updated_at = NOW();

-- Vérifier
SELECT 
  email,
  raw_user_meta_data->>'subscription_plan' as plan,
  raw_user_meta_data->>'is_premium' as is_premium
FROM auth.users
WHERE email = 'yorad35712@nyfhk.com';
```

5. Cliquez sur **"Run"** (ou Ctrl+Enter)

---

## ✅ Vérification après activation

Après avoir exécuté une des méthodes ci-dessus :

1. **L'utilisateur doit se déconnecter**
2. **Fermer complètement le navigateur** (ou vider le cache)
3. **Se reconnecter**
4. Le statut Premium devrait maintenant être actif

### Dans le dashboard, il devrait voir :
- ✅ Badge "Premium" dans la sidebar
- ✅ Accès à toutes les fonctionnalités Premium
- ✅ ComptaBot disponible
- ✅ Calendrier fiscal accessible
- ✅ Statistiques avancées visibles

---

## 🔍 Vérifier que ça a marché

### Méthode 1 : Dans Supabase

```sql
SELECT 
  email,
  raw_user_meta_data->>'subscription_plan' as plan,
  raw_user_meta_data->>'is_premium' as is_premium,
  raw_user_meta_data->>'subscription_status' as status
FROM auth.users
WHERE email = 'yorad35712@nyfhk.com';
```

**Résultat attendu :**
- plan: `premium`
- is_premium: `true`
- status: `active`

### Méthode 2 : Dans l'application

1. Connectez-vous avec ce compte
2. Allez sur `/dashboard/compte`
3. Vous devriez voir "Plan actuel : Premium"

---

## ⚠️ Si ça ne marche toujours pas

Si après toutes ces étapes l'utilisateur ne voit pas le statut Premium :

1. **Vérifiez les variables d'environnement sur Vercel** :
   - `SUPABASE_SERVICE_ROLE_KEY` doit être définie
   - Elle doit commencer par `eyJ...`

2. **Vérifiez dans Supabase** que les métadonnées ont bien été mises à jour

3. **Videz le cache** :
   - Chrome : Ctrl+Shift+Del > "Cached images and files"
   - Ou mode incognito pour tester

---

## 📦 Fichiers créés

- ✅ `ACTIVATE_PREMIUM_yorad35712.sql` - Script SQL direct
- ✅ `activate-premium-yorad35712.js` - Script Node.js
- ✅ `ACTIVER_PREMIUM_INSTRUCTIONS.md` - Ce guide

Choisissez la méthode qui vous convient le mieux !

