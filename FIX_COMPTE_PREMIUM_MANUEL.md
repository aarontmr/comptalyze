# ✅ Correction : Badge d'essai sur compte Premium MANUEL

## 🎯 Problème identifié

**Cas particulier :** Compte ajouté manuellement en Premium (sans passer par Stripe)

### Scénario problématique :

1. Compte créé et défini manuellement comme Premium
2. Métadonnées définies dans Supabase :
   ```json
   {
     "is_premium": true,
     "subscription_plan": "premium",
     "subscription_status": "active",
     "stripe_subscription_id": null  // ← Pas de Stripe car manuel
   }
   ```
3. Si `premium_trial_active` et `premium_trial_ends_at` sont présents :
   - ❌ Le badge "Essai gratuit" s'affiche quand même !

### Pourquoi ?

La première correction ne gérait que les comptes Stripe :

```typescript
// ❌ Correction incomplète
const hasStripeSubscription = !!metadata.stripe_subscription_id;

if (trialActive && trialEndsAt && !hasStripeSubscription) {
  // Pour un compte manuel : hasStripeSubscription = false
  // Donc on entre ici et on check le trial
  // Résultat : Badge d'essai affiché !
}
```

---

## 🔧 Solution complète

### Fichier modifié : `lib/subscriptionUtils.ts` (lignes 37-61)

**✅ Nouvelle logique :**

```typescript
// Un utilisateur est considéré comme "vraiment Premium/Pro" (pas en trial) si :
// 1. Il a un stripe_subscription_id (client Stripe)
// 2. OU il a status === 'active' (compte manuel activé)
// 3. OU il a subscription_plan === 'premium'/'pro' explicitement (compte manuel)
const isPaidOrManualAccount = 
  hasStripeSubscription || 
  status === 'active' || 
  subscriptionPlan === 'premium' || 
  subscriptionPlan === 'pro';

if (trialActive && trialEndsAt && !isPaidOrManualAccount) {
  // Seulement si AUCUNE des conditions ci-dessus n'est remplie
  isTrial = now < trialEnd;
}
```

---

## 📋 Cas d'usage couverts

### ✅ Cas 1 : Compte Premium Stripe
```json
{
  "is_premium": true,
  "stripe_subscription_id": "sub_xxx",
  "premium_trial_active": true  // Reste présent mais ignoré
}
```
**Résultat :** ✅ `isTrial: false` (hasStripeSubscription = true)

---

### ✅ Cas 2 : Compte Premium manuel avec status
```json
{
  "is_premium": true,
  "subscription_status": "active",
  "stripe_subscription_id": null,
  "premium_trial_active": true
}
```
**Résultat :** ✅ `isTrial: false` (status === 'active')

---

### ✅ Cas 3 : Compte Premium manuel avec subscription_plan
```json
{
  "is_premium": true,
  "subscription_plan": "premium",
  "stripe_subscription_id": null,
  "premium_trial_active": true
}
```
**Résultat :** ✅ `isTrial: false` (subscriptionPlan === 'premium')

---

### ✅ Cas 4 : Compte Pro manuel
```json
{
  "is_pro": true,
  "subscription_plan": "pro",
  "stripe_subscription_id": null
}
```
**Résultat :** ✅ `isTrial: false` (subscriptionPlan === 'pro')

---

### ✅ Cas 5 : Vraiment en essai gratuit
```json
{
  "is_premium": true,
  "premium_trial_active": true,
  "premium_trial_ends_at": "2025-11-15...",
  "stripe_subscription_id": null,
  "subscription_status": null,
  "subscription_plan": null
}
```
**Résultat :** ✅ `isTrial: true` (aucune des conditions n'est remplie, donc vraiment en trial)

---

## 🔍 Comment définir un compte Premium manuel

Si vous voulez créer un compte Premium manuel (pour tests ou accès gratuit) :

### Option 1 : Via Supabase Dashboard

1. Allez dans **Authentication** → **Users**
2. Cliquez sur l'utilisateur
3. Modifiez **User Metadata** :

```json
{
  "is_premium": true,
  "subscription_plan": "premium",
  "subscription_status": "active"
}
```

**Important :** Ne PAS mettre `premium_trial_active: true`

---

### Option 2 : Via SQL (Supabase SQL Editor)

```sql
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  jsonb_set(
    jsonb_set(
      raw_user_meta_data,
      '{is_premium}',
      'true'
    ),
    '{subscription_plan}',
    '"premium"'
  ),
  '{subscription_status}',
  '"active"'
)
WHERE email = 'utilisateur@example.com';
```

---

### Option 3 : Via script d'activation manuelle

Créer un fichier `scripts/activate-premium-manual.js` :

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function activatePremiumManual(email) {
  // Récupérer l'utilisateur
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) {
    console.error('Utilisateur non trouvé');
    return;
  }

  // Mettre à jour les métadonnées
  const { data, error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    {
      user_metadata: {
        ...user.user_metadata,
        is_premium: true,
        subscription_plan: 'premium',
        subscription_status: 'active',
        // NE PAS inclure premium_trial_active
      }
    }
  );

  if (updateError) {
    console.error('Erreur:', updateError);
  } else {
    console.log('✅ Utilisateur activé en Premium manuel');
  }
}

// Usage
activatePremiumManual('utilisateur@example.com');
```

---

## 🧪 Test de validation

### Pour votre compte actuel :

1. **Ouvrez la console du navigateur** (F12)
2. **Exécutez** :
```javascript
const { data: { session } } = await window.supabase.auth.getSession();
console.log('Métadonnées:', session.user.user_metadata);
```

3. **Vérifiez** :
```javascript
// Vous devriez voir quelque chose comme :
{
  is_premium: true,
  subscription_plan: "premium",  // ← Important
  subscription_status: "active", // ← Important
  stripe_subscription_id: null,  // ← OK pour compte manuel
  premium_trial_active: true     // ← Peut rester, sera ignoré
}
```

4. **Rafraîchissez la page** (`Ctrl+Shift+R`)
5. **Le badge "Essai gratuit" devrait disparaître** ✅

---

## 🔄 Si le badge persiste encore

### Nettoyage des métadonnées trial (optionnel)

Si vous voulez être sûr à 100%, vous pouvez supprimer les métadonnées trial :

```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data - 'premium_trial_active' - 'premium_trial_ends_at'
WHERE email = 'votre@email.com';
```

**Mais ce n'est pas nécessaire** avec la nouvelle logique, qui les ignore automatiquement.

---

## 📊 Tableau de décision

| Condition | Stripe ID | Status | subscription_plan | Résultat isTrial |
|-----------|-----------|--------|-------------------|------------------|
| Compte Stripe | ✅ | - | - | ❌ false |
| Compte manuel | ❌ | ✅ active | - | ❌ false |
| Compte manuel | ❌ | - | ✅ premium/pro | ❌ false |
| Vraiment trial | ❌ | ❌ | ❌ | ✅ true (si date valide) |

---

## ✅ Avantages de cette approche

1. **Flexible** - Fonctionne avec Stripe ET comptes manuels
2. **Sûre** - Plusieurs conditions de vérification
3. **Maintenable** - Logique claire et explicite
4. **Compatible** - Ne casse pas les comptes existants

---

## 🎓 Bonnes pratiques pour comptes manuels

### DO ✅

```json
// Compte Premium manuel
{
  "is_premium": true,
  "subscription_plan": "premium",
  "subscription_status": "active"
}

// OU

// Compte Pro manuel
{
  "is_pro": true,
  "subscription_plan": "pro",
  "subscription_status": "active"
}
```

### DON'T ❌

```json
// Ne PAS faire ça pour un compte manuel permanent
{
  "is_premium": true,
  "premium_trial_active": true,  // ← NON ! Seulement pour vrais trials
  "premium_trial_ends_at": "2025-11-15..."
}
```

---

## 🆘 Dépannage

### Le badge s'affiche encore ?

**Étape 1 :** Vérifiez les métadonnées

```javascript
const { data: { session } } = await window.supabase.auth.getSession();
const metadata = session.user.user_metadata;

console.log('subscription_plan:', metadata.subscription_plan);
console.log('subscription_status:', metadata.subscription_status);
console.log('stripe_subscription_id:', metadata.stripe_subscription_id);
```

**Étape 2 :** Au moins UNE de ces valeurs doit être présente :
- `subscription_plan` = "premium" ou "pro"
- `subscription_status` = "active"
- `stripe_subscription_id` = quelque chose

**Étape 3 :** Si aucune n'est présente, ajoutez-les via Supabase Dashboard

---

## ✅ Résultat

Avec cette correction complète :

- ✅ Comptes **Stripe** → Pas de badge trial
- ✅ Comptes **manuels** → Pas de badge trial
- ✅ Vrais **essais gratuits** → Badge trial affiché
- ✅ Essais **expirés** → Retour au plan Free

**Le système fonctionne maintenant pour TOUS les types de comptes ! 🎉**

