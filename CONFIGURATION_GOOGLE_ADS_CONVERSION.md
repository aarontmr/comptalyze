# 🎯 Configuration Google Ads Conversion - Guide Rapide

## ✅ Informations de conversion

- **Conversion ID :** `17719086824` (AW-17719086824)
- **Conversion Label :** `fpC9CPjV_74bEOidj4FC`
- **Conversion Name :** `Achat_Comptalyze`
- **Category :** `Achat` (Purchase)

---

## 📋 Informations complètes

✅ **Toutes les données sont disponibles :**
- **Conversion ID :** `17719086824` (utiliser `AW-17719086824` dans le code)
- **Conversion Label :** `fpC9CPjV_74bEOidj4FC`
- **Conversion Name :** `Achat_Comptalyze`
- **Category :** `Achat` (Purchase)

---

## 🔧 Étape 2 : Configurer les variables d'environnement

### Option A : Développement local (`.env.local`)

1. **Ouvrez** le fichier `.env.local` à la racine du projet
2. **Ajoutez** (ou modifiez) ces lignes :

```env
# Google Ads Conversion Tracking
NEXT_PUBLIC_GOOGLE_ADS_CONV_ID=AW-17719086824
NEXT_PUBLIC_GOOGLE_ADS_CONV_LABEL=fpC9CPjV_74bEOidj4FC
```

3. **Sauvegardez** le fichier (Ctrl+S)
4. **Redémarrez** le serveur de développement :
   ```bash
   # Arrêtez le serveur (Ctrl+C)
   # Puis relancez :
   npm run dev
   # ou
   .\start-dev.ps1
   ```

### Option B : Production (Vercel)

1. **Vercel Dashboard** → Sélectionnez votre projet Comptalyze
2. **Settings** → **Environment Variables**
3. **Ajoutez** ces variables :

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_GOOGLE_ADS_CONV_ID` | `AW-17719086824` | Production, Preview, Development |
| `NEXT_PUBLIC_GOOGLE_ADS_CONV_LABEL` | `fpC9CPjV_74bEOidj4FC` | Production, Preview, Development |

4. **Cliquez** sur "Save"
5. **Redéployez** l'application :
   - **Deployments** → Cliquez sur les 3 points (⋯) → **Redeploy**

---

## 🧪 Étape 3 : Tester la conversion

### Test avec Google Tag Assistant

1. **Installez** l'extension Chrome [Google Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
2. **Ouvrez** votre site en développement (`http://localhost:3000`)
3. **Cliquez** sur l'icône Tag Assistant dans Chrome
4. **Effectuez** un test d'upgrade (paiement test Stripe)
5. **Vérifiez** dans Tag Assistant :
   - ✅ Événement `conversion` déclenché
   - ✅ `send_to` contient `AW-17719086824/fpC9CPjV_74bEOidj4FC`
   - ✅ `value` contient `9.90` ou `19.90`
   - ✅ `currency` contient `EUR`

### Test avec la console du navigateur

1. **Ouvrez** la console (F12)
2. **Effectuez** un upgrade (paiement test)
3. **Vérifiez** les logs :
   ```
   ✅ Google Ads conversion "Achat" fired avec valeur: 9.90€ (pro)
   ```
   ou
   ```
   ✅ Google Ads conversion "Achat" fired avec valeur: 19.90€ (premium)
   ```

---

## ✅ Vérification dans Google Ads

### Après 24-48h

1. **Google Ads → Tools & Settings → Conversions**
2. **Cliquez** sur votre conversion **"Achat"**
3. **Onglet** "Recent conversions"
4. **Vérifiez** que les conversions apparaissent avec les valeurs correctes (9,90€ ou 19,90€)

---

## 🚨 Dépannage

### Problème : Conversion non déclenchée

**Vérifications :**

1. **Variables d'environnement** :
   - ✅ `NEXT_PUBLIC_GOOGLE_ADS_CONV_ID` est défini
   - ✅ `NEXT_PUBLIC_GOOGLE_ADS_CONV_LABEL` est défini
   - ✅ Le serveur a été redémarré après modification

2. **Console du navigateur** :
   - Ouvrez la console (F12)
   - Vérifiez les logs :
     - ✅ `✅ Google Ads conversion "Achat" fired avec valeur: X.XX€`
     - ❌ `⚠️ Google Ads conversion 'Achat' non déclenchée`

3. **Google Tag Assistant** :
   - Vérifiez que l'événement `conversion` est déclenché
   - Vérifiez que `send_to` contient le bon Conversion ID/Label

### Problème : Conversion déclenchée mais pas de valeur

**Vérifications :**

1. **Code** : Le code doit transmettre la valeur :
   ```typescript
   value: conversionValue, // 9.90 ou 19.90
   currency: "EUR",
   ```

2. **Google Ads** : La conversion doit être configurée avec :
   - ✅ "Utiliser des valeurs différentes pour chaque conversion"
   - ✅ Valeur par défaut : 9,90€ (ou 14,90€)

### Problème : Conversion ID incorrect

**Vérifications :**

1. **Format** : Le Conversion ID doit commencer par `AW-`
   - ✅ `AW-1234567890`
   - ❌ `1234567890`

2. **Google Ads** : Vérifiez que le Conversion ID est correct dans :
   - Google Ads → Tools & Settings → Conversions → Votre conversion → Tag setup

---

## 📝 Résumé de configuration

```env
# .env.local (développement)
NEXT_PUBLIC_GOOGLE_ADS_CONV_ID=AW-17719086824
NEXT_PUBLIC_GOOGLE_ADS_CONV_LABEL=fpC9CPjV_74bEOidj4FC
```

```env
# Vercel (production)
NEXT_PUBLIC_GOOGLE_ADS_CONV_ID=AW-17719086824
NEXT_PUBLIC_GOOGLE_ADS_CONV_LABEL=fpC9CPjV_74bEOidj4FC
```

---

## 🎯 Prochaines étapes

1. ✅ **Récupérer le Conversion ID** dans Google Ads
2. ✅ **Configurer les variables** dans `.env.local` (dev) et Vercel (prod)
3. ✅ **Tester** avec Google Tag Assistant
4. ✅ **Vérifier** dans Google Ads après 24-48h
5. ✅ **Optimiser** les campagnes avec l'objectif "Achat"

---

**TL;DR** : Ajoutez `NEXT_PUBLIC_GOOGLE_ADS_CONV_ID=AW-17719086824` et `NEXT_PUBLIC_GOOGLE_ADS_CONV_LABEL=fpC9CPjV_74bEOidj4FC` dans `.env.local` et Vercel, puis redémarrez le serveur. 🚀

