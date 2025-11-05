# 🚫 Guide : Élimination des redirections localhost

## 🎯 Objectif

S'assurer qu'**aucun utilisateur** ne soit jamais redirigé vers `localhost:3000`, même en développement local.

## ✅ Correctifs appliqués

### 1. **Signup - Redirection email** (`app/signup/page.tsx`)

**Avant :**
```typescript
emailRedirectTo: `${window.location.origin}/dashboard`
```

**Après :**
```typescript
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
emailRedirectTo: `${baseUrl}/dashboard`
```

✅ Utilise `NEXT_PUBLIC_BASE_URL` en priorité

---

### 2. **Checkout Form - Confirmation de paiement** (`app/components/CheckoutForm.tsx`)

**Avant :**
```typescript
confirmParams: {
  return_url: `${window.location.origin}/success`,
}
```

**Après :**
```typescript
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
confirmParams: {
  return_url: `${baseUrl}/success`,
}
```

✅ Utilise `NEXT_PUBLIC_BASE_URL` en priorité

---

### 3. **API Checkout** (`app/api/checkout/route.ts`)

**Avant :**
```typescript
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                process.env.NEXT_PUBLIC_APP_URL || 
                req.headers.get('origin') || 
                'http://localhost:3000';
```

**Après :**
```typescript
// Utiliser NEXT_PUBLIC_BASE_URL en priorité pour éviter localhost en production
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                req.headers.get('origin') || 
                process.env.NEXT_PUBLIC_APP_URL || 
                'https://comptalyze.com';
```

✅ Fallback vers `comptalyze.com` au lieu de `localhost:3000`

---

### 4. **API Create Payment Intent** (`app/api/create-payment-intent/route.ts`)

**Avant :**
```typescript
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                process.env.NEXT_PUBLIC_APP_URL || 
                req.headers.get('origin') || 
                'http://localhost:3000';
```

**Après :**
```typescript
// Utiliser NEXT_PUBLIC_BASE_URL en priorité pour éviter localhost en production
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                req.headers.get('origin') || 
                process.env.NEXT_PUBLIC_APP_URL || 
                'https://comptalyze.com';
```

✅ Fallback vers `comptalyze.com` au lieu de `localhost:3000`

---

## 📋 Configuration requise

### Variables d'environnement essentielles

#### Fichier `.env.local` (développement)

```env
# URL de production (PRIORITAIRE)
NEXT_PUBLIC_BASE_URL=https://comptalyze.com

# URL locale (fallback pour dev)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Configuration Vercel (production)

1. Allez dans **Settings** > **Environment Variables**
2. Ajoutez :
   ```
   NEXT_PUBLIC_BASE_URL = https://comptalyze.com
   ```

### Configuration Supabase

Pour éviter les redirections localhost dans les emails :

1. **Supabase Dashboard** > **Authentication** > **URL Configuration**
2. **Site URL** : `https://comptalyze.com`
3. **Redirect URLs** :
   ```
   https://comptalyze.com/**
   https://comptalyze.com/dashboard
   http://localhost:3000/** (pour dev local uniquement)
   ```

---

## 🔍 Hiérarchie des URLs

Ordre de priorité dans le code :

1. **`NEXT_PUBLIC_BASE_URL`** ← **PRIORITAIRE** ✅
   - Toujours `https://comptalyze.com` en production
   - Définie dans Vercel et `.env.local`

2. **`req.headers.get('origin')`** ← Détecte l'origine de la requête
   - Utile pour les requêtes API côté serveur

3. **`NEXT_PUBLIC_APP_URL`** ← Fallback
   - Peut être `localhost:3000` en dev local

4. **`https://comptalyze.com`** ← Fallback ultime
   - Garantit qu'on ne tombe jamais sur localhost en production

---

## 🧪 Test de validation

### Test 1 : Inscription

1. Créez un nouveau compte sur **production** (`https://comptalyze.com`)
2. Vérifiez l'email reçu
3. Le lien doit pointer vers `https://comptalyze.com/dashboard`
4. ❌ PAS vers `http://localhost:3000/dashboard`

### Test 2 : Paiement Stripe

1. Tentez de souscrire à un plan Pro/Premium
2. Complétez le paiement
3. La redirection de succès doit pointer vers `https://comptalyze.com/success`
4. ❌ PAS vers `http://localhost:3000/success`

### Test 3 : Checkout

1. Cliquez sur "Passer à Pro"
2. Vérifiez l'URL de la session Stripe dans les logs
3. Les URLs de redirection doivent utiliser `https://comptalyze.com`
4. ❌ PAS `http://localhost:3000`

---

## ✅ Points de contrôle

| Fonctionnalité | Avant | Après | Statut |
|----------------|-------|-------|--------|
| Email de vérification | `window.location.origin` | `NEXT_PUBLIC_BASE_URL` | ✅ |
| Confirmation paiement | `window.location.origin` | `NEXT_PUBLIC_BASE_URL` | ✅ |
| API Checkout | `localhost:3000` fallback | `comptalyze.com` fallback | ✅ |
| API Payment Intent | `localhost:3000` fallback | `comptalyze.com` fallback | ✅ |
| Supabase Site URL | Varie | `comptalyze.com` | ⚠️ À configurer |

---

## ⚠️ Cas particuliers

### Développement local

En développement local, le code utilise toujours `NEXT_PUBLIC_BASE_URL` en priorité, donc même en local, les redirections peuvent pointer vers `comptalyze.com`. **C'est voulu** pour éviter les bugs en production.

Si vous voulez tester en local avec localhost :
1. Commentez temporairement `NEXT_PUBLIC_BASE_URL` dans `.env.local`
2. Redémarrez le serveur
3. ⚠️ **N'oubliez pas de la remettre avant de commiter !**

### URLs relatives

Les redirections avec des chemins relatifs sont OK :
```typescript
window.location.href = "/dashboard"  // ✅ OK
window.location.href = "/login"      // ✅ OK
window.location.href = "/"           // ✅ OK
```

Ces chemins s'adaptent automatiquement au domaine actuel.

---

## 🚨 Erreurs à éviter

### ❌ Ne jamais faire ça :
```typescript
window.location.href = "http://localhost:3000/dashboard"
redirectTo: "http://localhost:3000/success"
const url = "http://localhost:3000" + path
```

### ✅ Toujours faire ça :
```typescript
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
window.location.href = `${baseUrl}/dashboard`
redirectTo: `${baseUrl}/success`
```

---

## 📝 Checklist de déploiement

Avant chaque déploiement, vérifiez :

- [ ] `NEXT_PUBLIC_BASE_URL=https://comptalyze.com` dans Vercel
- [ ] Supabase Site URL = `https://comptalyze.com`
- [ ] Supabase Redirect URLs inclut `https://comptalyze.com/**`
- [ ] Aucun hardcoded `localhost` dans le code
- [ ] Test d'inscription et vérification email
- [ ] Test de paiement Stripe
- [ ] Vérification des logs pour détecter des localhost

---

## 🎯 Résultat

Avec ces correctifs :
- ✅ **0 redirection vers localhost** en production
- ✅ URLs cohérentes partout dans l'application
- ✅ Emails de vérification pointent vers le bon domaine
- ✅ Paiements Stripe redirigent correctement
- ✅ Configuration centralisée via `NEXT_PUBLIC_BASE_URL`

---

## 💡 Bonnes pratiques

1. **Toujours utiliser `NEXT_PUBLIC_BASE_URL`** pour les URLs absolues
2. **Préférer les chemins relatifs** quand c'est possible (`/dashboard` plutôt que `https://...`)
3. **Définir des fallbacks sécurisés** (`comptalyze.com` plutôt que `localhost`)
4. **Tester en production** régulièrement pour vérifier les redirections
5. **Monitorer les logs** pour détecter les URLs suspectes

---

## 🔧 Commandes utiles

### Vérifier les URLs hardcodées

```bash
# Rechercher localhost dans le code
grep -r "localhost" app/

# Rechercher window.location.origin
grep -r "window.location.origin" app/

# Vérifier les variables d'environnement
echo $NEXT_PUBLIC_BASE_URL
```

### Test local avec production URLs

```bash
# Dans .env.local
NEXT_PUBLIC_BASE_URL=https://comptalyze.com
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Redémarrer
npm run dev
```

---

## 📞 Support

Si vous constatez encore des redirections vers localhost :

1. Vérifiez les variables d'environnement dans Vercel
2. Vérifiez la configuration Supabase
3. Consultez les logs de production
4. Vérifiez qu'il n'y a pas de cache dans Supabase (attendre 5-10 minutes)

