# 🎁 Système de Période d'Essai - Comptalyze

## 📋 Vue d'ensemble

Le système de période d'essai de 3 jours permet aux utilisateurs de tester les plans **Pro** et **Premium** gratuitement via Stripe Checkout, avec gestion automatisée des transitions d'état.

### ✨ Fonctionnalités

- ✅ **3 jours d'essai gratuit** via Stripe
- ✅ **Aucune carte requise** pendant le trial (optionnel)
- ✅ **Webhooks idempotents** (pas de double traitement)
- ✅ **Source de vérité unique** : Table `user_profiles` en DB
- ✅ **Gating automatique** par plan (PlanGate)
- ✅ **Compte à rebours** en temps réel (TrialBadge)
- ✅ **Réconciliation automatique** via cron (expiration manquée)
- ✅ **Downgrade automatique** à la fin du trial

---

## 🔄 Diagramme de Séquence

### 1️⃣ Démarrage du Trial

```
Utilisateur                 Frontend            API Checkout         Stripe             Webhook           Supabase
    |                          |                      |                  |                  |                  |
    |---(1) Click "Essayer"--->|                      |                  |                  |                  |
    |                          |                      |                  |                  |                  |
    |                          |---(2) POST /api/checkout                 |                  |                  |
    |                          |       {plan: "premium"}                  |                  |                  |
    |                          |                      |                  |                  |                  |
    |                          |                      |---(3) Create Session                |                  |
    |                          |                      |    trial_period_days: 3             |                  |
    |                          |                      |                  |                  |                  |
    |                          |                      |<---(4) Session URL------------------|                  |
    |                          |<---(5) {url}---------|                  |                  |                  |
    |                          |                      |                  |                  |                  |
    |<---(6) Redirect to Stripe|                      |                  |                  |                  |
    |                          |                      |                  |                  |                  |
    |===(7) Complete Checkout===================>|                  |                  |                  |
    |                          |                      |                  |                  |                  |
    |                          |                      |                  |---(8) checkout.session.completed--->|
    |                          |                      |                  |                  |                  |
    |                          |                      |                  |                  |---(9) Verify signature
    |                          |                      |                  |                  |                  |
    |                          |                      |                  |                  |---(10) Check idempotence
    |                          |                      |                  |                  |     (webhook_events)
    |                          |                      |                  |                  |                  |
    |                          |                      |                  |                  |---(11) Fetch Subscription
    |                          |                      |                  |                  |      (trial_end timestamp)
    |                          |                      |                  |                  |                  |
    |                          |                      |                  |                  |---(12) Upsert user_profiles
    |                          |                      |                  |                  |      plan: 'free'
    |                          |                      |                  |                  |      plan_status: 'trialing'
    |                          |                      |                  |                  |      trial_plan: 'premium'
    |                          |                      |                  |                  |      trial_ends_at: +3j
    |                          |                      |                  |                  |                  |
    |                          |                      |                  |                  |---(13) Mark event processed
    |                          |                      |                  |                  |                  |
    |<---(14) Redirect /success|                      |                  |                  |                  |
    |                          |                      |                  |                  |                  |
    |===(15) Dashboard affiche TrialBadge "3 jours restants"============>|                  |
```

### 2️⃣ Fin du Trial (Paiement Réussi)

```
Stripe                      Webhook                Supabase             Utilisateur
  |                            |                       |                     |
  |---(1) trial_end reached--->|                       |                     |
  |     First payment          |                       |                     |
  |                            |                       |                     |
  |---(2) customer.subscription.updated                |                     |
  |     status: 'active'       |                       |                     |
  |                            |                       |                     |
  |                            |---(3) Verify + Check idempotence            |
  |                            |                       |                     |
  |                            |---(4) Upsert user_profiles                  |
  |                            |      plan: 'premium'  |                     |
  |                            |      plan_status: 'active'                  |
  |                            |      trial_plan: NULL |                     |
  |                            |      trial_ends_at: NULL                    |
  |                            |                       |                     |
  |                            |<---(5) Success--------|                     |
  |                            |                       |                     |
  |                            |                       |---(6) User voit plan Premium actif
```

### 3️⃣ Expiration sans Paiement (Cron)

```
Vercel Cron              API /cron/reconcile-trials    Supabase        Stripe          Utilisateur
    |                              |                        |              |                |
    |---(1) Daily 03:00 UTC------->|                        |              |                |
    |    Header: Bearer CRON_SECRET                         |              |                |
    |                              |                        |              |                |
    |                              |---(2) SELECT trials WHERE              |                |
    |                              |    plan_status='trialing'              |                |
    |                              |    AND trial_ends_at < NOW()           |                |
    |                              |                        |              |                |
    |                              |<---(3) [expired trials]|              |                |
    |                              |                        |              |                |
    |                              |---(4) For each: Check Stripe subscription               |
    |                              |                        |              |                |
    |                              |                        |<---(5) Retrieve sub           |
    |                              |                        |              |                |
    |                              |---(6) If still 'trialing' or no payment:                |
    |                              |    UPDATE user_profiles               |                |
    |                              |    plan='free', status='canceled'     |                |
    |                              |                        |              |                |
    |                              |                        |              |---(7) Lose access
```

---

## 🗂️ Architecture de la Base de Données

### Table `user_profiles`

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,                  -- Lien avec auth.users
  
  -- Plan actif (plan payant)
  plan TEXT DEFAULT 'free',             -- 'free' | 'pro' | 'premium'
  plan_status TEXT DEFAULT 'none',      -- 'none' | 'trialing' | 'active' | 'canceled' | 'past_due'
  
  -- Trial
  trial_plan TEXT,                      -- 'pro' | 'premium' (pendant trial)
  trial_ends_at TIMESTAMPTZ,            -- Date de fin du trial
  
  -- Stripe
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Table `webhook_events` (Idempotence)

```sql
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY,
  stripe_event_id TEXT UNIQUE NOT NULL,  -- evt_xxx
  event_type TEXT NOT NULL,
  payload JSONB,
  processed_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🔐 Gating des Fonctionnalités

### Utilisation de `PlanGate`

```tsx
import PlanGate from '@/app/components/PlanGate';

export default function PremiumFeature() {
  return (
    <PlanGate requiredPlan="premium" feature="ComptaBot">
      {/* Contenu réservé Premium */}
      <ComptaBot />
    </PlanGate>
  );
}
```

**Comportement :**
- Si `effectivePlan >= requiredPlan` → Affiche le contenu
- Si en trial du bon plan → Affiche le contenu
- Sinon → Affiche l'overlay d'upgrade

### Affichage du Badge de Trial

```tsx
import TrialBadge from '@/app/components/TrialBadge';

export default function DashboardLayout() {
  return (
    <div>
      <TrialBadge />  {/* Affiche automatiquement si trial actif */}
      {/* ... */}
    </div>
  );
}
```

---

## ⚙️ Configuration

### 1. Variables d'environnement

```env
# Stripe (REQUIS)
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# Supabase (REQUIS)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# Cron (REQUIS pour prod)
CRON_SECRET=your-random-secret-uuid

# Plans (REQUIS)
STRIPE_PRICE_PRO=price_xxx
STRIPE_PRICE_PREMIUM=price_xxx
STRIPE_PRICE_PRO_YEARLY=price_xxx
STRIPE_PRICE_PREMIUM_YEARLY=price_xxx
```

### 2. Stripe Dashboard

#### a) Créer les produits

1. Dashboard > Products > Add product
2. Créer **Pro** et **Premium** avec prix mensuel/annuel
3. Copier les `price_xxx` dans `.env`

#### b) Configurer le Webhook

1. Dashboard > Developers > Webhooks > Add endpoint
2. URL : `https://comptalyze.com/api/stripe/webhook`
3. Événements à écouter :
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
4. Copier le `whsec_xxx` dans `STRIPE_WEBHOOK_SECRET`

### 3. Supabase

```bash
# Exécuter la migration
psql -h db.xxx.supabase.co -U postgres -d postgres -f supabase/migrations/20250111_fix_trials_system.sql
```

Ou via l'interface Supabase :
1. SQL Editor > New query
2. Coller le contenu de la migration
3. Run

### 4. Vercel Cron

Le cron est déjà configuré dans `vercel.json` :

```json
{
  "crons": [
    {
      "path": "/api/cron/reconcile-trials",
      "schedule": "0 3 * * *"
    }
  ]
}
```

**Configurer le secret :**
1. Vercel Dashboard > Settings > Environment Variables
2. Ajouter `CRON_SECRET` avec une valeur aléatoire (UUID)
3. Redéployer

---

## 🧪 Tests

### Exécuter les tests

```bash
# Tests d'intégration (webhooks, cron)
npm run test:integration

# Tests E2E (Playwright)
npm run test:e2e

# Tous les tests
npm run test:all
```

### Tests manuels avec Stripe CLI

```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# Se connecter
stripe login

# Écouter les webhooks localement
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Déclencher un événement de test
stripe trigger checkout.session.completed
```

---

## 🐛 Dépannage

### Problème : Le trial ne démarre pas

**Symptômes :** Après checkout, l'utilisateur est toujours en "Free"

**Causes possibles :**
1. ❌ Webhook non reçu
2. ❌ Signature invalide
3. ❌ `userId` manquant dans metadata

**Solutions :**

```bash
# 1. Vérifier les logs Stripe
# Dashboard > Developers > Webhooks > [votre endpoint] > Recent events

# 2. Vérifier les logs Vercel
vercel logs --follow

# 3. Vérifier la DB
psql> SELECT * FROM user_profiles WHERE id = 'xxx';

# 4. Vérifier les webhook_events (idempotence)
psql> SELECT * FROM webhook_events ORDER BY processed_at DESC LIMIT 10;
```

### Problème : Trial ne s'active pas après paiement

**Symptômes :** Trial expiré, paiement réussi, mais toujours en "Free"

**Cause :** Webhook `customer.subscription.updated` (status=active) non traité

**Solution :**

```bash
# Réconcilier manuellement
curl -X GET https://comptalyze.com/api/cron/reconcile-trials \
  -H "Authorization: Bearer $CRON_SECRET"
```

### Problème : Double traitement des webhooks

**Symptômes :** Utilisateur reçoit 2 emails, logs en double

**Cause :** Webhook reçu plusieurs fois par Stripe (retry)

**Vérification :**

```sql
-- Vérifier les doublons
SELECT stripe_event_id, COUNT(*) 
FROM webhook_events 
GROUP BY stripe_event_id 
HAVING COUNT(*) > 1;
```

**Solution :** L'idempotence est déjà implémentée. Si des doublons existent, vérifier que la table `webhook_events` a bien la contrainte `UNIQUE(stripe_event_id)`.

### Problème : Cron ne s'exécute pas

**Symptômes :** Trials expirés restent actifs

**Causes :**
1. ❌ `CRON_SECRET` incorrect
2. ❌ Cron désactivé sur Vercel

**Solutions :**

```bash
# 1. Tester manuellement
curl -X GET https://comptalyze.com/api/cron/reconcile-trials \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# 2. Vérifier les logs Vercel > Cron Jobs

# 3. Vérifier vercel.json
cat vercel.json | grep reconcile-trials
```

---

## 📊 Métriques & Monitoring

### KPIs à suivre

```sql
-- Nombre de trials actifs
SELECT COUNT(*) FROM user_profiles WHERE plan_status = 'trialing';

-- Taux de conversion trial → payant
SELECT 
  COUNT(CASE WHEN plan_status = 'active' THEN 1 END)::FLOAT / 
  COUNT(CASE WHEN plan_status IN ('trialing', 'active', 'canceled') THEN 1 END) * 100 
  AS conversion_rate
FROM user_profiles;

-- Trials par plan
SELECT trial_plan, COUNT(*) 
FROM user_profiles 
WHERE plan_status = 'trialing' 
GROUP BY trial_plan;

-- Moyenne des jours utilisés avant annulation
SELECT AVG(
  EXTRACT(DAY FROM (trial_ends_at - created_at))
) AS avg_trial_duration
FROM user_profiles
WHERE plan_status = 'canceled' AND trial_ends_at IS NOT NULL;
```

---

## ✅ Checklist de Déploiement

Avant de déployer en production :

- [ ] Migration Supabase exécutée
- [ ] Variables d'environnement configurées sur Vercel
- [ ] Webhook Stripe configuré (URL production)
- [ ] `STRIPE_WEBHOOK_SECRET` mis à jour avec le secret de prod
- [ ] Clés Stripe en mode LIVE (`sk_live_`, `pk_live_`)
- [ ] `CRON_SECRET` généré et configuré
- [ ] Tests Stripe CLI passés
- [ ] Tests d'intégration passés
- [ ] Webhook testé avec `stripe trigger`
- [ ] Cron testé manuellement avec `curl`

---

## 🚀 Résumé GO/NO-GO

### ✅ GO (Tout est prêt)

- [x] Migration DB appliquée
- [x] Webhook handler idempotent implémenté
- [x] Checkout avec `trial_period_days: 3`
- [x] Gating via `PlanGate` (source DB)
- [x] TrialBadge avec compte à rebours
- [x] Cron de réconciliation configuré
- [x] Tests créés (intégration + E2E)
- [x] Variables ENV validées
- [x] Documentation complète

### ⚠️ TODO Restants (Optionnel)

- [ ] Emails transactionnels (Resend) :
  - [ ] Email de bienvenue au démarrage du trial
  - [ ] Email J-1 avant expiration
  - [ ] Email de conversion (trial → payant)
- [ ] Analytics :
  - [ ] Tracker événements trial dans Supabase (analytics_events)
  - [ ] Dashboard admin pour voir les métriques
- [ ] Optimisations :
  - [ ] Cache des profils utilisateurs (Redis ?)
  - [ ] Rate limiting sur les webhooks

---

## 📞 Support

En cas de problème :

1. Consulter les logs : `vercel logs --follow`
2. Vérifier Stripe Dashboard > Webhooks
3. Vérifier Supabase > SQL Editor (requêtes ci-dessus)
4. Tester manuellement le cron : `curl` avec `CRON_SECRET`

**Contact technique :** [Insérer contact]

---

**Dernière mise à jour :** 2025-01-11  
**Version :** 1.0.0  
**Auteur :** Senior Full-Stack Engineer @ Comptalyze


