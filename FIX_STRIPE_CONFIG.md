# 🔧 Fix : Configuration Stripe manquante

## ❌ Problème

Le message "Configuration Stripe manquante" s'affiche alors que la clé Stripe est bien dans le fichier `.env`.

## ✅ Solution étape par étape

### Étape 1 : Vérifier le nom de la variable

La variable **DOIT** s'appeler exactement :
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_ici
```

⚠️ **Points importants :**
- Le préfixe `NEXT_PUBLIC_` est **OBLIGATOIRE** (pour être accessible côté client)
- Pas d'espaces autour du `=`
- Pas de guillemets autour de la valeur
- La clé doit commencer par `pk_test_` (test) ou `pk_live_` (production)

### Étape 2 : Vérifier le bon fichier

Next.js lit les variables depuis **`.env.local`**, PAS depuis `.env` !

```
testcomptalyze/
├── .env.local    ← ✅ UTILISEZ CE FICHIER
├── .env          ← ❌ NE PAS UTILISER pour les secrets
└── ...
```

**Actions à faire :**
1. Ouvrez le fichier `.env.local` (créez-le s'il n'existe pas)
2. Ajoutez la variable :
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_ici
   ```

### Étape 3 : Redémarrer le serveur (CRUCIAL)

⚠️ **Next.js ne lit les variables d'environnement qu'au démarrage !**

**Vous DEVEZ redémarrer le serveur :**

1. Dans le terminal où tourne `npm run dev`, appuyez sur `Ctrl+C`
2. Relancez : `npm run dev`

### Étape 4 : Vérifier dans la console

Une fois le serveur relancé :

1. Ouvrez `http://localhost:3000/checkout/pro`
2. Ouvrez la console du navigateur (`F12`)
3. Vous devriez voir :
   ```
   🔑 Clé publique Stripe: ✅ Définie
   ```

Si vous voyez `❌ Non définie`, le problème persiste.

---

## 🔍 Diagnostic approfondi

### Test 1 : Vérifier dans la console du navigateur

Ouvrez la console (`F12`) et tapez :
```javascript
console.log(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
```

**Résultats possibles :**
- ✅ `pk_test_xxxxx` → La variable est bien chargée
- ❌ `undefined` → La variable n'est pas accessible côté client

### Test 2 : Vérifier le format de la clé

Votre clé doit ressembler à :
```
pk_test_51aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890...
```

**Format attendu :**
- Commence par `pk_test_` (environnement test)
- Ou `pk_live_` (environnement production)
- Suivi d'une longue chaîne de caractères

---

## 📝 Exemple de fichier `.env.local` complet

```env
# Stripe - Clés publiques (côté client)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890

# Stripe - Clés secrètes (côté serveur uniquement)
STRIPE_SECRET_KEY=sk_test_51aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdefghijklmnop

# Stripe - Price IDs
STRIPE_PRICE_PRO=price_1xxxxxxxxxxxxxx
STRIPE_PRICE_PREMIUM=price_1yyyyyyyyyyyyyy
STRIPE_PRICE_PRO_YEARLY=price_1zzzzzzzzzzzzz
STRIPE_PRICE_PREMIUM_YEARLY=price_1wwwwwwwwwwwww

# URLs
NEXT_PUBLIC_BASE_URL=https://comptalyze.com
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🚨 Erreurs courantes

### Erreur 1 : Variable dans `.env` au lieu de `.env.local`

❌ **Mauvais :**
```
.env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

✅ **Correct :**
```
.env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

### Erreur 2 : Oubli du préfixe `NEXT_PUBLIC_`

❌ **Mauvais :**
```env
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

✅ **Correct :**
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

### Erreur 3 : Espaces ou guillemets

❌ **Mauvais :**
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = "pk_test_xxx"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY= pk_test_xxx 
```

✅ **Correct :**
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

### Erreur 4 : Serveur non redémarré

⚠️ **Après TOUTE modification de `.env.local` :**
1. Arrêtez le serveur (`Ctrl+C`)
2. Relancez (`npm run dev`)

---

## 🎯 Checklist de vérification

Cochez chaque point :

- [ ] La variable est dans **`.env.local`** (pas `.env`)
- [ ] Le nom est **exactement** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] La clé commence par `pk_test_` ou `pk_live_`
- [ ] Pas d'espaces autour du `=`
- [ ] Pas de guillemets autour de la valeur
- [ ] Le serveur a été **redémarré** après modification
- [ ] Le fichier `.env.local` est à la **racine** du projet

---

## 🔑 Où trouver votre clé Stripe ?

1. Allez sur [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Connectez-vous à votre compte
3. Cliquez sur **Developers** (Développeurs)
4. Cliquez sur **API keys** (Clés API)
5. Vous verrez :
   - **Publishable key** (Clé publiable) → `pk_test_...`
   - **Secret key** (Clé secrète) → `sk_test_...`

**Pour le checkout, vous avez besoin de la clé PUBLIABLE** (`pk_test_...`)

---

## 🧪 Test final

Une fois tout configuré :

1. **Redémarrez** le serveur (`Ctrl+C` puis `npm run dev`)
2. Allez sur `http://localhost:3000/checkout/pro`
3. **Ouvrez la console** (`F12`)
4. Vous devriez voir :
   ```
   🔑 Clé publique Stripe: ✅ Définie
   ✅ ClientSecret reçu
   ```
5. Le formulaire de paiement Stripe devrait s'afficher

---

## 📞 Si le problème persiste

Si après avoir suivi TOUTES ces étapes, le problème persiste :

### Vérification avancée

1. **Supprimez le cache Next.js** :
   ```bash
   rm -rf .next
   npm run dev
   ```

2. **Vérifiez que le fichier existe** :
   ```bash
   # Windows PowerShell
   Get-Content .env.local
   
   # Windows CMD
   type .env.local
   ```

3. **Vérifiez les permissions du fichier** :
   Le fichier `.env.local` doit être lisible

4. **Essayez de créer un nouveau fichier** :
   - Créez un nouveau fichier `.env.local`
   - Copiez-collez la variable
   - Sauvegardez
   - Redémarrez

### Message d'erreur détaillé

Si vous voyez toujours l'erreur, partagez :
- Le contenu de votre `.env.local` (masquez les vraies clés)
- Les logs de la console du navigateur
- Les logs du terminal où tourne le serveur

---

## ✅ Résultat attendu

Une fois correctement configuré, vous devriez voir :

1. **Dans la console du navigateur** :
   ```
   🔑 Clé publique Stripe: ✅ Définie
   🔄 Création du Payment Intent pour: { plan: 'pro', userId: '...', autoRenew: true }
   📥 Réponse API: { clientSecret: 'pi_xxx_secret_xxx' }
   ✅ ClientSecret reçu
   ```

2. **Sur la page** :
   - Formulaire de paiement Stripe visible
   - Champs pour numéro de carte, date d'expiration, CVC
   - Bouton "Payer maintenant"

---

## 🎉 Ça fonctionne !

Si le formulaire s'affiche, vous pouvez tester avec une carte de test :
- **Numéro** : `4242 4242 4242 4242`
- **Date** : N'importe quelle date future (ex: `12/25`)
- **CVC** : N'importe quels 3 chiffres (ex: `123`)

