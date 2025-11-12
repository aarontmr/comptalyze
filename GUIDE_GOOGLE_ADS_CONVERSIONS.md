# 🎯 Guide : Configuration des Objectifs de Conversion Google Ads pour Comptalyze

## ⚠️ Problème actuel

"Envoi de formulaire pour leads" **N'EST PAS** le bon objectif de conversion pour Comptalyze car :
- Comptalyze est une **SaaS freemium**, pas un site B2B avec leads
- L'inscription est **gratuite**, ce n'est pas une conversion monétisée
- La vraie conversion business est l'**upgrade vers Pro/Premium** (paiement)

---

## ✅ Objectifs de conversion recommandés

### 1. 🎯 **Objectif PRINCIPAL : "Achat" ou "Paiement"** ⭐

**Pourquoi ?**
- C'est la conversion qui **génère des revenus**
- C'est l'objectif business le plus important
- Google Ads optimisera pour trouver des utilisateurs qui paient

**Événement tracké :** `upgrade_completed`
**Quand :** Après un paiement réussi sur Stripe Checkout
**Page :** `/success` (avec `session_id` ou `payment_intent`)

**Valeur de conversion :**
- Pro : 9,90€/mois (ou 99€/an)
- Premium : 19,90€/mois (ou 199€/an)

---

### 2. 📊 **Objectif SECONDAIRE : "Inscription"**

**Pourquoi ?**
- Mesurer l'**engagement** et le **taux de conversion du funnel**
- Comprendre le parcours : Visite → Inscription → Upgrade
- Optimiser les campagnes pour trouver des utilisateurs intéressés

**Événement tracké :** `signup_completed`
**Quand :** Après création de compte réussie
**Page :** `/signup` → redirection après vérification email

**Valeur de conversion :** 0€ (pas de valeur, juste engagement)

---

## 🚀 Configuration dans Google Ads

### Étape 1 : Créer l'objectif principal "Achat"

1. **Google Ads → Tools & Settings → Conversions**
2. **+ New conversion action**
3. **Category :** "Purchase/Sale"
4. **Conversion name :** `Achat_Comptalyze` ou `Upgrade_Pro_Premium`
5. **Value :** 
   - ✅ **Use different values for each conversion**
   - Cela permet de tracker la valeur réelle (9,90€ vs 19,90€)
   - **Valeur par défaut :** Mettez **9,90** (ou 14,90 pour une moyenne Pro/Premium)
   - ⚠️ **Ne mettez PAS 3,9€** (trop bas, sous-estime vos conversions)
   - Cette valeur ne sera utilisée qu'en cas de problème avec le code
6. **Count :** One (une conversion par transaction)
7. **Click-through window :** 30 jours
8. **View-through window :** 1 jour
9. **Attribution model :** Data-driven (recommandé)
10. **Click "Create and continue"**

### Étape 2 : Récupérer le Conversion ID et Label

Après création, vous verrez :
- **Conversion ID :** `17719086824` (utiliser `AW-17719086824` dans le code) ✅
- **Conversion Label :** `fpC9CPjV_74bEOidj4FC` ✅
- **Conversion Name :** `Achat_Comptalyze` ✅
- **Category :** `Achat` (Purchase) ✅

### Étape 3 : Configurer dans votre application

Ajoutez ces variables dans `.env.local` (dev) ou Vercel (prod) :

```env
# Google Ads - Conversion Achat (PRINCIPAL)
NEXT_PUBLIC_GOOGLE_ADS_CONV_ID=AW-17719086824
NEXT_PUBLIC_GOOGLE_ADS_CONV_LABEL=fpC9CPjV_74bEOidj4FC

# Google Ads - Conversion Inscription (SECONDAIRE - optionnel)
NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_CONV_ID=AW-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_CONV_LABEL=ZZZZZZZZZZZ
```

### Étape 4 : Créer l'objectif secondaire "Inscription" (optionnel)

1. **Google Ads → Tools & Settings → Conversions**
2. **+ New conversion action**
3. **Category :** "Sign-up"
4. **Conversion name :** `Inscription_Comptalyze`
5. **Value :** 
   - ❌ **Don't use a value** (pas de valeur, juste engagement)
6. **Count :** One (une conversion par utilisateur)
7. **Click-through window :** 30 jours
8. **Click "Create and continue"**

---

## 🔧 Code à implémenter

### 1. Page `/success` - Conversion Achat

Le code existe déjà dans `app/success/page.tsx`, mais il faut s'assurer qu'il track la **valeur** :

```typescript
// Dans app/success/page.tsx
const trackConversions = async () => {
  // ... code existant ...
  
  // Récupérer le plan et la valeur
  const { data: { user } } = await supabase.auth.getUser();
  const subscription = getUserSubscription(user);
  
  // Déterminer la valeur selon le plan
  let conversionValue = 0;
  if (subscription.isPremium) {
    conversionValue = 19.90; // Premium
  } else if (subscription.isPro) {
    conversionValue = 9.90; // Pro
  }
  
  // Fire Google Ads conversion avec VALEUR
  const googleAdsConvId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONV_ID;
  const googleAdsConvLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONV_LABEL;
  
  if (googleAdsConvId && googleAdsConvLabel && (window as any).gtag) {
    (window as any).gtag("event", "conversion", {
      send_to: `${googleAdsConvId}/${googleAdsConvLabel}`,
      transaction_id: sessionId || paymentIntent || user.id,
      value: conversionValue, // ← AJOUTER LA VALEUR
      currency: "EUR",
    });
    console.log("✅ Google Ads conversion fired avec valeur:", conversionValue);
  }
};
```

### 2. Page `/signup` - Conversion Inscription

Ajouter le tracking dans `app/signup/page.tsx` après inscription réussie :

```typescript
// Dans app/signup/page.tsx, après signup réussi
await trackEvent('signup_completed', { 
  email,
  ...utmParams 
});

// Fire Google Ads signup conversion (si configuré)
const signupConvId = process.env.NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_CONV_ID;
const signupConvLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_CONV_LABEL;

if (signupConvId && signupConvLabel && (window as any).gtag) {
  (window as any).gtag("event", "conversion", {
    send_to: `${signupConvId}/${signupConvLabel}`,
    transaction_id: user.id,
    // Pas de valeur pour l'inscription
  });
  console.log("✅ Google Ads signup conversion fired");
}
```

---

## 📊 Optimisation des campagnes

### Dans Google Ads

1. **Objectif principal :** "Achat" (conversion avec valeur)
   - Utilisez cet objectif pour **optimiser les enchères**
   - Google Ads optimisera pour trouver des utilisateurs qui paient
   - **Target CPA :** 15-25€ (coût par acquisition payant)
   - **Target ROAS :** 300-400% (retour sur investissement)

2. **Objectif secondaire :** "Inscription" (engagement)
   - Utilisez cet objectif pour **comprendre le funnel**
   - Ne l'utilisez **PAS** pour optimiser les enchères (pas de valeur)
   - Utilisez-le pour analyser : Taux d'inscription → Taux d'upgrade

### Métriques à suivre

| Métrique | Objectif | Description |
|----------|----------|-------------|
| **Conversions (Achat)** | Maximiser | Nombre d'upgrades Pro/Premium |
| **Cost per Conversion** | < 25€ | Coût par acquisition payant |
| **Conversion Rate** | > 2% | % de visiteurs qui paient |
| **ROAS** | > 300% | Retour sur investissement |
| **Signups** | Monitorer | Nombre d'inscriptions (engagement) |
| **Signup → Upgrade Rate** | > 10% | % d'inscriptions qui upgradent |

---

## 🎯 Résumé : Objectifs recommandés

### ✅ **Objectif PRINCIPAL : "Achat"**
- **Type :** Purchase/Sale
- **Valeur :** Oui (9,90€ ou 19,90€ selon le plan)
- **Optimisation :** Oui (utilisez pour optimiser les enchères)
- **Événement :** `upgrade_completed` sur `/success`

### ✅ **Objectif SECONDAIRE : "Inscription"**
- **Type :** Sign-up
- **Valeur :** Non (0€)
- **Optimisation :** Non (ne pas utiliser pour optimiser)
- **Événement :** `signup_completed` sur `/signup`

### ❌ **À ÉVITER : "Envoi de formulaire pour leads"**
- Pas adapté pour une SaaS freemium
- Ne mesure pas la vraie conversion business
- Ne permet pas d'optimiser pour les paiements

---

## 🚀 Prochaines étapes

1. **Créer l'objectif "Achat"** dans Google Ads
2. **Configurer les variables d'environnement** (`NEXT_PUBLIC_GOOGLE_ADS_CONV_ID` et `NEXT_PUBLIC_GOOGLE_ADS_CONV_LABEL`)
3. **Modifier le code** pour tracker la valeur de conversion
4. **Tester** avec Google Tag Assistant
5. **Lancer les campagnes** avec l'objectif "Achat"
6. **Monitorer** les conversions et optimiser

---

## 🔍 Vérification

### Tester les conversions

1. **Google Tag Assistant** :
   - Installez l'extension Chrome
   - Visitez votre site
   - Effectuez un test d'upgrade
   - Vérifiez que l'événement `conversion` est déclenché avec la valeur

2. **Google Ads → Conversions** :
   - Allez dans Tools → Conversions
   - Cliquez sur votre conversion "Achat"
   - Vérifiez "Recent conversions"
   - Délai : 24-48h pour voir les conversions

3. **Console du navigateur** :
   - Ouvrez la console (F12)
   - Effectuez un upgrade
   - Vérifiez les logs : `✅ Google Ads conversion fired avec valeur: 9.90`

---

**TL;DR** : Utilisez **"Achat"** (Purchase/Sale) comme objectif principal pour optimiser les campagnes Google Ads vers les utilisateurs qui paient. L'inscription peut être un objectif secondaire pour analyser le funnel, mais ne l'utilisez pas pour optimiser les enchères. 🎯

