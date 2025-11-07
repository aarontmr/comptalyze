# 🍎 Configuration Apple Pay dans Stripe Dashboard

## 🎯 POURQUOI VOUS NE VOYEZ PAS APPLE PAY

Apple Pay ne s'affiche **PAS** par défaut dans Stripe Dashboard > Payment methods.

Il s'affiche **AUTOMATIQUEMENT** sur le checkout **côté utilisateur** si :
1. ✅ L'utilisateur est sur **iPhone/iPad/Mac**
2. ✅ L'utilisateur utilise **Safari**
3. ✅ Apple Pay est **configuré** sur l'appareil
4. ✅ Apple Pay est **activé** dans Stripe

---

## ✅ ÉTAPES POUR ACTIVER APPLE PAY

### **ÉTAPE 1 : Activer dans Stripe Dashboard**

1. Allez sur https://dashboard.stripe.com
2. **Settings** (icône engrenage en haut à droite)
3. Cliquez sur **Payment methods**
4. Descendez jusqu'à la section **Wallets**
5. Vous devriez voir :

```
Wallets
├─ Apple Pay          [✓ ou toggle]
├─ Google Pay         [✓ ou toggle]  
└─ Link               [✓ ou toggle]
```

6. **Activez Apple Pay** si pas déjà fait (toggle à droite)

**C'est tout !** Apple Pay est maintenant activé. ✅

---

### **ÉTAPE 2 : Vérifier les payment method types**

Dans **Payment methods** toujours :

1. Section **Payment method types**
2. Activez :
   - ✅ **Cards** (Visa, Mastercard, etc.)
   - ✅ **Wallets** (Apple Pay, Google Pay)
   - ✅ **Link**
   - ✅ **PayPal** (si vous le souhaitez)

---

## 🧪 TESTER APPLE PAY

Apple Pay ne s'affichera **QUE** sur les bons appareils :

### **Test 1 : Sur iPhone (Safari)**

1. Ouvrez **Safari** sur votre iPhone
2. Allez sur https://comptalyze.com/pricing
3. Cliquez sur **Passer à Pro**
4. Dans le formulaire de paiement, vous devriez voir :

```
┌────────────────────────────────┐
│  Informations de paiement      │
├────────────────────────────────┤
│  [Onglet] Carte                │
│  [Onglet] 🍎 Apple Pay  ← ICI │
│  [Onglet] Autre                │
└────────────────────────────────┘
```

5. Cliquez sur l'onglet **Apple Pay**
6. Un gros bouton noir **"Pay with Apple Pay"** apparaît
7. Cliquez dessus → Face ID/Touch ID → Terminé !

---

### **Test 2 : Sur Mac (Safari)**

Même processus, avec Touch ID ou iPhone à proximité pour confirmer.

---

### **Test 3 : Sur Android (Chrome)**

Même chose mais avec **Google Pay** au lieu d'Apple Pay.

---

## ❌ POURQUOI VOUS NE VOYEZ PAS APPLE PAY ?

### **1. Vous êtes sur Windows/Chrome**

Apple Pay n'apparaît **JAMAIS** sur :
- ❌ Windows
- ❌ Android
- ❌ Chrome (sur Windows)
- ❌ Firefox
- ❌ Edge

Il apparaît **UNIQUEMENT** sur :
- ✅ iPhone + Safari
- ✅ iPad + Safari
- ✅ Mac + Safari

---

### **2. Vous regardez dans le Dashboard Stripe**

Dans **Stripe Dashboard > Payment methods**, Apple Pay n'apparaît pas comme une option séparée dans la liste.

Il est dans la section **"Wallets"** qui regroupe :
- Apple Pay
- Google Pay
- Link

---

### **3. Apple Pay n'est pas configuré sur votre appareil de test**

Si vous testez sur iPhone mais qu'Apple Pay n'est pas configuré :
- Allez dans **Réglages** > **Wallet et Apple Pay**
- Ajoutez une carte

---

## 🔍 OÙ TROUVER APPLE PAY DANS STRIPE ?

### **Chemin exact** :

```
Dashboard Stripe
    ↓
Settings (⚙️ en haut à droite)
    ↓
Payment methods (dans le menu gauche)
    ↓
Scroll jusqu'à "Wallets"
    ↓
Apple Pay [Toggle On/Off]
```

**Screenshot mental** :
```
Payment methods
─────────────────
Cards
  ✓ Visa
  ✓ Mastercard
  ✓ American Express

Digital wallets
  ✓ Apple Pay      ← ICI
  ✓ Google Pay
  ✓ Link

Buy now, pay later
  □ Klarna
  □ Afterpay
```

---

## ✅ CE QUI A ÉTÉ FAIT

J'ai ajouté dans le code :

### **1. Dans CheckoutForm.tsx**
```typescript
wallets: {
  applePay: "auto",
  googlePay: "auto"
}
```

Cela demande à Stripe d'afficher Apple Pay/Google Pay **automatiquement** si l'appareil le supporte.

### **2. Dans checkout/route.ts** (API)
```typescript
payment_method_types: ["card", "paypal", "link"]
```

Cela active plusieurs moyens de paiement pour Stripe Checkout hébergé.

---

## 🎯 RÉSUMÉ

### **Apple Pay s'affichera automatiquement** :
- ✅ Sur iPhone/iPad/Mac + Safari
- ✅ Si Apple Pay configuré sur l'appareil
- ✅ Dès que le code sera déployé

### **Vous ne le verrez PAS** :
- ❌ Dans Stripe Dashboard "Payment methods" (juste le toggle Wallets)
- ❌ Sur Windows/Chrome
- ❌ Sur un appareil sans Apple Pay configuré

---

## 🧪 TESTER (Une fois déployé)

### **Option A : Avec votre iPhone**
1. Safari sur iPhone
2. https://comptalyze.com/pricing
3. "Passer à Pro"
4. Cherchez l'onglet **Apple Pay** 🍎

### **Option B : Avec Stripe Test Mode**

1. Dashboard Stripe > **Developers** > **Webhooks**
2. Activez **Test mode** (toggle en haut)
3. Apple Pay apparaîtra en mode test

---

## 🚀 PROCHAINES ÉTAPES

1. **Je vais pousser ce code** sur GitHub
2. **Attendez le déploiement** Vercel (2-3 min)
3. **Vérifiez dans Stripe** Dashboard > Settings > Payment methods > Wallets
4. **Testez sur iPhone** avec Safari

**Apple Pay sera visible uniquement côté utilisateur iPhone, pas dans le Dashboard Stripe !** 

---

Laissez-moi pousser ces modifications maintenant ! 🚀

