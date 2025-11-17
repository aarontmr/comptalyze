# 🎯 Guide : Créer une app Shopify "Unlisted" (Gratuite)

## ✅ Pourquoi "Unlisted" ?

- ✅ **GRATUIT** (pas de frais de 19$)
- ✅ Vos clients **PEUVENT** l'installer (via un lien)
- ✅ Validation **rapide** (48-72h au lieu de 1-3 semaines)
- ✅ Pas visible dans l'App Store public
- ✅ **Parfait pour Comptalyze**

---

## 📋 Étapes complètes

### Étape 1 : Créer une nouvelle app

1. Allez sur **https://partners.shopify.com/**
2. Barre latérale → **"Apps"**
3. Bouton **"Create app"**
4. **"Create app manually"**

### Étape 2 : Informations de base

**Remplissez :**
- App name : `Comptalyze`
- App URL : `https://comptalyze.com` (ou `http://localhost:3000` pour test)

**Cliquez** : **"Create"**

---

### Étape 3 : Configuration OAuth (IMPORTANT)

Dans **Configuration** → **App URL** :

#### 3.1 URLs de redirection

Ajoutez **les deux lignes** suivantes :
```
http://localhost:3000/api/integrations/shopify/callback
https://comptalyze.com/api/integrations/shopify/callback
```

#### 3.2 App URL principale
```
https://comptalyze.com
```

#### 3.3 Embedded app
- **Décochez** "Embed app in Shopify admin" (Comptalyze n'est pas une app embarquée)

**Sauvegardez les changements**

---

### Étape 4 : Permissions (Scopes)

Dans **Configuration** → Descendez à **"Admin API access scopes"**

**Cochez ces 3 permissions :**
- ✅ `read_customers` - Lire les clients
- ✅ `read_orders` - Lire les commandes  
- ✅ `read_products` - Lire les produits

**Sauvegardez**

---

### Étape 5 : Choisir "Unlisted" (CRUCIAL)

Dans **Distribution** → **"Select distribution"**

#### 5.1 Choisir le mode

**IMPORTANT** : Sélectionnez **"Unlisted app"** (PAS Public !)

#### 5.2 Remplir le formulaire

```
App name: Comptalyze

Developer/Company name: Votre nom ou Comptalyze

Support email: support@comptalyze.com (ou votre email)

App description:
"Synchronisez automatiquement vos ventes Shopify avec Comptalyze pour simplifier votre comptabilité de micro-entrepreneur. Calcul automatique des cotisations URSSAF, déclarations fiscales et suivi du chiffre d'affaires en temps réel."

Privacy policy URL: https://comptalyze.com/legal/politique-de-confidentialite

Terms of service URL (optionnel): https://comptalyze.com/legal/conditions-generales

Support URL (optionnel): https://comptalyze.com/support
```

#### 5.3 Soumettre

**Cliquez** : **"Submit for review"**

✅ **Validation sous 48-72h** (vous recevrez un email)

---

### Étape 6 : Récupérer les identifiants

Dans **Overview** ou **API credentials** :

1. **Client ID** : Copiez-le
2. **Client secret** : Cliquez sur "Show" puis copiez-le

**Notez ces valeurs quelque part !**

---

## 🔧 Mettre à jour Comptalyze

### 1. Ouvrir `.env.local`

À la racine de votre projet, ouvrez le fichier `.env.local`

### 2. Remplacer les variables Shopify

Trouvez les lignes qui commencent par `SHOPIFY_` et remplacez-les :

```env
# ==============================================================================
# SHOPIFY INTEGRATION (OAuth) - NOUVELLE APP UNLISTED
# ==============================================================================
SHOPIFY_CLIENT_ID=votre_nouveau_client_id
SHOPIFY_CLIENT_SECRET=votre_nouveau_client_secret
SHOPIFY_REDIRECT_URI=http://localhost:3000/api/integrations/shopify/callback
NEXT_PUBLIC_SHOPIFY_CLIENT_ID=votre_nouveau_client_id
```

### 3. Sauvegarder

**Ctrl+S** pour sauvegarder `.env.local`

---

## 🚀 Redémarrer le serveur

### Windows PowerShell :

```powershell
# 1. Arrêter le serveur actuel (Ctrl+C dans le terminal)

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
http://localhost:3000
```

### 2. Aller sur les intégrations

**Dashboard → Compte → Intégrations**

Ou directement :
```
http://localhost:3000/dashboard/compte/integrations
```

### 3. Connecter Shopify

1. **Cliquez** sur "Connecter Shopify"
2. **Entrez** votre shop domain : `votre-boutique.myshopify.com`
3. **Cliquez** sur "Se connecter à Shopify"

### 4. Résultat attendu (pendant validation)

**Si l'app est en cours de validation :**
- Vous verrez peut-être un message "App en cours de validation"
- OU vous pourrez l'installer quand même si vous êtes le développeur

**Une fois approuvée (48-72h) :**
- ✅ L'installation fonctionnera pour TOUS vos clients
- ✅ Vous obtiendrez un **lien d'installation** à partager

---

## 📧 Après la validation Shopify

### Vous recevrez un email :

**Si approuvé :**
```
✅ Your app "Comptalyze" has been approved!

Installation link: https://apps.shopify.com/comptalyze-xxxxx
```

**Si modifications demandées :**
```
⚠️ Changes required for "Comptalyze"

Please address the following:
- [Liste des modifications à faire]
```

**Corrigez et resoumettez rapidement !**

---

## 🎯 Intégrer le lien dans Comptalyze (après validation)

Une fois approuvé, vous aurez un **lien d'installation** comme :
```
https://apps.shopify.com/comptalyze-xxxxx
```

### Modifier le code pour utiliser ce lien :

Dans `app/api/integrations/shopify/connect/route.ts`, au lieu de rediriger vers la page intermédiaire, vous pourrez rediriger directement vers ce lien.

---

## 🆚 Comparaison : Vos deux apps

| Critère | Ancienne app (Public) | **Nouvelle app (Unlisted)** ✅ |
|---------|---------------------|-------------------------------|
| **Prix** | 💰 19$ | ✅ **Gratuit** |
| **Statut** | En validation | À soumettre |
| **Vos clients** | ✅ Oui (après validation) | ✅ **Oui (via lien)** |
| **Délai validation** | ⏳ 1-3 semaines | ✅ **48-72h** |
| **App Store public** | ✅ Visible | ❌ Non visible |
| **Pour Comptalyze** | ⚠️ Overkill | ✅ **Parfait** |

---

## 💡 Que faire de l'ancienne app Public ?

### Option 1 : La supprimer
- Allez dans l'app "Comptalyze Integration" (l'ancienne)
- Settings → Delete app

### Option 2 : La garder en attente
- Laissez-la en validation
- Si elle est approuvée, vous aurez les deux
- Utilisez l'Unlisted pour la production
- Gardez la Public pour le futur (si vous voulez être dans l'App Store)

**Je recommande l'Option 2** : Gardez les deux, on ne sait jamais !

---

## 🐛 Dépannage

### "Unlisted" n'apparaît pas dans les options

**Solution :**
1. Assurez-vous d'avoir un compte Shopify Partners (pas juste marchand)
2. Créez une NOUVELLE app (pas modifier l'ancienne)
3. Au moment de la distribution, "Unlisted" devrait apparaître

### Les variables ne sont pas détectées

**Solution :**
```powershell
# Vérifier que .env.local contient bien les nouvelles valeurs
Get-Content .env.local | Select-String -Pattern "SHOPIFY"

# Redémarrer le serveur
.\start-dev.ps1
```

### L'installation échoue

**Vérifiez :**
1. ✅ Les URLs de callback sont correctes dans l'app Shopify
2. ✅ Les scopes (permissions) sont configurés
3. ✅ Le serveur tourne sur le bon port (3000)
4. ✅ Les variables dans `.env.local` sont à jour

---

## ✅ Checklist complète

- [ ] Nouvelle app créée sur Shopify Partners
- [ ] Mode "Unlisted" sélectionné
- [ ] URLs de callback configurées (localhost + production)
- [ ] Scopes (read_customers, read_orders, read_products) ajoutés
- [ ] Formulaire de distribution rempli
- [ ] App soumise pour validation
- [ ] Client ID et Secret récupérés
- [ ] `.env.local` mis à jour avec les nouvelles valeurs
- [ ] Serveur redémarré (`.\start-dev.ps1`)
- [ ] Test de connexion effectué

---

## 📊 Résumé

**Ce que vous avez maintenant :**

| Élément | Statut |
|---------|--------|
| App Unlisted Shopify | ✅ Créée |
| Coût | ✅ 0€ |
| Validation | ⏳ 48-72h |
| Vos clients peuvent utiliser | ✅ Oui (via lien) |
| Variables configurées | ✅ Oui |
| Serveur opérationnel | ✅ Oui |

---

## 🎉 Félicitations !

Vous avez créé une app Shopify "Unlisted" :
- ✅ Gratuite
- ✅ Rapide à valider
- ✅ Utilisable par vos clients
- ✅ Parfaite pour Comptalyze

**Attendez l'email de Shopify (48-72h) puis vos clients pourront connecter leur boutique !** 🚀

---

## 📞 Support

Si vous avez des questions :
1. Vérifiez d'abord ce guide
2. Consultez la documentation Shopify : https://shopify.dev/docs/apps
3. Contactez le support Shopify Partners si besoin

---

**Dernière mise à jour : Novembre 2025**



















