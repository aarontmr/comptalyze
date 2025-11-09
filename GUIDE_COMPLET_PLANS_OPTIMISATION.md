# 🎯 Guide Complet : Optimisation et Cohérence des Plans

## ✅ Problème principal résolu

**Badge d'essai gratuit sur compte Premium** → CORRIGÉ ✅

La logique vérifie maintenant si l'utilisateur a un `stripe_subscription_id` avant d'afficher l'essai.

---

## 📋 Système de Plans - Vue d'ensemble

### Deux systèmes complémentaires

#### 1. **`lib/subscriptionUtils.ts`** - Logique client complète
```typescript
export function getUserSubscription(user: User): UserSubscription {
  return {
    plan: 'free' | 'pro' | 'premium',
    isPro: boolean,
    isPremium: boolean,
    status: string | null,
    isTrial: boolean,           // ← Important pour UI
    trialEndsAt: string | null, // ← Important pour UI
  };
}
```

**Utilisation :** Pages React, composants UI, affichage conditionnel

#### 2. **`lib/plan.ts`** - Vérification serveur
```typescript
export async function getUserPlan(supabase, userId): Promise<Plan> {
  // Vérifie la table 'subscriptions' avec Stripe
  return 'free' | 'pro' | 'premium';
}

export async function getUserPlanServer(userId, userMetadata?): Promise<Plan> {
  // Version serveur avec service_role_key
  return 'free' | 'pro' | 'premium';
}
```

**Utilisation :** API routes, vérification serveur, contrôle d'accès

---

## 🔍 Cohérence actuelle - Checklist

### ✅ Points déjà optimisés :

1. **Priorité Stripe**
   - ✅ `stripe_subscription_id` est prioritaire sur `premium_trial_active`
   - ✅ Un utilisateur payant n'est JAMAIS `isTrial: true`

2. **Gestion des essais**
   - ✅ Essai expire automatiquement après X jours
   - ✅ Essai expiré sans abonnement → retour au plan `free`

3. **Fallback sur user_metadata**
   - ✅ Si pas de données dans `subscriptions` table
   - ✅ Compatible avec anciens utilisateurs

### ⚠️ Points à vérifier :

1. **Fonctionnalités Premium accessibles en Free ?**
2. **Limites du plan Free respectées partout ?**
3. **Messages cohérents pour chaque plan ?**
4. **Webhooks Stripe mettent bien à jour les métadonnées ?**

---

## 📊 Matrice des Fonctionnalités

### Plan FREE (Gratuit)

| Fonctionnalité | Limite | Implémentation |
|----------------|--------|----------------|
| Calculs URSSAF | 3/mois | ✅ `UrssafCalculator` vérifie avec `simulationCount` |
| Enregistrements CA | Illimité | ✅ Pas de limite |
| Factures | 0 | ❓ À vérifier |
| Export PDF | Non | ✅ Bloqué par `hasFeatureAccess()` |
| ComptaBot IA | Non | ✅ Bloqué par vérification plan |
| Statistiques avancées | Non | ❓ À vérifier |
| Rappels URSSAF | Non | ✅ Bloqué |

### Plan PRO (9,90€/mois)

| Fonctionnalité | Limite | Implémentation |
|----------------|--------|----------------|
| Calculs URSSAF | Illimité | ✅ |
| Factures | Illimité | ✅ |
| Export PDF | Oui | ✅ |
| Prévisions 6 mois | Oui | ❓ À vérifier |
| Statistiques avancées | Oui | ❓ À vérifier |
| ComptaBot IA | Non | ✅ Bloqué |
| Rappels URSSAF | Non | ✅ Bloqué |

### Plan PREMIUM (19,90€/mois)

| Fonctionnalité | Limite | Implémentation |
|----------------|--------|----------------|
| Tout de Pro | + | ✅ |
| ComptaBot IA | Oui | ✅ |
| Rappels URSSAF auto | Oui | ✅ |
| Prévisions 12 mois | Oui | ❓ À vérifier |
| Support prioritaire | Oui | ℹ️ Pas technique |

---

## 🔒 Vérification des accès - Par composant

### 1. **`app/components/UrssafCalculator.tsx`**

**Vérifie :** Limite de 3 calculs pour le plan Free

```typescript
const FREE_PLAN_LIMIT = 3;

if (subscription.plan === 'free') {
  if (simulationCount >= FREE_PLAN_LIMIT) {
    // Affiche overlay "Upgrade"
    return <PremiumOverlay />;
  }
}
```

**Statut :** ✅ **Correct**

---

### 2. **`app/api/export-pdf/route.ts`**

**Devrait vérifier :** Pro ou Premium uniquement

```typescript
// À VÉRIFIER dans le code
const { getUserPlanServer } = await import('@/lib/plan');
const plan = await getUserPlanServer(userId, user.user_metadata);

if (plan === 'free') {
  return NextResponse.json(
    { error: 'Fonctionnalité réservée aux plans Pro et Premium' },
    { status: 403 }
  );
}
```

**Statut :** ❓ **À vérifier**

---

### 3. **`app/api/ai/chat/route.ts`** (ComptaBot)

**Devrait vérifier :** Premium uniquement

```typescript
if (plan !== 'premium') {
  return NextResponse.json(
    { error: 'Fonctionnalité réservée au plan Premium' },
    { status: 403 }
  );
}
```

**Statut :** ✅ **Correct** (vu dans la recherche)

---

### 4. **`app/api/ai/advice/route.ts`** (Conseils IA)

**Devrait vérifier :** Premium uniquement

**Statut :** ❓ **À vérifier**

---

### 5. **`app/factures/nouvelle/page.tsx`** (Créer facture)

**Devrait vérifier :** Pro ou Premium uniquement (ou limite pour Free)

**Statut :** ❓ **À vérifier**

---

### 6. **`app/dashboard/statistiques/page.tsx`**

**Devrait vérifier :** Pro ou Premium pour stats avancées

**Statut :** ❓ **À vérifier**

---

## 🛠️ Actions à effectuer

### Action 1 : Vérifier les routes API

```bash
# Fichiers à vérifier :
- app/api/export-pdf/route.ts
- app/api/ai/advice/route.ts
- app/api/invoices/[id]/route.ts (s'il existe)
```

**Ce qu'on cherche :**
```typescript
// Chaque route API devrait avoir ça en début :
const { getUserPlanServer } = await import('@/lib/plan');
const plan = await getUserPlanServer(userId, user.user_metadata);

if (plan === 'free') {
  // Bloquer ou limiter
}
```

---

### Action 2 : Vérifier les composants UI

```bash
# Fichiers à vérifier :
- app/factures/nouvelle/page.tsx
- app/dashboard/statistiques/page.tsx
- app/components/PremiumChatbot.tsx
```

**Ce qu'on cherche :**
```typescript
const subscription = getUserSubscription(user);

if (subscription.plan === 'free') {
  return <PremiumOverlay message="Upgrade pour accéder" />;
}
```

---

### Action 3 : Test complet des plans

#### Test 1 : Utilisateur FREE

1. Connectez-vous avec un compte Free
2. Essayez de :
   - ❓ Créer une facture → Devrait bloquer ou limiter
   - ❓ Exporter en PDF → Devrait bloquer
   - ❓ Accéder aux statistiques → Devrait limiter
   - ❓ Utiliser ComptaBot → Devrait bloquer
   - ✅ Faire 3 calculs URSSAF → OK
   - ❓ Faire un 4ème calcul → Devrait bloquer

#### Test 2 : Utilisateur PRO

1. Connectez-vous avec un compte Pro
2. Vérifiez que :
   - ✅ Calculs illimités
   - ✅ Export PDF fonctionne
   - ✅ Factures illimitées
   - ❌ ComptaBot bloqué
   - ❌ Rappels URSSAF bloqués

#### Test 3 : Utilisateur PREMIUM

1. Connectez-vous avec un compte Premium
2. Vérifiez que :
   - ✅ Tout fonctionne
   - ✅ ComptaBot accessible
   - ✅ Aucune limitation

#### Test 4 : Utilisateur en TRIAL

1. Démarrez un essai gratuit
2. Vérifiez que :
   - ✅ Badge "Essai gratuit" affiché
   - ✅ Toutes fonctionnalités Premium accessibles
   - ✅ Compte à rebours visible

#### Test 5 : PREMIUM payant (ancien trial)

1. Connectez-vous avec un compte Premium payant qui a eu un trial
2. Vérifiez que :
   - ✅ PAS de badge "Essai gratuit"
   - ✅ Badge "Premium" normal
   - ✅ Toutes fonctionnalités accessibles

---

## 🎨 Messages utilisateur cohérents

### Pour chaque blocage, afficher :

```typescript
// FREE → PRO/PREMIUM
{
  icon: '🔒',
  title: 'Fonctionnalité Premium',
  message: 'Cette fonctionnalité est réservée aux plans Pro et Premium.',
  cta: 'Découvrir les plans',
  ctaLink: '/pricing'
}

// FREE → PREMIUM uniquement
{
  icon: '✨',
  title: 'Fonctionnalité Premium',
  message: 'Accédez à ComptaBot et aux rappels automatiques avec le plan Premium.',
  cta: 'Passer à Premium',
  ctaLink: '/pricing'
}

// PRO → PREMIUM
{
  icon: '🚀',
  title: 'Upgrade vers Premium',
  message: 'Débloquez l\'IA ComptaBot et les rappels automatiques.',
  cta: 'Upgrade vers Premium',
  ctaLink: '/pricing'
}
```

---

## 📝 Script de test automatique

Créer un script pour tester tous les cas :

```typescript
// scripts/test-plans.ts
import { getUserSubscription } from '@/lib/subscriptionUtils';

const testCases = [
  {
    name: 'Free user',
    metadata: { subscription_plan: 'free' },
    expected: { plan: 'free', isPremium: false, isTrial: false }
  },
  {
    name: 'Trial user',
    metadata: {
      is_premium: true,
      premium_trial_active: true,
      premium_trial_ends_at: futureDate
    },
    expected: { plan: 'premium', isPremium: true, isTrial: true }
  },
  {
    name: 'Premium paid (ex-trial)',
    metadata: {
      is_premium: true,
      premium_trial_active: true,
      stripe_subscription_id: 'sub_xxx'
    },
    expected: { plan: 'premium', isPremium: true, isTrial: false }
  },
  // ... autres cas
];

// Exécuter tous les tests
testCases.forEach(test => {
  const result = getUserSubscription(mockUser(test.metadata));
  assert.deepEqual(result, test.expected);
});
```

---

## 🔄 Webhooks Stripe - Vérification

### Webhook `/api/webhook/route.ts` devrait gérer :

1. **`checkout.session.completed`**
   - ✅ Créer/mettre à jour la table `subscriptions`
   - ✅ Mettre à jour `user_metadata.stripe_subscription_id`
   - ✅ Mettre `subscription_status: 'active'`

2. **`customer.subscription.updated`**
   - ✅ Mettre à jour le statut dans `subscriptions`
   - ✅ Mettre à jour `user_metadata`

3. **`customer.subscription.deleted`**
   - ✅ Mettre statut `canceled` dans `subscriptions`
   - ✅ Retirer `stripe_subscription_id` de `user_metadata`

**Action :** Vérifier que le webhook gère tous ces cas correctement.

---

## ✅ Checklist finale d'optimisation

### Sécurité :
- [ ] Toutes les routes API vérifient le plan serveur-side
- [ ] Impossible de contourner les limites côté client
- [ ] Webhooks Stripe fonctionnent correctement

### UX :
- [ ] Messages d'upgrade clairs et cohérents
- [ ] Badge d'essai affiché uniquement pour les trials
- [ ] Pas de badge d'essai pour les abonnés payants ✅ FAIT
- [ ] Limites clairement affichées avant blocage

### Technique :
- [ ] `getUserSubscription()` cohérent partout
- [ ] `getUserPlanServer()` utilisé dans les API
- [ ] Fallback sur `user_metadata` si pas de données Stripe
- [ ] Gestion correcte des essais expirés

### Tests :
- [ ] Test manuel de tous les plans
- [ ] Test de tous les cas edge (trial expiré, etc.)
- [ ] Test des webhooks en local
- [ ] Test de la conversion trial → payant

---

## 🚀 Prochaines étapes

1. **Immédiat** ✅
   - [x] Corriger le badge d'essai pour Premium payant

2. **Court terme** (à faire maintenant)
   - [ ] Vérifier toutes les routes API
   - [ ] Vérifier les composants UI
   - [ ] Tester manuellement les 5 cas

3. **Moyen terme**
   - [ ] Créer un script de test automatique
   - [ ] Documenter les limites de chaque plan
   - [ ] Ajouter des analytics pour suivre les conversions

---

**Voulez-vous que je vérifie maintenant les routes API et composants pour m'assurer que tout est bien protégé ? 🔍**

