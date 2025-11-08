# 🚨 FIX CRITIQUE : Paiement ne met pas à jour l'abonnement

## ⚠️ Problème identifié

Après un paiement réussi, l'abonnement Premium/Pro ne s'active pas automatiquement dans le dashboard.

**Cause principale :** Le webhook Stripe n'est probablement pas configuré ou ne fonctionne pas correctement.

---

## ✅ Solutions apportées

### 1. **Page /success améliorée**
- ✅ Vérification automatique de l'abonnement toutes les 2 secondes (10 tentatives = 20 secondes)
- ✅ Refresh automatique de la session Supabase
- ✅ Indicateur visuel de l'activation en cours
- ✅ Bouton de vérification manuelle si le délai est dépassé
- ✅ Logs détaillés dans la console

### 2. **Webhook amélioré**
- ✅ Logs détaillés à chaque étape
- ✅ Gestion d'erreurs complète
- ✅ Vérification que l'userId existe
- ✅ Messages d'erreur explicites

---

## 🔧 Configuration URGENTE du Webhook Stripe

### **Étape 1 : Vérifier si le webhook existe**

1. Allez sur **Stripe Dashboard** : https://dashboard.stripe.com
2. Cliquez sur **Developers** (en haut à droite)
3. Cliquez sur **Webhooks** (dans le menu de gauche)

**Vous devriez voir :**
- Un webhook avec l'URL : `https://comptalyze.com/api/webhook`
- OU `https://VOTRE-DOMAINE.vercel.app/api/webhook`

**Si AUCUN webhook n'existe** → Passez à l'Étape 2

**Si un webhook existe mais ne fonctionne pas** → Passez à l'Étape 3

---

### **Étape 2 : Créer le webhook (SI MANQUANT)**

1. Dans **Webhooks**, cliquez sur **"Add endpoint"** ou **"+ Add an endpoint"**

2. **Endpoint URL** :
   - En production : `https://comptalyze.com/api/webhook`
   - OU votre domaine Vercel : `https://VOTRE-APP.vercel.app/api/webhook`

3. **Description** : `Comptalyze - Subscriptions`

4. **Events to send** :
   - Cliquez sur **"Select events"**
   - Cherchez et cochez :
     - ✅ `checkout.session.completed`
     - ✅ `customer.subscription.updated`
     - ✅ `customer.subscription.deleted`
     - ✅ `invoice.payment_succeeded`
     - ✅ `invoice.payment_failed`

5. Cliquez sur **"Add endpoint"**

6. **IMPORTANT : Copier le Signing Secret**
   - Une fois créé, cliquez sur votre webhook
   - Section **"Signing secret"**
   - Cliquez sur **"Reveal"**
   - Copiez la valeur (commence par `whsec_...`)

---

### **Étape 3 : Ajouter la variable d'environnement**

#### **Sur Vercel (PRODUCTION) :**

1. Allez sur **Vercel Dashboard** : https://vercel.com
2. Sélectionnez votre projet **Comptalyze**
3. Allez dans **Settings** > **Environment Variables**
4. Ajoutez une nouvelle variable :
   - **Name** : `STRIPE_WEBHOOK_SECRET`
   - **Value** : `whsec_VOTRE_SECRET_ICI` (celui copié à l'étape 2)
   - **Environment** : Cochez **Production**, **Preview**, **Development**
5. Cliquez sur **Save**
6. **REDÉPLOYEZ** votre application :
   - Allez dans **Deployments**
   - Cliquez sur les 3 points du dernier déploiement
   - Cliquez sur **"Redeploy"**

#### **En local (.env.local) :**

```bash
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SECRET_ICI
```

Redémarrez votre serveur après modification.

---

### **Étape 4 : Tester le webhook**

#### **Méthode 1 : Test en production (RECOMMANDÉ)**

1. Dans Stripe Dashboard > Webhooks
2. Cliquez sur votre webhook
3. Allez dans l'onglet **"Send test webhook"**
4. Sélectionnez **`checkout.session.completed`**
5. Cliquez sur **"Send test webhook"**

**Résultat attendu :**
- ✅ Status : `200 OK`
- ✅ Dans les logs Vercel, vous devriez voir les emojis 🎯 💳 👤 ✅

**Si erreur :**
- ❌ Vérifiez que `STRIPE_WEBHOOK_SECRET` est bien défini sur Vercel
- ❌ Vérifiez que l'URL du webhook est correcte
- ❌ Redéployez après avoir ajouté la variable

#### **Méthode 2 : Test avec un vrai paiement**

1. Utilisez une **carte de test Stripe** :
   - Numéro : `4242 4242 4242 4242`
   - Date : N'importe quelle date future
   - CVC : N'importe quel 3 chiffres
   - Code postal : N'importe lequel

2. Faites un paiement test
3. Vérifiez les logs :
   - **Console navigateur** (F12) sur la page /success
   - **Logs Vercel** pour voir les webhooks

---

## 🔍 Diagnostic rapide

### **Vérifier que tout est configuré :**

1. **Variables d'environnement sur Vercel :**
   - [ ] `STRIPE_SECRET_KEY` (sk_live_... ou sk_test_...)
   - [ ] `STRIPE_WEBHOOK_SECRET` (whsec_...)
   - [ ] `SUPABASE_SERVICE_ROLE_KEY` (eyJ...)
   - [ ] `NEXT_PUBLIC_SUPABASE_URL`
   - [ ] `STRIPE_PRICE_PRO` (price_...)
   - [ ] `STRIPE_PRICE_PREMIUM` (price_...)

2. **Webhook Stripe configuré :**
   - [ ] URL : `https://comptalyze.com/api/webhook`
   - [ ] Events : `checkout.session.completed`, etc.
   - [ ] Status : Activé (Enabled)

---

## 🧪 Test complet avec logs

### Sur la page /success (après paiement) :

1. **Ouvrez la console** (F12)
2. Vous devriez voir :

```
🔍 Vérification du statut de l'abonnement (tentative 1/10)...
✅ Session rafraîchie
👤 Utilisateur récupéré: [votre-id]
📋 Métadonnées: {...}
📊 Abonnement détecté: { plan: 'premium', isPremium: true, ... }
✅ Abonnement actif détecté!
```

**OU si le webhook n'a pas encore été reçu :**

```
🔍 Vérification du statut de l'abonnement (tentative 1/10)...
...
📊 Abonnement détecté: { plan: 'free', isPremium: false, ... }
⏳ Abonnement pas encore actif, retry dans 2s...
🔍 Vérification du statut de l'abonnement (tentative 2/10)...
...
```

### Dans les logs Vercel (pour le webhook) :

```
🎯 Webhook Stripe reçu
✅ Signature vérifiée - Type: checkout.session.completed
💳 checkout.session.completed reçu
📋 Session details: { userId: '...', plan: 'premium', ... }
👤 Récupération des données utilisateur...
✅ Utilisateur trouvé: votre@email.com
💾 Mise à jour de la table subscriptions...
✅ Table subscriptions mise à jour
💾 Mise à jour des métadonnées utilisateur: {...}
✅ Métadonnées mises à jour avec succès
✅✅✅ Utilisateur [id] mis à jour avec le plan premium - SUCCÈS COMPLET
```

---

## ⚡ Solution d'urgence (si webhook ne marche toujours pas)

### **Activer manuellement via SQL :**

```sql
-- Remplacez VOTRE_EMAIL et le plan souhaité
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        raw_user_meta_data,
        '{subscription_plan}',
        '"premium"'
      ),
      '{is_pro}',
      'true'
    ),
    '{is_premium}',
    'true'
  ),
  '{subscription_status}',
  '"active"'
)
WHERE email = 'VOTRE_EMAIL';
```

---

## 📞 Checklist de vérification finale

Avant de contacter le support, vérifiez :

1. [ ] Webhook configuré sur Stripe avec la bonne URL
2. [ ] `STRIPE_WEBHOOK_SECRET` défini sur Vercel
3. [ ] Application redéployée après ajout de la variable
4. [ ] Webhook testé avec succès (200 OK)
5. [ ] Logs consultés (Vercel et console navigateur)
6. [ ] Paiement bien effectué et confirmé sur Stripe

---

## 🎯 Prochaines étapes

1. **Testez maintenant** avec les nouveaux logs
2. **Configurez le webhook** si ce n'est pas fait
3. **Faites un paiement test** avec la carte `4242 4242 4242 4242`
4. **Vérifiez les logs** et envoyez-moi les erreurs si ça ne marche toujours pas

Le paiement fonctionne (confirmé par Stripe), c'est juste le webhook qui ne communique pas avec votre app !

