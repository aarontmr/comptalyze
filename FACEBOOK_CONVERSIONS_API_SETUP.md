# 🎯 Configuration de l'API Conversions Facebook - Guide Complet

## ✅ Ce qui a été implémenté

### 1. Pixel Meta (Côté Client) ✅
Le pixel Meta a été intégré dans `app/layout.tsx` :
- **Pixel ID** : `2064326694403097`
- **Événement automatique** : `PageView` sur toutes les pages
- **Emplacement** : Dans la section `<head>` comme recommandé par Meta

### 2. API Conversions Facebook (Côté Serveur) ✅

#### Fonction utilitaire créée
📁 `lib/facebookConversionsApi.ts`

Cette bibliothèque contient toutes les fonctions pour envoyer des événements à l'API Conversions Facebook :
- `trackStartTrial()` - Démarrage d'essai gratuit
- `trackCompleteRegistration()` - Inscription complétée
- `trackPurchase()` - Achat/Abonnement

**Caractéristiques** :
- ✅ Hachage automatique SHA-256 des données personnelles (email, nom, ville, etc.)
- ✅ Gestion des erreurs robuste
- ✅ Logs détaillés pour le debugging
- ✅ Non bloquant (si Facebook échoue, l'app continue)

#### Événements trackés

##### 1️⃣ **StartTrial** - Démarrage d'essai gratuit
- **Déclenché** : Quand un utilisateur démarre son essai gratuit de 3 jours
- **Localisation** : `app/api/start-trial/route.ts`
- **Données envoyées** :
  - Email (haché)
  - User Agent
  - URL source
  - User ID

##### 2️⃣ **CompleteRegistration** - Inscription complétée
- **Déclenché** : Quand un utilisateur termine son inscription
- **Localisation** : `app/signup/page.tsx` → `app/api/facebook-events/complete-registration/route.ts`
- **Données envoyées** :
  - Email (haché)
  - User Agent
  - URL source
  - User ID

##### 3️⃣ **Purchase** - Achat/Abonnement
- **Déclenché** : Quand un paiement Stripe est confirmé
- **Localisation** : `app/api/webhook/route.ts` (webhook Stripe)
- **Données envoyées** :
  - Email (haché)
  - Montant de la transaction
  - Devise (EUR)
  - User ID
  - Subscription ID

---

## 🔧 Configuration requise

### Étape 1 : Ajouter les variables d'environnement

Ouvrez votre fichier `.env.local` et ajoutez ces lignes :

```bash
# ------------------------------------------------------------------------------
# FACEBOOK / META (Pixel & Conversions API)
# ------------------------------------------------------------------------------
FACEBOOK_PIXEL_ID=2064326694403097
FACEBOOK_CONVERSION_API_TOKEN=EAAVTEHn72xQBPzGef0RsIoLbFjizAJskxPXUSx3LmnFq3tkZCK4qqdmb42XodoJ1SxB8xmI0fWL9eDrFyfaOZCvJCmwyYspKtyk41NQ7QZA9haLlX2fBCbbNvR7skCPkWDYpfkaOwp6jFuZCqumErzOGCZAiolakZC0DmysofDlPTMk4IATnMRqInB4GfQJAZDZD
```

### Étape 2 : Redémarrer le serveur Next.js

```bash
# Arrêter le serveur (Ctrl+C) puis :
npm run dev
```

**⚠️ IMPORTANT** : Après avoir ajouté les variables d'environnement, vous DEVEZ redémarrer le serveur Next.js pour qu'elles soient prises en compte.

### Étape 3 : Déployer en production

Si vous utilisez Vercel :

1. Allez dans **Settings** → **Environment Variables**
2. Ajoutez les deux variables :
   - `FACEBOOK_PIXEL_ID`
   - `FACEBOOK_CONVERSION_API_TOKEN`
3. Redéployez l'application

---

## 🧪 Comment tester

### Tester en local (développement)

1. **Démarrez votre serveur** :
   ```bash
   npm run dev
   ```

2. **Testez l'événement CompleteRegistration** :
   - Allez sur `http://localhost:3000/signup`
   - Créez un nouveau compte
   - Vérifiez les logs dans le terminal : vous devriez voir "📊 Événement CompleteRegistration envoyé à Facebook"

3. **Testez l'événement StartTrial** :
   - Connectez-vous
   - Allez sur la page des tarifs
   - Cliquez sur "Essai gratuit"
   - Vérifiez les logs : "📊 Événement StartTrial envoyé à Facebook"

4. **Testez l'événement Purchase** :
   - Effectuez un achat test avec Stripe
   - Vérifiez les logs du webhook : "📊 Événement Purchase envoyé à Facebook"

### Vérifier dans Facebook Events Manager

1. Allez sur [Meta Events Manager](https://business.facebook.com/events_manager2)
2. Sélectionnez votre pixel : `2064326694403097`
3. Cliquez sur **"Test Events"** dans le menu de gauche
4. Vous devriez voir vos événements apparaître en temps réel avec :
   - 🟢 **Vert** = Événement reçu avec succès
   - 🔵 **Bleu** = Pixel (côté client)
   - 🟠 **Orange** = Conversions API (côté serveur)

### Vérifier la qualité des événements

Dans Events Manager → **Overview** :
- **Event Match Quality** : Devrait être "Good" ou "Excellent"
- **Events Received** : Devrait augmenter
- **Matched Events** : Devrait montrer les déduplications entre Pixel et API

---

## 🔍 Debugging

### Les événements n'apparaissent pas dans Facebook

1. **Vérifiez les logs du serveur** :
   - Recherchez "📊" dans vos logs
   - Cherchez des erreurs "❌" ou "⚠️"

2. **Vérifiez les variables d'environnement** :
   ```bash
   # Dans votre terminal où tourne Next.js
   echo $FACEBOOK_PIXEL_ID
   echo $FACEBOOK_CONVERSION_API_TOKEN
   ```

3. **Vérifiez le token d'accès** :
   - Le token peut expirer
   - Générez un nouveau token dans Meta Events Manager si nécessaire

4. **Testez l'API manuellement** :
   ```bash
   curl -X POST \
     "https://graph.facebook.com/v21.0/2064326694403097/events?access_token=VOTRE_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "data": [{
         "event_name": "PageView",
         "event_time": 1699999999,
         "action_source": "website",
         "user_data": {
           "client_user_agent": "test"
         }
       }]
     }'
   ```

### Erreur "Invalid Access Token"

- Votre token a expiré ou est invalide
- Générez un nouveau token dans Meta Events Manager :
  1. Events Manager → Conversions API → Generate Access Token
  2. Copiez le nouveau token
  3. Mettez à jour `.env.local` et redéployez

### Erreur "Event time too old"

- L'API Facebook rejette les événements de plus de 7 jours
- Vérifiez que `event_time` utilise bien le timestamp actuel

---

## 📊 Avantages de cette implémentation

### Double tracking (Pixel + API)
- **Pixel** (côté client) : Rapide, suit les interactions en temps réel
- **API** (côté serveur) : Plus fiable, contourne les bloqueurs de pub

### Déduplication automatique
Facebook déduplique automatiquement les événements identiques envoyés par le Pixel et l'API grâce à :
- L'email (haché)
- L'`event_name`
- Le timestamp

### Protection de la vie privée
- Toutes les données personnelles sont **hachées en SHA-256** avant envoi
- Conformité RGPD
- Les données sont transmises de manière sécurisée (HTTPS)

### Performance
- Les appels à Facebook sont **non bloquants**
- Si Facebook échoue, l'application continue normalement
- Pas d'impact sur l'expérience utilisateur

---

## 📈 Événements futurs à implémenter (optionnel)

Vous pouvez ajouter d'autres événements selon vos besoins :

```typescript
// Exemple : ViewContent (consultation de page spécifique)
fbq('track', 'ViewContent', {
  content_name: 'Calculateur URSSAF',
  content_category: 'Tools',
});

// Exemple : AddToCart (ajout d'un plan au panier)
fbq('track', 'AddToCart', {
  content_name: 'Plan Premium',
  value: 9.90,
  currency: 'EUR',
});

// Exemple : InitiateCheckout (début du processus de paiement)
fbq('track', 'InitiateCheckout', {
  value: 9.90,
  currency: 'EUR',
});
```

---

## 🎉 Résumé

✅ **Pixel Meta installé** sur toutes les pages  
✅ **API Conversions configurée** avec token d'accès  
✅ **3 événements trackés** : StartTrial, CompleteRegistration, Purchase  
✅ **Données hachées** pour la confidentialité  
✅ **Non bloquant** pour les performances  
✅ **Logs détaillés** pour le debugging  

---

## 🆘 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs du serveur (`console.log`)
2. Utilisez l'outil "Test Events" de Facebook
3. Consultez la [documentation Meta](https://developers.facebook.com/docs/marketing-api/conversions-api)
4. Vérifiez le [statut de l'API Facebook](https://developers.facebook.com/status/dashboard/)

---

**Date de mise en place** : 10 novembre 2025  
**Version de l'API Facebook** : v21.0  
**Pixel ID** : 2064326694403097

