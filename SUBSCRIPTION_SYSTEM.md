# 💳 Système d'abonnements Comptalyze

Ce document explique comment fonctionne le système d'abonnements pour donner accès aux fonctionnalités Pro et Premium après paiement.

## 📋 Vue d'ensemble

Le système fonctionne en 4 étapes :

1. **Checkout** : L'utilisateur clique sur "Passer à Pro" ou "Passer à Premium"
2. **Paiement Stripe** : Redirection vers Stripe Checkout pour le paiement
3. **Webhook** : Stripe envoie un événement quand le paiement est réussi
4. **Activation** : Le webhook met à jour le profil utilisateur dans Supabase

## 🔄 Flux complet

### 1. Initiation du checkout (`/app/api/checkout/route.ts`)

Quand un utilisateur clique sur un bouton d'abonnement :

```typescript
// Frontend envoie : { plan: "pro", userId: "user-uuid" }
// Backend crée une session Stripe avec :
- client_reference_id: userId
- metadata: { userId, plan }
```

### 2. Webhook Stripe (`/app/api/webhook/route.ts`)

Stripe envoie des événements HTTP POST vers `/api/webhook` :

#### `checkout.session.completed`
Quand le paiement est réussi :
- Récupère le `userId` depuis les métadonnées
- Met à jour `user_metadata` dans Supabase :
  ```typescript
  {
    subscription_plan: "pro" | "premium",
    is_pro: true,
    is_premium: true/false,
    stripe_customer_id: "...",
    stripe_subscription_id: "...",
    subscription_status: "active"
  }
  ```

#### `customer.subscription.updated`
Quand l'abonnement change (upgrade/downgrade) :
- Met à jour le plan dans `user_metadata`

#### `customer.subscription.deleted`
Quand l'abonnement est annulé :
- Retire l'accès Pro/Premium :
  ```typescript
  {
    subscription_plan: null,
    is_pro: false,
    is_premium: false,
    subscription_status: "canceled"
  }
  ```

## 🔐 Vérification du plan utilisateur

### Fonction utilitaire (`lib/subscriptionUtils.ts`)

```typescript
import { getUserSubscription, hasFeatureAccess } from '@/lib/subscriptionUtils';

// Récupérer le plan
const subscription = getUserSubscription(user);
// Retourne : { plan: 'free'|'pro'|'premium', isPro, isPremium, status }

// Vérifier une fonctionnalité
const canExportPDF = hasFeatureAccess(user, 'export_pdf');
```

### Fonctionnalités par plan

| Fonctionnalité | Gratuit | Pro | Premium |
|----------------|---------|-----|---------|
| Simulations/mois | 3 | Illimité | Illimité |
| Export PDF | ❌ | ✅ | ✅ |
| Rappels URSSAF | ❌ | ❌ | ✅ |
| Support prioritaire | ❌ | ❌ | ✅ |

## 🛠️ Utilisation dans les composants

### Exemple dans UrssafCalculator

```typescript
import { getUserSubscription, hasFeatureAccess } from '@/lib/subscriptionUtils';

const subscription = getUserSubscription(user);
const isPro = subscription.isPro;
const canExportPDF = hasFeatureAccess(user, 'export_pdf');
```

## ⚙️ Configuration requise

### Variables d'environnement

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_PREMIUM=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Configuration Stripe Webhook

1. Allez dans Stripe Dashboard > Developers > Webhooks
2. Ajoutez l'URL : `https://votre-domaine.com/api/webhook`
3. Sélectionnez les événements :
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copiez le **Webhook signing secret** dans `.env.local`

## 🧪 Test

### Test en mode développement

1. Utilisez les **test cards** de Stripe :
   - `4242 4242 4242 4242` (succès)
   - `4000 0000 0000 0002` (carte refusée)

2. Utilisez Stripe CLI pour tester les webhooks localement :
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook
   ```

3. Vérifiez les logs dans la console serveur pour voir les mises à jour

### Vérifier que ça fonctionne

1. Faites un paiement test
2. Vérifiez dans Supabase :
   - Table Editor > Users
   - Les `user_metadata` doivent contenir `subscription_plan`, `is_pro`, etc.

## 🔍 Dépannage

### L'utilisateur n'a pas accès après paiement

1. Vérifiez que le webhook est bien configuré dans Stripe
2. Vérifiez les logs du serveur (console)
3. Vérifiez que `STRIPE_WEBHOOK_SECRET` est correct
4. Testez avec Stripe CLI en local

### Le userId n'est pas trouvé

- Vérifiez que le frontend envoie bien `userId` dans la requête checkout
- Vérifiez que l'utilisateur est bien connecté avant de cliquer sur le bouton

### Les métadonnées ne se mettent pas à jour

- Vérifiez que `SUPABASE_SERVICE_ROLE_KEY` est correct
- Vérifiez les logs d'erreur dans la console serveur

## 📝 Notes importantes

- Les métadonnées sont stockées dans `user_metadata` de Supabase Auth
- Le statut est vérifié côté client (pas de protection serveur stricte)
- Pour une sécurité renforcée, vérifiez aussi côté serveur dans les API routes
- Les sessions Supabase sont stockées dans `localStorage`, pas dans les cookies HTTP

