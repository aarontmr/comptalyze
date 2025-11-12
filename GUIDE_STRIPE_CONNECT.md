# 🚀 Guide Stripe Connect - Configuration Rapide (5 minutes)

## ✅ Pourquoi Stripe Connect ?

- ✅ **Gratuit** (0€)
- ✅ **Immédiat** (pas de validation)
- ✅ **Simple** (1 formulaire)
- ✅ **Fonctionne tout de suite** pour vos clients
- ✅ Beaucoup plus simple que Shopify !

---

## 📋 Configuration complète

### Étape 1 : Activer Stripe Connect

1. Allez sur **https://dashboard.stripe.com/**
2. Connectez-vous avec votre compte Stripe
3. **Settings** (icône ⚙️ en haut à droite) → **Connect**
4. Si pas encore activé : **"Get started"** ou **"Activate Connect"**

---

### Étape 2 : Configurer votre intégration

Dans **Settings → Connect → Settings** :

#### 2.1 Informations de l'intégration

```
Integration name: Comptalyze
Description (optionnel): Synchronisation automatique de vos paiements Stripe
```

#### 2.2 Branding (optionnel mais recommandé)

```
Brand icon: [Uploadez votre logo]
Brand color: #2E6CF6 (ou votre couleur principale)
```

**Cliquez sur "Save"**

---

### Étape 3 : Configurer OAuth

Dans **Settings → Connect → Integration** :

#### 3.1 OAuth settings

**Redirect URIs** - Ajoutez les deux URLs suivantes :

**Développement :**
```
http://localhost:3000/api/integrations/stripe/callback
```

**Production :**
```
https://comptalyze.com/api/integrations/stripe/callback
```

Pour ajouter :
1. Cliquez sur **"+ Add URI"**
2. Collez l'URL
3. Cliquez sur **"Add"**
4. Répétez pour la deuxième URL

#### 3.2 Sauvegardez

**Cliquez sur "Save changes"**

✅ **Activation immédiate ! Pas de validation !**

---

### Étape 4 : Récupérer le Client ID

Dans **Settings → Connect → Integration** :

Vous verrez :
```
Client ID: ca_ABC123XYZ789def456ghi...
```

**Copiez cette valeur !**

---

## 🔧 Configuration dans Comptalyze

### Étape 1 : Ouvrir `.env.local`

À la racine de votre projet, ouvrez `.env.local`

### Étape 2 : Ajouter les variables Stripe Connect

Ajoutez ces lignes (à la fin du fichier ou dans la section Stripe existante) :

```env
# ==============================================================================
# STRIPE CONNECT (OAuth - Intégration)
# ==============================================================================
# Client ID pour Stripe Connect (différent de STRIPE_SECRET_KEY)
STRIPE_CONNECT_CLIENT_ID=ca_votre_client_id_ici

# URL de redirection pour OAuth
STRIPE_REDIRECT_URI=http://localhost:3000/api/integrations/stripe/callback
```

**IMPORTANT** : 
- `STRIPE_CONNECT_CLIENT_ID` est pour l'intégration OAuth
- `STRIPE_SECRET_KEY` (que vous avez déjà) est pour les paiements
- Ce sont deux choses différentes !

### Étape 3 : Sauvegarder

**Ctrl+S** pour sauvegarder `.env.local`

---

## 🚀 Redémarrer le serveur

### Windows PowerShell :

```powershell
# 1. Arrêter le serveur (Ctrl+C)

# 2. Redémarrer
.\start-dev.ps1
```

### Terminal standard :

```bash
# 1. Arrêter (Ctrl+C)

# 2. Redémarrer
npm run dev
```

---

## ✅ Tester la connexion

### 1. Ouvrir Comptalyze

```
http://localhost:3000/dashboard/compte/integrations
```

### 2. Cliquer sur "Connecter Stripe"

### 3. Résultat attendu

**Vous serez redirigé vers Stripe** avec une page ressemblant à :

```
Authorize Comptalyze to access your Stripe account

Comptalyze will be able to:
- View your balance and transactions
- Read payment information

[Skip this account setup] [Authorize access]
```

### 4. Autoriser l'accès

**Cliquez sur "Authorize access"**

### 5. Retour sur Comptalyze

✅ Vous êtes redirigé vers Comptalyze  
✅ L'intégration Stripe est active !  
✅ Le statut affiche "✓ Connecté"

---

## 🎯 Comment ça fonctionne pour vos clients

### Flux utilisateur :

```
Client sur Comptalyze
       ↓
Clique "Connecter Stripe"
       ↓
Redirection vers Stripe OAuth
       ↓
Client se connecte à son compte Stripe
       ↓
Client autorise Comptalyze
       ↓
Retour sur Comptalyze
       ↓
✅ Intégration active !
```

**C'est comme "Se connecter avec Google" - simple et rapide !**

---

## 🔍 Vérification

### Dans le Dashboard Stripe

1. Allez dans **Connect → Accounts**
2. Vous verrez les comptes qui ont autorisé Comptalyze
3. Pour chaque compte connecté, vous verrez :
   - Account ID
   - Date de connexion
   - Permissions accordées

### Dans Comptalyze

1. Page **Intégrations** → Stripe doit afficher "✓ Connecté"
2. Vous verrez :
   - Account ID du compte Stripe connecté
   - Date de connexion
   - Bouton "Sync manuel" pour forcer une synchronisation

---

## 📊 Ce que Stripe Connect permet

### Données accessibles (lecture seule) :

- ✅ **Transactions** : Liste des paiements reçus
- ✅ **Balance** : Solde du compte
- ✅ **Customers** : Liste des clients (si nécessaire)
- ✅ **Invoices** : Factures créées
- ✅ **Charges** : Détails des paiements

### Ce que Comptalyze NE PEUT PAS faire :

- ❌ **Créer des paiements** (read-only par défaut)
- ❌ **Modifier le compte**
- ❌ **Accéder aux informations bancaires**
- ❌ **Faire des virements**

**Comptalyze peut uniquement LIRE pour synchroniser le CA !**

---

## 🔐 Scopes (Permissions)

Par défaut, Stripe Connect donne accès à :

```
read_write
```

Mais dans votre code (`app/api/integrations/stripe/connect/route.ts`), vous pouvez spécifier :

```typescript
authUrl.searchParams.set('scope', 'read_only');
```

✅ **Recommandé** : Utilisez `read_only` pour que vos clients soient rassurés.

---

## 🆚 Comparaison : Stripe Connect vs Shopify

| Critère | Stripe Connect | Shopify OAuth |
|---------|---------------|---------------|
| **Configuration** | ✅ 5 minutes | ⏳ 30-60 minutes |
| **Validation** | ✅ Immédiate | ⏳ 48h-3 semaines |
| **Frais** | ✅ Gratuit | 💰 0-19$ |
| **Complexité** | ✅ Simple | ⚠️ Moyenne |
| **Pour les clients** | ✅ OAuth direct | ⚠️ Lien d'installation |
| **Activation** | ✅ **Maintenant** | ⏳ Après validation |

**Stripe Connect est BEAUCOUP plus simple !** 🎉

---

## 🐛 Dépannage

### "Variables Stripe Connect non configurées"

**Vérifiez :**
```powershell
# Voir les variables dans .env.local
Get-Content .env.local | Select-String -Pattern "STRIPE"
```

Vous devriez voir :
- `STRIPE_SECRET_KEY` (paiements)
- `STRIPE_CONNECT_CLIENT_ID` (OAuth)

**Si manquant :**
1. Ajoutez `STRIPE_CONNECT_CLIENT_ID=ca_...` dans `.env.local`
2. Redémarrez le serveur : `.\start-dev.ps1`

### Redirection échoue

**Vérifiez :**
1. ✅ L'URL de callback est bien dans Stripe : `http://localhost:3000/api/integrations/stripe/callback`
2. ✅ Le serveur tourne sur le port 3000 (pas 3001)
3. ✅ Les variables sont dans `.env.local` (pas `env.example`)

### "Invalid client_id"

**Cause :** Le Client ID dans `.env.local` n'est pas correct

**Solution :**
1. Retournez dans **Stripe Dashboard → Settings → Connect → Integration**
2. Copiez à nouveau le **Client ID** (commence par `ca_`)
3. Remplacez dans `.env.local`
4. Redémarrez le serveur

---

## ✅ Checklist complète

- [ ] Stripe Connect activé dans le Dashboard
- [ ] Integration name configuré ("Comptalyze")
- [ ] Redirect URIs ajoutées (localhost + production)
- [ ] Client ID récupéré (commence par `ca_`)
- [ ] `STRIPE_CONNECT_CLIENT_ID` ajouté à `.env.local`
- [ ] `STRIPE_REDIRECT_URI` ajouté à `.env.local`
- [ ] Serveur redémarré
- [ ] Test de connexion effectué
- [ ] Autorisation accordée sur Stripe
- [ ] Intégration active dans Comptalyze

---

## 🎉 Résumé

**Stripe Connect en 3 étapes :**

1. **Dashboard Stripe** → Settings → Connect → Configurer (5 min)
2. **`.env.local`** → Ajouter `STRIPE_CONNECT_CLIENT_ID` (1 min)
3. **Tester** → Cliquer "Connecter Stripe" → Autoriser → ✅ Fait !

**Total : ~10 minutes** (vs plusieurs jours pour Shopify)

---

## 📞 Support

**Documentation Stripe Connect :**
https://stripe.com/docs/connect/oauth-reference

**Dashboard Stripe :**
https://dashboard.stripe.com/settings/connect

---

**Dernière mise à jour : Novembre 2025**







