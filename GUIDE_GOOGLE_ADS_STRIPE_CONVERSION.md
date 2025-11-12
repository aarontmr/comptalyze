# 🎯 Guide : Google Ads Conversion avec Stripe Checkout

## ⚠️ Problème identifié

**Question :** Étant donné que la conversion se passe sur Stripe, Google va bien capter l'événement ?

**Réponse :** Oui, mais il faut s'assurer que le **cookie gclid** est préservé tout au long du parcours.

---

## 🔍 Comment fonctionne le tracking Google Ads

### 1. **Cookie gclid (Google Click ID)**

Quand un utilisateur clique sur une annonce Google Ads :
- Google Ads définit un **cookie `gclid`** dans le navigateur
- Ce cookie est **préservé** même lors des redirections vers des domaines externes (comme Stripe)
- Le cookie reste valide pendant **30 jours** (fenêtre d'attribution)

### 2. **Flux de conversion**

```
1. Utilisateur clique sur annonce Google Ads
   ↓
   Cookie gclid défini par Google Ads
   
2. Utilisateur arrive sur votre site
   ↓
   Cookie gclid présent dans le navigateur
   gclid stocké dans localStorage (backup)
   
3. Utilisateur clique sur "Passer à Pro/Premium"
   ↓
   Redirection vers Stripe Checkout
   Cookie gclid préservé (même domaine ou cross-domain)
   
4. Paiement réussi sur Stripe
   ↓
   Redirection vers /success?session_id=...
   Cookie gclid toujours présent
   
5. Événement de conversion déclenché sur /success
   ↓
   Google Ads lit le cookie gclid
   Conversion attribuée à l'annonce Google Ads
```

---

## ✅ Solution actuelle

### 1. **Capture du gclid**

Le code capture déjà le `gclid` dans :
- **localStorage** : Stocké via `AnalyticsProvider.tsx` et `attributionUtils.ts`
- **Cookie** : Défini automatiquement par Google Ads (préservé par le navigateur)

### 2. **Récupération sur /success**

Sur `/success`, le code récupère le `gclid` depuis :
- **localStorage** : Via `getAttributionData()`
- **Cookie** : Présent automatiquement dans le navigateur

### 3. **Événement de conversion**

L'événement de conversion est déclenché sur `/success` :
```typescript
gtag("event", "conversion", {
  send_to: "AW-17719086824/fpC9CPjV_74bEOidj4FC",
  transaction_id: sessionId || paymentIntent || user.id,
  value: conversionValue, // 9.90 ou 19.90
  currency: "EUR",
});
```

---

## 🔧 Améliorations recommandées

### 1. **Passer le gclid dans l'URL de success**

Pour être sûr que le gclid est préservé, on peut le passer dans l'URL de success de Stripe :

```typescript
// Dans app/api/checkout/route.ts
const attribution = getAttributionData(); // Récupérer depuis le frontend
const gclid = attribution.gclid;

// Ajouter le gclid dans l'URL de success
const successUrl = gclid 
  ? `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&gclid=${gclid}`
  : `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`;
```

### 2. **Récupérer le gclid depuis l'URL sur /success**

Sur `/success`, récupérer le gclid depuis l'URL en priorité :

```typescript
// Dans app/success/page.tsx
const searchParams = useSearchParams();
const gclidFromUrl = searchParams.get("gclid");
const gclid = gclidFromUrl || attribution.gclid; // URL en priorité
```

### 3. **Vérifier la présence du cookie gclid**

Ajouter une vérification pour s'assurer que le cookie gclid est présent :

```typescript
// Fonction pour récupérer le cookie gclid
function getGclidCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'gclid') {
      return value;
    }
  }
  return null;
}

// Utiliser le cookie gclid en priorité
const gclid = getGclidCookie() || gclidFromUrl || attribution.gclid;
```

---

## 🧪 Test de la conversion

### Test avec Google Tag Assistant

1. **Installer** l'extension Chrome [Google Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
2. **Simuler un clic Google Ads** :
   - Ajouter `?gclid=test-gclid-123` à l'URL de votre site
   - Vérifier que le cookie gclid est défini
3. **Effectuer un test de paiement** :
   - Aller sur la page de checkout
   - Compléter le paiement (mode test Stripe)
   - Vérifier que vous êtes redirigé vers `/success`
4. **Vérifier dans Tag Assistant** :
   - ✅ Événement `conversion` déclenché
   - ✅ `send_to` contient `AW-17719086824/fpC9CPjV_74bEOidj4FC`
   - ✅ `value` contient `9.90` ou `19.90`
   - ✅ `currency` contient `EUR`
   - ✅ Cookie `gclid` présent

### Test avec la console du navigateur

1. **Ouvrir la console** (F12)
2. **Vérifier le cookie gclid** :
   ```javascript
   document.cookie.split(';').find(c => c.trim().startsWith('gclid='))
   ```
3. **Effectuer un test de paiement**
4. **Vérifier les logs** :
   ```
   ✅ Google Ads conversion "Achat" fired avec valeur: 9.90€ (pro)
   ```

---

## ✅ Vérification dans Google Ads

### Après 24-48h

1. **Google Ads → Tools & Settings → Conversions**
2. **Cliquez** sur votre conversion **"Achat_Comptalyze"**
3. **Onglet** "Recent conversions"
4. **Vérifiez** que les conversions apparaissent avec :
   - ✅ Les valeurs correctes (9,90€ ou 19,90€)
   - ✅ L'attribution correcte (annonce Google Ads)

---

## 🚨 Dépannage

### Problème : Conversion non attribuée à Google Ads

**Causes possibles :**
1. **Cookie gclid absent** : L'utilisateur n'a pas cliqué sur une annonce Google Ads
2. **Fenêtre d'attribution expirée** : Le cookie gclid a expiré (30 jours)
3. **Cookie bloqué** : Le navigateur bloque les cookies tiers

**Solutions :**
1. **Vérifier le cookie gclid** : `document.cookie.split(';').find(c => c.trim().startsWith('gclid='))`
2. **Vérifier la fenêtre d'attribution** : Google Ads → Conversions → Votre conversion → Click-through window
3. **Tester avec un gclid de test** : Ajouter `?gclid=test-gclid-123` à l'URL

### Problème : Conversion déclenchée mais pas de valeur

**Causes possibles :**
1. **Valeur non transmise** : Le code ne transmet pas la valeur dans l'événement
2. **Valeur par défaut utilisée** : Google Ads utilise la valeur par défaut (3,9€)

**Solutions :**
1. **Vérifier le code** : S'assurer que `value` est transmis dans l'événement
2. **Vérifier Google Ads** : Conversion configurée avec "Utiliser des valeurs différentes"
3. **Vérifier les logs** : Console du navigateur pour voir la valeur transmise

---

## 📊 Résumé

### ✅ Ce qui fonctionne déjà

1. **Capture du gclid** : Stocké dans localStorage via `AnalyticsProvider.tsx`
2. **Récupération sur /success** : Récupéré depuis localStorage via `getAttributionData()`
3. **Événement de conversion** : Déclenché sur `/success` avec la valeur
4. **Cookie gclid** : Préservé automatiquement par le navigateur (même cross-domain)

### 🔧 Améliorations possibles

1. **Passer le gclid dans l'URL de success** : Pour être sûr qu'il est préservé
2. **Récupérer le gclid depuis l'URL** : En priorité sur `/success`
3. **Vérifier le cookie gclid** : S'assurer qu'il est présent avant de déclencher la conversion

### 🎯 Conclusion

**Oui, Google Ads va bien capter l'événement** si :
- ✅ Le cookie gclid est présent (défini par Google Ads)
- ✅ L'événement de conversion est déclenché sur `/success`
- ✅ Le cookie gclid est préservé lors de la redirection vers Stripe
- ✅ La fenêtre d'attribution n'a pas expiré (30 jours)

**Le cookie gclid est préservé automatiquement par le navigateur**, même lors des redirections vers Stripe Checkout. Google Ads peut donc attribuer la conversion à l'annonce correcte.

---

**TL;DR** : Le cookie gclid est préservé automatiquement par le navigateur, même lors des redirections vers Stripe. Google Ads va bien capter l'événement de conversion sur `/success` si le cookie gclid est présent. 🎯

