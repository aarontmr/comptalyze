# Configuration Comptalyze SaaS

## Étapes de configuration

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration Supabase

1. Créez un projet sur [Supabase](https://supabase.com)
2. Dans le SQL Editor, exécutez le script `supabase_setup.sql`
3. Récupérez vos clés dans Settings > API :
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY` (gardez-la secrète !)

### 3. Configuration Stripe

1. Créez un compte sur [Stripe](https://stripe.com)
2. Récupérez vos clés dans Developers > API keys :
   - Secret key → `STRIPE_SECRET_KEY`
3. Configurez un webhook :
   - URL : `https://votre-domaine.com/api/webhook`
   - Événements à écouter : `checkout.session.completed`, `customer.subscription.deleted`
   - Récupérez le secret du webhook → `STRIPE_WEBHOOK_SECRET`

### 4. Variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role

# Stripe
STRIPE_SECRET_KEY=votre_cle_secrete_stripe
STRIPE_WEBHOOK_SECRET=votre_webhook_secret_stripe

# App URL (pour les redirections)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important** : En production, remplacez `NEXT_PUBLIC_APP_URL` par votre URL de production.

### 5. Structure de la base de données

La table `history` est créée automatiquement avec le script SQL. Elle contient :
- `id` (UUID) - Identifiant unique
- `user_id` (UUID) - Référence à l'utilisateur
- `month` (TEXT) - Mois du calcul
- `activity` (TEXT) - Type d'activité
- `ca` (FLOAT) - Chiffre d'affaires
- `charges` (FLOAT) - Cotisations URSSAF
- `net` (FLOAT) - Revenu net
- `created_at` (TIMESTAMP) - Date de création

### 6. Gestion des utilisateurs Pro

Les utilisateurs Pro sont identifiés par le champ `is_pro: true` dans `user_metadata` de Supabase Auth. Ce champ est mis à jour automatiquement via le webhook Stripe après un paiement réussi.

### 7. Lancement de l'application

```bash
npm run dev
```

L'application sera accessible sur http://localhost:3000

## Routes disponibles

- `/` - Dashboard principal (nécessite une connexion)
- `/login` - Page de connexion
- `/signup` - Page d'inscription
- `/pricing` - Page de tarification

## API Routes

- `/api/checkout` - Crée une session Stripe Checkout
- `/api/webhook` - Webhook Stripe pour gérer les événements de paiement

## Notes importantes

- Les utilisateurs gratuits sont limités à 3 simulations par mois
- Les utilisateurs Pro ont un accès illimité
- Le webhook Stripe doit être configuré en production pour que les abonnements fonctionnent correctement








