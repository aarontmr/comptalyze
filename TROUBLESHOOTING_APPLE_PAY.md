# 🔧 Troubleshooting Apple Pay - Link apparaît au lieu d'Apple Pay

## 🎯 SITUATION

- ✅ Cartes présentes dans Wallet sur les 2 iPhones
- ✅ Payment Request Button s'affiche
- ✅ **Link** apparaît dans "Paiement express"
- ❌ **Apple Pay** n'apparaît PAS

---

## 🔍 DIAGNOSTIC

Si Link apparaît mais pas Apple Pay, cela signifie :

1. ❌ Apple Pay n'est **pas activé** dans Stripe Dashboard
2. ❌ Apple Pay n'est **pas activé pour les abonnements** (subscriptions)
3. ❌ Votre compte Stripe n'a **pas accès** à Apple Pay

---

## ✅ SOLUTION 1 : Activer Apple Pay dans Dashboard (LE PLUS PROBABLE)

### **Étape 1 : Aller dans Payment Methods**

1. https://dashboard.stripe.com
2. **Settings** (⚙️ en haut à droite)
3. **Payment methods** (menu gauche)

### **Étape 2 : Chercher la section Wallets**

Scrollez jusqu'à voir :
```
Digital wallets ou Wallets
──────────────────────────
□ Apple Pay          [Toggle Off] ← Activez ici !
□ Google Pay         [Toggle Off]
□ Link by Stripe     [Toggle On]
```

### **Étape 3 : ACTIVER Apple Pay**

- Cliquez sur le **toggle** ou **checkbox** à côté d'Apple Pay
- Il doit passer à **ON** ou **activé** (vert/bleu)
- Cliquez sur **Save** ou **Save changes** en bas de page

### **Étape 4 : Accepter les conditions Apple Pay**

Si c'est la première activation, Stripe peut vous demander :
- ✅ D'accepter les **conditions d'utilisation Apple Pay**
- ✅ De confirmer votre **pays** (France)
- ✅ De fournir des **informations business** (si nécessaire)

---

## ✅ SOLUTION 2 : Vérifier le type de compte Stripe

### **Apple Pay disponible sur quel type de compte ?**

Apple Pay est disponible sur :
- ✅ Comptes Stripe **vérifiés**
- ✅ Comptes avec **business activé**
- ❌ PAS sur comptes test/dev non vérifiés

### **Vérifier votre compte** :

1. Dashboard Stripe > **Settings** > **Business settings**
2. Vérifiez que :
   - ✅ Compte **activé** (pas juste test mode)
   - ✅ Business **vérifié**
   - ✅ Pays : **France**

---

## ✅ SOLUTION 3 : Apple Pay et mode Test vs Production

### **Êtes-vous en mode Test ?**

1. En haut du Dashboard Stripe, vérifiez le toggle :
   - **Test mode** (gris) → Mode test
   - **Live mode** (vert) → Mode production

2. Apple Pay peut être activé séparément pour :
   - Mode Test
   - Mode Live (Production)

**Action** : Activez Apple Pay dans **les deux modes**

---

## ✅ SOLUTION 4 : Contacter le support Stripe

Si Apple Pay n'apparaît pas dans votre Dashboard Stripe, c'est que :

### **A. Votre compte n'a pas accès**

Possible si :
- Compte très récent
- Pas encore vérifié
- Pays non supporté (peu probable pour France)

### **B. Apple Pay doit être demandé**

Pour certains comptes, il faut :
1. Dashboard Stripe > **Help** (?)
2. Contacter le support : "Activer Apple Pay pour abonnements"
3. Ils l'activent en 24-48h généralement

---

## 🔍 VÉRIFICATION : Apple Pay activé dans votre compte ?

### **Test rapide** :

1. Dashboard Stripe > **Settings** > **Payment methods**
2. Utilisez **Ctrl+F** (ou Cmd+F) et cherchez : "Apple"
3. Résultat :
   - ✅ **Trouvé** "Apple Pay" avec toggle → Activez-le !
   - ❌ **Pas trouvé** → Votre compte n'a pas accès

---

## 🎯 CE QU'IL FAUT FAIRE MAINTENANT

### **Option A : Si vous voyez "Apple Pay" dans Payment methods**

1. Activez le toggle
2. Sauvegardez
3. Attendez 5 minutes
4. Retestez sur iPhone

---

### **Option B : Si vous NE voyez PAS "Apple Pay"**

Votre compte Stripe n'a probablement pas accès à Apple Pay. Deux solutions :

#### **1. Vérifier votre compte Stripe**
```
Dashboard > Settings > Business settings
- Business activé ? ✅
- Compte vérifié ? ✅
- Mode production actif ? ✅
```

#### **2. Contacter Stripe Support**

Message à envoyer :
```
Bonjour,

Je souhaite activer Apple Pay pour les paiements par abonnement 
sur mon site comptalyze.com.

J'ai des cartes dans Wallet sur iPhone mais seul Link s'affiche 
dans le Payment Request Button, pas Apple Pay.

Pouvez-vous activer Apple Pay pour mon compte ?

Merci,
[Votre nom]
```

Envoi via : Dashboard Stripe > **?** (Help) > **Contact support**

---

## 📱 ALTERNATIVE IMMÉDIATE : Utiliser Link

En attendant qu'Apple Pay soit activé :

**Link fonctionne très bien** et offre :
- ✅ Paiement en 1 clic (comme Apple Pay)
- ✅ Sauvegarde des infos
- ✅ Compatible tous appareils
- ✅ Sécurisé par Stripe

Vos utilisateurs iPhone peuvent utiliser Link en attendant ! 🔗

---

## 🎯 ACTIONS IMMÉDIATES

**MAINTENANT** :
1. Dashboard Stripe > Settings > Payment methods
2. **Cherchez "Apple Pay"** (Ctrl+F)
3. Si trouvé : **Activez le toggle**
4. Si pas trouvé : **Contactez Stripe Support**

**Puis dans 5 minutes** :
1. Retestez sur iPhone Safari
2. Apple Pay devrait apparaître

---

## 📊 CAS PROBABLE

| Situation | Probabilité | Solution |
|-----------|-------------|----------|
| Apple Pay pas activé dans Dashboard | 80% | Activer le toggle |
| Apple Pay pas dispo sur votre compte | 15% | Contacter Stripe |
| Problème technique | 5% | Vider cache + attendre |

---

**Vérifiez dans Stripe Dashboard > Settings > Payment methods si vous voyez "Apple Pay" quelque part !**

Si vous ne le voyez pas du tout, votre compte n'a probablement pas encore accès. Contactez Stripe Support pour l'activer ! 📧

Dites-moi ce que vous trouvez dans le Dashboard ! 🔍
