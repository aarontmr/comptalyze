# 🔌 Configuration des Intégrations Shopify et Stripe

## 🎯 Problème résolu

Si vous voyez l'erreur "Les intégrations ne sont pas configurées" ou que rien ne se passe quand vous cliquez sur "Connecter Shopify" ou "Connecter Stripe", c'est que les variables d'environnement OAuth ne sont pas configurées.

## ✅ Solution : Configuration des variables d'environnement

### 1. Configuration Shopify OAuth

Pour activer l'intégration Shopify, vous devez créer une application Shopify :

#### Étapes :

1. **Créer une app Shopify** sur [Shopify Partners](https://partners.shopify.com/)
   - Allez dans "Apps" > "Create app" > "Create app manually"
   - Donnez un nom à votre app (ex: "Comptalyze Integration")

2. **Configurer l'OAuth** dans votre app :
   - Dans "Configuration" > "App setup"
   - **App URL** : `https://votre-domaine.com` (ou `http://localhost:3000` en dev)
   - **Allowed redirection URL(s)** : 
     - `https://votre-domaine.com/api/integrations/shopify/callback`
     - `http://localhost:3000/api/integrations/shopify/callback` (en dev)

3. **Configurer les scopes** (permissions) :
   - Dans "Configuration" > "API access"
   - Cochez les permissions nécessaires :
     - ✅ `read_orders` (lire les commandes)
     - ✅ `read_products` (lire les produits)
     - ✅ `read_customers` (lire les clients)

4. **Récupérer les credentials** :
   - Dans "Overview" ou "API credentials"
   - Notez le **Client ID** et le **Client secret**

5. **Ajouter à `.env.local`** :
```env
# Shopify OAuth
SHOPIFY_CLIENT_ID=votre_client_id_shopify
SHOPIFY_CLIENT_SECRET=votre_client_secret_shopify
SHOPIFY_REDIRECT_URI=http://localhost:3000/api/integrations/shopify/callback

# En production, utilisez votre domaine :
# SHOPIFY_REDIRECT_URI=https://comptalyze.com/api/integrations/shopify/callback
```

---

### 2. Configuration Stripe Connect OAuth

Pour activer l'intégration Stripe Connect :

#### Étapes :

1. **Activer Stripe Connect** sur votre [Dashboard Stripe](https://dashboard.stripe.com/settings/connect)
   - Allez dans "Settings" > "Connect" > "Get started"

2. **Configurer les paramètres Connect** :
   - **Integration name** : "Comptalyze"
   - **Brand icon** : (optionnel, uploadez votre logo)
   - **Brand color** : `#2E6CF6` (ou votre couleur de marque)

3. **Configurer l'OAuth redirect** :
   - Dans "Settings" > "Connect" > "Integration"
   - **OAuth redirect URIs** :
     - `http://localhost:3000/api/integrations/stripe/callback` (développement)
     - `https://votre-domaine.com/api/integrations/stripe/callback` (production)

4. **Récupérer le Client ID** :
   - Dans "Settings" > "Connect" > "Integration"
   - Notez le **Client ID** (commence par `ca_...`)

5. **Ajouter à `.env.local`** :
```env
# Stripe Connect OAuth
STRIPE_CONNECT_CLIENT_ID=ca_xxxxxxxxxxxxx
STRIPE_REDIRECT_URI=http://localhost:3000/api/integrations/stripe/callback

# En production :
# STRIPE_REDIRECT_URI=https://comptalyze.com/api/integrations/stripe/callback
```

**Note** : Vous utilisez déjà `STRIPE_SECRET_KEY` pour les paiements. Le `STRIPE_CONNECT_CLIENT_ID` est différent et sert uniquement pour l'OAuth Connect.

---

## 🔄 Après la configuration

### 1. Redémarrer le serveur

```bash
# Arrêter le serveur (Ctrl+C)
# Puis relancer :
npm run dev
```

**Important** : Les variables d'environnement ne sont chargées qu'au démarrage du serveur. Vous DEVEZ redémarrer après avoir modifié `.env.local`.

### 2. Tester les intégrations

1. Allez sur `/dashboard/compte/integrations`
2. Cliquez sur "Connecter Shopify" ou "Connecter Stripe"
3. Vous devriez être redirigé vers la page d'autorisation OAuth
4. Autorisez l'accès
5. Vous serez redirigé vers Comptalyze avec l'intégration active

---

## 🐛 Dépannage

### Erreur "Les intégrations ne sont pas configurées"

**Cause** : Les variables d'environnement ne sont pas définies ou le serveur n'a pas été redémarré.

**Solution** :
1. Vérifiez que `.env.local` contient bien toutes les variables listées ci-dessus
2. Redémarrez le serveur avec `Ctrl+C` puis `npm run dev`
3. Videz le cache du navigateur (`Ctrl+Shift+R`)

### Erreur "Invalid redirect_uri"

**Cause** : L'URL de callback dans `.env.local` ne correspond pas à celle configurée dans Shopify/Stripe.

**Solution** :
1. Vérifiez que `SHOPIFY_REDIRECT_URI` / `STRIPE_REDIRECT_URI` correspondent EXACTEMENT aux URLs configurées dans les dashboards Shopify/Stripe
2. En développement : `http://localhost:3000/api/integrations/[provider]/callback`
3. En production : `https://votre-domaine.com/api/integrations/[provider]/callback`

### Erreur CSP dans la console

**Cause** : La Content Security Policy bloquait les domaines OAuth (maintenant corrigé).

**Solution** :
- Le fichier `middleware.ts` a été mis à jour pour autoriser :
  - `connect.stripe.com` (Stripe Connect)
  - `*.myshopify.com` (Shopify OAuth)
  - `connect.facebook.net` (Facebook Pixel)
  - `www.google.com` (Google Ads tracking)

Si vous voyez encore des erreurs CSP, redémarrez le serveur.

### Rien ne se passe quand je clique

**Cause** : Le JavaScript est peut-être bloqué ou il y a une erreur silencieuse.

**Solution** :
1. Ouvrez la console du navigateur (`F12`)
2. Cherchez des erreurs en rouge
3. Vérifiez que `userId` est bien défini dans la console :
   ```javascript
   // Dans la console DevTools :
   console.log(window.location.href);
   // Devrait être : /api/integrations/shopify/connect?userId=...
   ```

---

## 📝 Variables d'environnement complètes

Voici toutes les variables nécessaires pour un fichier `.env.local` complet :

```env
# ==============================================================================
# SUPABASE
# ==============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ==============================================================================
# STRIPE (Paiements)
# ==============================================================================
STRIPE_SECRET_KEY=sk_test_51xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# ==============================================================================
# STRIPE CONNECT (Intégration OAuth)
# ==============================================================================
STRIPE_CONNECT_CLIENT_ID=ca_xxxxxxxxxxxxx
STRIPE_REDIRECT_URI=http://localhost:3000/api/integrations/stripe/callback

# ==============================================================================
# SHOPIFY (Intégration OAuth)
# ==============================================================================
SHOPIFY_CLIENT_ID=votre_client_id_shopify
SHOPIFY_CLIENT_SECRET=votre_client_secret_shopify
SHOPIFY_REDIRECT_URI=http://localhost:3000/api/integrations/shopify/callback
NEXT_PUBLIC_SHOPIFY_CLIENT_ID=votre_client_id_shopify

# ==============================================================================
# APP URL
# ==============================================================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🎓 Comprendre OAuth

### Qu'est-ce qu'OAuth ?

OAuth est un protocole standard qui permet à une application (Comptalyze) de se connecter à une autre application (Shopify/Stripe) **sans avoir besoin du mot de passe** de l'utilisateur.

### Pourquoi les intégrations ont besoin d'OAuth ?

- ✅ **Sécurité** : Comptalyze n'a jamais accès à vos mots de passe Shopify/Stripe
- ✅ **Permissions limitées** : Vous choisissez exactement ce que Comptalyze peut lire (lecture seule)
- ✅ **Révocation facile** : Vous pouvez déconnecter l'intégration à tout moment
- ✅ **Standard industriel** : Même principe que "Se connecter avec Google"

### Flux OAuth simplifié

1. **Vous** : Cliquez sur "Connecter Shopify"
2. **Comptalyze** : Vous redirige vers `shopify.com/oauth/authorize`
3. **Shopify** : Vous demande d'autoriser Comptalyze (lecture seule)
4. **Vous** : Cliquez sur "Autoriser"
5. **Shopify** : Vous redirige vers Comptalyze avec un code temporaire
6. **Comptalyze** : Échange le code contre un token d'accès
7. **Comptalyze** : Stocke le token chiffré (AES-256) dans Supabase
8. ✅ **Synchronisation automatique** activée !

---

## 🔒 Sécurité

### Comment les tokens sont-ils stockés ?

- **Chiffrement AES-256** dans la base de données Supabase
- **Permissions lecture seule** : Comptalyze ne peut que lire vos données, jamais les modifier
- **Déconnexion instantanée** : Supprime immédiatement le token de la base de données
- **HTTPS uniquement** en production

### Que voit Comptalyze ?

#### Shopify :
- ✅ Commandes et montants
- ✅ Produits vendus
- ❌ Aucune modification possible
- ❌ Pas d'accès aux paiements ou données bancaires

#### Stripe :
- ✅ Transactions et montants
- ✅ Statuts des paiements
- ❌ Aucune modification possible
- ❌ Pas d'accès aux coordonnées bancaires

---

## ✅ Checklist de configuration

- [ ] Variables Supabase configurées
- [ ] Variables Stripe (paiements) configurées
- [ ] App Shopify créée sur Shopify Partners
- [ ] OAuth Shopify configuré avec les bonnes URLs de callback
- [ ] `SHOPIFY_CLIENT_ID` et `SHOPIFY_CLIENT_SECRET` ajoutés à `.env.local`
- [ ] Stripe Connect activé sur le Dashboard Stripe
- [ ] OAuth redirect URI configuré dans Stripe Connect
- [ ] `STRIPE_CONNECT_CLIENT_ID` ajouté à `.env.local`
- [ ] Serveur redémarré (`Ctrl+C` puis `npm run dev`)
- [ ] Cache du navigateur vidé (`Ctrl+Shift+R`)
- [ ] Test de connexion Shopify réussi
- [ ] Test de connexion Stripe réussi

---

## 📞 Support

Si vous rencontrez des problèmes après avoir suivi ce guide :

1. Vérifiez les logs du serveur dans votre terminal
2. Vérifiez les erreurs dans la console du navigateur (`F12`)
3. Contactez le support : [support@comptalyze.fr](mailto:support@comptalyze.fr)

Incluez dans votre message :
- Les erreurs de la console du navigateur (capture d'écran)
- Les logs du terminal (copiez les lignes en rouge)
- L'URL exacte où vous êtes redirigé après avoir cliqué sur "Connecter"

---

**RÉSUMÉ** : Les intégrations OAuth nécessitent des applications tierces (Shopify App + Stripe Connect) et des variables d'environnement spécifiques. Une fois configurées et le serveur redémarré, les connexions fonctionneront parfaitement ! 🚀





