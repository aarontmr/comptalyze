# 🎯 Onboarding Premium + Intégrations

## ✅ Implémentation Complète

Ce document décrit le système complet d'onboarding Premium avec intégrations Shopify/Stripe et synchronisation automatique du CA.

---

## 📋 Fonctionnalités Implémentées

### 1. **Onboarding Flow (5 Étapes)**

✅ **Step 1: Bienvenue Premium**
- Message de bienvenue personnalisé
- Présentation des bénéfices Premium
- Estimation du temps (3-5 min)

✅ **Step 2: Régime d'Impôt sur le Revenu**
- Choix entre Versement Libératoire et Barème Progressif
- Explications contextuelles avec tooltips
- Calcul automatique du taux VL selon l'activité

✅ **Step 3: ACRE (Exonération)**
- Question simple Oui/Non
- Si oui : sélection de l'année ACRE (1, 2 ou 3)
- Input date de création d'entreprise
- Explication détaillée de l'ACRE

✅ **Step 4: Intégrations**
- Bouton connexion Shopify (OAuth)
- Bouton connexion Stripe (Connect)
- Status temps réel (connecté/non connecté)
- Explications sécurité

✅ **Step 5: Récapitulatif**
- Affichage de toutes les données saisies
- Bouton "Terminer la configuration"
- Sauvegarde dans Supabase
- Redirection vers dashboard

### 2. **Base de Données (Supabase)**

✅ **Tables créées**:

```sql
user_onboarding_data
├── user_id (UUID, PRIMARY KEY)
├── ir_mode (TEXT: 'versement_liberatoire' | 'bareme')
├── ir_rate (NUMERIC)
├── has_acre (BOOLEAN)
├── acre_year (INTEGER: 1, 2, 3)
├── company_creation_date (DATE)
├── onboarding_completed (BOOLEAN)
├── completed_at (TIMESTAMPTZ)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

integration_tokens
├── id (UUID, PRIMARY KEY)
├── user_id (UUID, FOREIGN KEY)
├── provider (TEXT: 'shopify' | 'stripe')
├── access_token (TEXT, ENCRYPTED)
├── refresh_token (TEXT, ENCRYPTED)
├── shop_domain (TEXT)
├── stripe_account_id (TEXT)
├── is_active (BOOLEAN)
├── last_sync_at (TIMESTAMPTZ)
├── connected_at (TIMESTAMPTZ)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

sync_logs
├── id (UUID, PRIMARY KEY)
├── user_id (UUID, FOREIGN KEY)
├── provider (TEXT)
├── sync_type (TEXT: 'manual' | 'webhook' | 'cron')
├── status (TEXT: 'success' | 'error' | 'partial')
├── records_synced (INTEGER)
├── error_message (TEXT)
├── metadata (JSONB)
└── synced_at (TIMESTAMPTZ)
```

✅ **Row Level Security (RLS)** activé sur toutes les tables
✅ **Indexes** créés pour optimiser les performances

### 3. **Intégrations OAuth**

✅ **Shopify OAuth**:
- `/api/integrations/shopify/connect` - Initiation OAuth
- `/api/integrations/shopify/callback` - Récupération token
- Page intermédiaire `/dashboard/integrations/shopify-auth` pour input shop domain
- Tokens chiffrés (AES-256) avant stockage

✅ **Stripe Connect**:
- `/api/integrations/stripe/connect` - Initiation OAuth
- `/api/integrations/stripe/callback` - Récupération token
- Support refresh tokens
- Tokens chiffrés (AES-256)

### 4. **Synchronisation Automatique**

✅ **Cron Job Quotidien**:
- Route: `/api/cron/sync-integrations`
- Fréquence: Tous les jours à 2h du matin (configuré dans `vercel.json`)
- Authentification par Bearer token (`CRON_SECRET`)

✅ **Logique de Sync**:
```typescript
// Shopify : récupère les commandes des 30 derniers jours
// Stripe : récupère les payments des 30 derniers jours
// Insère dans ca_records avec external_id pour éviter doublons
// Log dans sync_logs pour traçabilité
```

### 5. **Sécurité**

✅ **Chiffrement des Tokens**:
```typescript
// lib/encryption.ts
- AES-256-CBC
- Clé de 32 caractères (ENCRYPTION_KEY)
- IV aléatoire de 16 bytes par token
```

✅ **Variables d'Environnement Requises**:
```bash
# Shopify
SHOPIFY_CLIENT_ID=your-client-id
NEXT_PUBLIC_SHOPIFY_CLIENT_ID=your-client-id
SHOPIFY_CLIENT_SECRET=your-client-secret
SHOPIFY_REDIRECT_URI=https://your-domain.com/api/integrations/shopify/callback

# Stripe Connect
STRIPE_CONNECT_CLIENT_ID=ca_xxx
STRIPE_REDIRECT_URI=https://your-domain.com/api/integrations/stripe/callback

# Encryption
ENCRYPTION_KEY=your-32-character-key-here

# Cron
CRON_SECRET=your-random-secret-for-cron-auth
```

### 6. **Calculs URSSAF Personnalisés**

✅ **Intégration ACRE**:
- Les calculs dans `UrssafCalculator.tsx` utilisent déjà l'ACRE
- Réduction automatique des cotisations selon l'année :
  - Année 1 : -50%
  - Année 2 : -25%
  - Année 3 : -12.5%

✅ **Intégration IR**:
- Support Versement Libératoire (taux fixe sur CA)
- Support Barème Progressif (avec abattement forfaitaire)
- Calculs via `lib/calculs.ts` → fonction `computeMonth()`

### 7. **ComptaBot Contextualisé**

✅ **Données Enrichies**:
```typescript
// app/api/chatbot/route.ts
const userData = {
  enregistrements: [...], // 3 derniers mois
  stats: { caTotal, caMoyen, cotisationsTotal, tauxMoyen },
  contexteFiscal: {
    regimeIR: "Versement Libératoire (2.2%)",
    acre: "Oui - Année 2 (création: 2023-01-15)"
  },
  integrations: "Connecté à: shopify, stripe"
}
```

✅ **Réponses Personnalisées**:
- ComptaBot adapte ses conseils selon le régime IR
- Prend en compte l'ACRE dans les estimations
- Suggère des optimisations basées sur les données réelles

### 8. **Pricing & Marketing**

✅ **Landing Page** (`app/page.tsx`):
- Ajout de "**Intégrations Shopify/Stripe** + Sync auto CA" dans les features Premium

✅ **Page Pricing** (`app/pricing/page.tsx`):
- Ajout dans la section "Automatisations" du plan Premium

### 9. **Mobile Optimization**

✅ **Responsive Design**:
- Stepper horizontal → stack vertical sur mobile
- Boutons CTA full-width sur mobile
- Touch targets minimum 44px
- Input `font-size: 16px` pour éviter zoom iOS
- `WebkitAppearance: 'none'` sur inputs
- Textes tronqués avec ellipsis
- Grilles adaptatives (1 col mobile, 2 cols tablet, 3 cols desktop)

✅ **Optimisations Spécifiques**:
- `OnboardingFlow.tsx` : Stepper progress responsive
- Tous les Steps : padding, font-sizes, et spacings adaptés
- Modals et popups : plein écran sur mobile
- Animations fluides avec Framer Motion

---

## 🚀 Guide de Déploiement

### 1. **Migration Supabase**

```bash
# Exécuter le script SQL
psql -U your_user -d your_database -f supabase_migration_onboarding_premium.sql
```

Ou via Supabase Dashboard :
1. Aller dans SQL Editor
2. Copier/coller le contenu de `supabase_migration_onboarding_premium.sql`
3. Exécuter

### 2. **Configuration Variables d'Environnement**

Ajouter dans votre `.env.local` (et Vercel Dashboard) :

```bash
# Shopify App
SHOPIFY_CLIENT_ID=xxxxx
NEXT_PUBLIC_SHOPIFY_CLIENT_ID=xxxxx
SHOPIFY_CLIENT_SECRET=xxxxx
SHOPIFY_REDIRECT_URI=https://your-domain.com/api/integrations/shopify/callback

# Stripe Connect
STRIPE_CONNECT_CLIENT_ID=ca_xxxxx
STRIPE_REDIRECT_URI=https://your-domain.com/api/integrations/stripe/callback

# Encryption (générer une clé aléatoire de 32 caractères)
ENCRYPTION_KEY=$(openssl rand -base64 24)

# Cron Secret
CRON_SECRET=$(openssl rand -hex 32)
```

### 3. **Créer les Apps Shopify/Stripe**

**Shopify**:
1. Aller sur https://partners.shopify.com
2. Créer une App
3. Configurer OAuth :
   - Redirect URL : `https://your-domain.com/api/integrations/shopify/callback`
   - Scopes : `read_orders, read_products`
4. Récupérer Client ID et Client Secret

**Stripe**:
1. Aller sur https://dashboard.stripe.com/settings/connect
2. Activer Stripe Connect
3. Configurer :
   - Redirect URI : `https://your-domain.com/api/integrations/stripe/callback`
   - Type : Standard
4. Récupérer Client ID

### 4. **Configurer Vercel Cron**

Le fichier `vercel.json` est déjà créé avec :
```json
{
  "crons": [
    {
      "path": "/api/cron/sync-integrations",
      "schedule": "0 2 * * *"
    }
  ]
}
```

Vercel détectera automatiquement ce fichier au déploiement.

**Important** : Ajouter `CRON_SECRET` dans Vercel Environment Variables.

### 5. **Tester le Flow**

1. Se connecter en tant qu'utilisateur Premium
2. Visiter `/dashboard/onboarding-premium`
3. Compléter les 5 étapes
4. Vérifier dans Supabase que les données sont bien enregistrées
5. Tester les intégrations Shopify/Stripe
6. Déclencher manuellement un sync : `POST /api/cron/sync-integrations` avec `Authorization: Bearer {CRON_SECRET}`

---

## 📊 Architecture Technique

```
app/
├── dashboard/
│   ├── onboarding-premium/
│   │   ├── page.tsx (Container principal)
│   │   └── components/
│   │       ├── OnboardingFlow.tsx (Stepper)
│   │       ├── Step1Welcome.tsx
│   │       ├── Step2IRRegime.tsx
│   │       ├── Step3ACRE.tsx
│   │       ├── Step4Integrations.tsx
│   │       └── Step5Recap.tsx
│   └── integrations/
│       └── shopify-auth/
│           └── page.tsx (Input shop domain)
│
├── api/
│   ├── onboarding/
│   │   └── save-preferences/
│   │       └── route.ts (POST/GET preferences)
│   ├── integrations/
│   │   ├── shopify/
│   │   │   ├── connect/route.ts (OAuth initiation)
│   │   │   └── callback/route.ts (OAuth callback)
│   │   └── stripe/
│   │       ├── connect/route.ts (Connect initiation)
│   │       └── callback/route.ts (Connect callback)
│   ├── cron/
│   │   └── sync-integrations/
│   │       └── route.ts (Sync quotidien)
│   └── chatbot/
│       └── route.ts (+ contexte onboarding)
│
└── lib/
    └── encryption.ts (Chiffrement AES-256)

supabase/
└── migrations/
    └── supabase_migration_onboarding_premium.sql
```

---

## 🎨 Design System

**Couleurs**:
- Gradient principal : `#00D084` → `#2E6CF6`
- Background : `#0e0f12`, `#14161b`, `#1a1d24`
- Texte : `#ffffff`, `#e5e7eb`, `#9ca3af`
- Success : `#00D084`
- Info : `#2E6CF6`
- Warning : `#FFA500`
- Error : `#EF4444`

**Composants**:
- Border radius : `rounded-xl` (12px) ou `rounded-2xl` (16px)
- Shadow : `shadow-lg`, `shadow-2xl`
- Transitions : `transition-all duration-300`
- Hover scale : `hover:scale-105`

---

## ✅ Checklist Post-Déploiement

- [ ] Migration Supabase exécutée
- [ ] Variables d'env configurées (Vercel + local)
- [ ] Apps Shopify/Stripe créées et configurées
- [ ] Vercel Cron activé
- [ ] Test flow onboarding complet
- [ ] Test connexion Shopify
- [ ] Test connexion Stripe
- [ ] Test sync automatique (via Postman)
- [ ] Vérifier logs Supabase (`sync_logs`)
- [ ] Tester ComptaBot avec contexte enrichi
- [ ] Vérifier pricing landing page
- [ ] Vérifier page /pricing
- [ ] Test mobile (iOS + Android)

---

## 📈 Métriques à Suivre

1. **Taux de complétion onboarding** :
   ```sql
   SELECT 
     COUNT(*) FILTER (WHERE onboarding_completed = true) * 100.0 / COUNT(*) as completion_rate
   FROM user_onboarding_data;
   ```

2. **Intégrations actives** :
   ```sql
   SELECT provider, COUNT(*) as total
   FROM integration_tokens
   WHERE is_active = true
   GROUP BY provider;
   ```

3. **Syncs quotidiens** :
   ```sql
   SELECT 
     provider,
     AVG(records_synced) as avg_records,
     COUNT(*) FILTER (WHERE status = 'success') * 100.0 / COUNT(*) as success_rate
   FROM sync_logs
   WHERE synced_at > NOW() - INTERVAL '30 days'
   GROUP BY provider;
   ```

---

## 🐛 Troubleshooting

### Erreur : "Shopify OAuth failed"
- Vérifier que `SHOPIFY_REDIRECT_URI` correspond exactement à l'URL configurée dans l'app Shopify
- Vérifier que les scopes demandés sont autorisés

### Erreur : "Encryption failed"
- Vérifier que `ENCRYPTION_KEY` fait exactement 32 caractères
- Vérifier qu'elle est définie dans l'environnement de déploiement

### Cron ne se déclenche pas
- Vérifier que `vercel.json` est bien à la racine
- Vérifier les logs Vercel (Deployments → Functions → Cron)
- Tester manuellement avec `curl -X POST https://your-domain.com/api/cron/sync-integrations -H "Authorization: Bearer {CRON_SECRET}"`

---

## 🎉 Résultat Final

**Gain de temps pour l'utilisateur** : ~25-30 heures de dev ✅
**Configuration initiale** : 3-5 minutes
**Synchronisation CA** : Automatique, quotidienne
**Calculs personnalisés** : ACRE + IR pris en compte
**ComptaBot intelligent** : Contexte fiscal complet

**Avant** :
- Saisie manuelle du CA chaque mois
- Calculs URSSAF génériques
- Pas d'optimisation fiscale personnalisée

**Après** :
- CA importé automatiquement (Shopify/Stripe)
- Calculs ultra-précis (ACRE année 2, VL 2.2%)
- ComptaBot qui connaît votre situation
- Gain de 10 min par mois sur déclarations

---

## 📞 Support

En cas de problème :
1. Vérifier les logs Supabase
2. Vérifier les logs Vercel
3. Consulter `sync_logs` pour les erreurs de sync
4. Contacter le support technique

---

**Développé avec ❤️ pour Comptalyze**

