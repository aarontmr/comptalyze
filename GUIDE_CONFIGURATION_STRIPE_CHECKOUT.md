# Guide de configuration - Stripe Checkout

## 🚨 Problème : "Rien ne s'affiche dans Informations de paiement"

Si le formulaire de paiement ne s'affiche pas sur la page `/checkout/[plan]`, suivez ce guide étape par étape.

## 🔍 Diagnostic

Ouvrez la console du navigateur (F12) et regardez les messages :

### Messages possibles :

1. **`❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY n'est pas définie`**
   → La clé publique Stripe n'est pas configurée

2. **`❌ Price ID non défini pour le plan xxx`**
   → Les Price IDs Stripe ne sont pas configurés

3. **`❌ STRIPE_SECRET_KEY n'est pas défini`**
   → La clé secrète Stripe n'est pas configurée

## ✅ Solution : Configuration complète

### Étape 1 : Obtenir vos clés Stripe

1. Connectez-vous à [Stripe Dashboard](https://dashboard.stripe.com)
2. Allez dans **Developers** > **API keys**
3. Copiez :
   - **Publishable key** (commence par `pk_test_...` ou `pk_live_...`)
   - **Secret key** (commence par `sk_test_...` ou `sk_live_...`)

### Étape 2 : Créer les produits dans Stripe

1. Allez dans **Products** > **Add product**
2. Créez **4 produits** :

#### Produit 1 : Comptalyze Pro (Mensuel)
- Nom : `Comptalyze Pro (Mensuel)`
- Prix : `5,90 €`
- Facturation : **Récurrent**
- Période : **Tous les mois**
- Copiez le Price ID (commence par `price_...`)

#### Produit 2 : Comptalyze Pro (Annuel)
- Nom : `Comptalyze Pro (Annuel)`
- Prix : `56,90 €`
- Facturation : **Récurrent**
- Période : **Tous les 12 mois**
- Copiez le Price ID

#### Produit 3 : Comptalyze Premium (Mensuel)
- Nom : `Comptalyze Premium (Mensuel)`
- Prix : `9,90 €`
- Facturation : **Récurrent**
- Période : **Tous les mois**
- Copiez le Price ID

#### Produit 4 : Comptalyze Premium (Annuel)
- Nom : `Comptalyze Premium (Annuel)`
- Prix : `94,90 €`
- Facturation : **Récurrent**
- Période : **Tous les 12 mois**
- Copiez le Price ID

### Étape 3 : Configurer les variables d'environnement

#### Pour le développement local

Créez ou modifiez le fichier `.env.local` à la racine du projet :

```env
# Stripe - Clés API
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Stripe - Price IDs Mensuels
STRIPE_PRICE_PRO=price_xxxxxxxxxxxxx
STRIPE_PRICE_PREMIUM=price_xxxxxxxxxxxxx

# Stripe - Price IDs Annuels
STRIPE_PRICE_PRO_YEARLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_PREMIUM_YEARLY=price_xxxxxxxxxxxxx

# Stripe - Webhook Secret (à configurer après)
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# URLs de base
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Pour la production (Vercel)

1. Allez dans votre projet Vercel
2. Settings > Environment Variables
3. Ajoutez les mêmes variables (utilisez les clés `pk_live_...` et `sk_live_...` pour la production)

### Étape 4 : Redémarrer le serveur de développement

**Important** : Après avoir modifié `.env.local`, vous DEVEZ redémarrer Next.js :

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez-le
npm run dev
```

### Étape 5 : Vérifier la configuration

1. Ouvrez votre navigateur à `http://localhost:3000/pricing`
2. Cliquez sur "Passer à Pro" ou "Passer à Premium"
3. Ouvrez la console du navigateur (F12)
4. Vous devriez voir :
   ```
   ✅ Utilisateur connecté: votre-email@example.com
   🔑 Clé publique Stripe: ✅ Définie
   🔄 Création de la session Stripe pour: { plan: 'pro', userId: '...', autoRenew: true }
   ```

## 🐛 Dépannage

### Le formulaire ne s'affiche toujours pas

1. **Vérifiez la console** :
   ```javascript
   // Ouvrez la console et tapez :
   console.log(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
   ```
   Si c'est `undefined`, le fichier .env.local n'est pas chargé

2. **Vérifiez le fichier .env.local** :
   - Est-il à la racine du projet ?
   - Les variables commencent-elles par `NEXT_PUBLIC_` pour le frontend ?
   - Avez-vous redémarré le serveur ?

3. **Vérifiez les Price IDs** :
   - Commencent-ils tous par `price_` ?
   - Sont-ils bien copiés depuis Stripe Dashboard ?

### Erreur "Configuration Stripe manquante"

```
❌ STRIPE_SECRET_KEY n'est pas défini
```

→ La clé secrète n'est pas dans `.env.local`. Ajoutez-la et redémarrez.

### Erreur "Price ID non défini"

```
❌ STRIPE_PRICE_PRO n'est pas défini dans votre fichier .env.local
```

→ Ajoutez le Price ID manquant dans `.env.local` et redémarrez.

### Le spinner de chargement tourne indéfiniment

Ouvrez la console et regardez les erreurs. Probablement :
- Un Price ID est invalide (ne commence pas par `price_`)
- La clé secrète est incorrecte
- L'API Stripe renvoie une erreur

### Erreur "Invalid API Key"

```
Error: Invalid API Key provided
```

→ Votre `STRIPE_SECRET_KEY` est incorrecte. Copiez-la à nouveau depuis Stripe Dashboard.

## 📝 Checklist complète

- [ ] Compte Stripe créé
- [ ] Mode Test activé (pour le développement)
- [ ] Clés API copiées (Publishable + Secret)
- [ ] 4 produits créés dans Stripe
- [ ] 4 Price IDs copiés
- [ ] Fichier `.env.local` créé à la racine
- [ ] Toutes les variables ajoutées
- [ ] Serveur de développement redémarré
- [ ] Page /pricing testée
- [ ] Console du navigateur vérifiée
- [ ] Formulaire de paiement s'affiche ✅

## 🔄 Exemple de fichier .env.local complet

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe - Clés API (Mode Test)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxxxxxx

# Stripe - Price IDs Mensuels
STRIPE_PRICE_PRO=price_1xxxxxxxxxxxxx
STRIPE_PRICE_PREMIUM=price_1xxxxxxxxxxxxx

# Stripe - Price IDs Annuels
STRIPE_PRICE_PRO_YEARLY=price_1xxxxxxxxxxxxx
STRIPE_PRICE_PREMIUM_YEARLY=price_1xxxxxxxxxxxxx

# Stripe - Webhook
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OpenAI (pour l'assistant IA)
OPENAI_API_KEY=sk-...

# Resend (pour les emails)
RESEND_API_KEY=re_...
```

## 🎯 Résultat attendu

Une fois tout configuré correctement, vous devriez voir :

1. La page de checkout se charge
2. Un spinner de chargement apparaît brièvement
3. Le formulaire Stripe s'affiche avec :
   - Champs pour la carte bancaire
   - Bouton "Payer maintenant"
   - Badge "Paiement sécurisé par Stripe"

## 📞 Besoin d'aide ?

Si le problème persiste :
1. Partagez les messages de la console (F12)
2. Vérifiez que toutes les étapes ont été suivies
3. Assurez-vous d'avoir redémarré le serveur après chaque modification de .env.local

