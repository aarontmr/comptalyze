# 🚀 Étapes pour redémarrer avec la configuration Stripe

## ⚠️ IMPORTANT : Le cache .next a été supprimé

Maintenant, suivez ces étapes **EXACTEMENT** dans cet ordre :

---

## 1️⃣ Arrêter le serveur en cours

Dans le terminal où tourne `npm run dev` :

1. Appuyez sur `Ctrl + C` (Windows/Linux) ou `Cmd + C` (Mac)
2. Attendez que le serveur s'arrête complètement
3. Vous devriez voir le prompt revenir (ex: `C:\Users\...>`)

---

## 2️⃣ Vérifier que le serveur est bien arrêté

Si le serveur ne s'arrête pas :
- Fermez complètement le terminal
- Ouvrez un nouveau terminal
- Naviguez vers le dossier du projet : `cd C:\Users\badav\OneDrive\Bureau\testcomptalyze`

---

## 3️⃣ Relancer le serveur

Dans le terminal, tapez :

```bash
npm run dev
```

Attendez que le serveur démarre complètement. Vous devriez voir :

```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Ready in X.Xs
```

---

## 4️⃣ Tester la configuration Stripe

### A. Ouvrir la page de checkout

1. Ouvrez votre navigateur
2. Allez sur : `http://localhost:3000/checkout/pro`

### B. Ouvrir la console du navigateur

1. Appuyez sur `F12` (ou clic droit > Inspecter)
2. Cliquez sur l'onglet **"Console"**
3. Recherchez ces messages :

**✅ Si ça fonctionne, vous devriez voir :**
```
🔑 Clé publique Stripe: ✅ Définie
🔄 Création du Payment Intent pour: { plan: 'pro', userId: '...', autoRenew: true }
📥 Réponse API: {...}
✅ ClientSecret reçu
```

**❌ Si le problème persiste, vous verrez :**
```
🔑 Clé publique Stripe: ❌ Non définie
❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY n'est pas définie
```

---

## 5️⃣ Si le problème persiste après redémarrage

### Option A : Vérifier la variable dans la console du navigateur

Dans la console du navigateur (`F12` > Console), tapez :

```javascript
console.log('Clé Stripe:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
```

**Résultat attendu :**
```
Clé Stripe: pk_live_51SLV2RIcAmH5ulu8FVXmC...
```

**Si vous voyez `undefined` :**
Le serveur n'a pas chargé la variable → Continuez à l'Option B

---

### Option B : Vérifier le contenu exact de .env.local

1. Ouvrez le fichier `.env.local`
2. Vérifiez qu'il contient **EXACTEMENT** :

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51SLV2RIcAmH5ulu8FVXmC...
```

⚠️ **Vérifications importantes :**
- ✅ Pas d'espaces avant ou après le `=`
- ✅ Pas de guillemets autour de la valeur
- ✅ La ligne n'est PAS commentée (pas de `#` devant)
- ✅ Le fichier s'appelle bien `.env.local` (pas `.env`)
- ✅ Le fichier est à la racine du projet (même niveau que `package.json`)

---

### Option C : Recréer le fichier .env.local

Si rien ne fonctionne, recréez le fichier :

1. **Supprimez** le fichier `.env.local` actuel
2. **Créez** un nouveau fichier nommé `.env.local`
3. **Copiez-collez** ce contenu (en remplaçant par vos vraies clés) :

```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51SLV2RIcAmH5ulu8FVXmC...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_PREMIUM=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
STRIPE_PRICE_PREMIUM_YEARLY=price_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# URLs
NEXT_PUBLIC_BASE_URL=https://comptalyze.com
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Autres
RESEND_API_KEY=re_...
OPENAI_API_KEY=sk-...
CRON_SECRET=...
```

4. **Sauvegardez** le fichier
5. **Redémarrez** le serveur (`Ctrl+C` puis `npm run dev`)

---

## 6️⃣ Vérification finale

Une fois le serveur redémarré :

### ✅ Checklist de vérification

- [ ] Le serveur a bien redémarré (vu le message "Ready in...")
- [ ] Vous êtes sur `http://localhost:3000/checkout/pro`
- [ ] La console du navigateur montre "🔑 Clé publique Stripe: ✅ Définie"
- [ ] Le formulaire de paiement Stripe s'affiche
- [ ] Vous voyez les champs : Numéro de carte, Date, CVC

---

## 🎯 Résultat attendu

Sur la page `/checkout/pro`, vous devriez voir :

**Gauche :**
- Plan Pro
- 5,90 €/mois
- Liste des fonctionnalités

**Droite :**
- "Informations de paiement"
- Formulaire Stripe avec champs de carte bancaire
- Bouton "Payer maintenant"

---

## 🆘 Si ça ne fonctionne TOUJOURS pas

Envoyez-moi ces informations :

1. **Console du serveur** (terminal où tourne npm run dev)
   - Copier les 20 dernières lignes

2. **Console du navigateur** (F12 > Console)
   - Copier tous les messages (surtout ceux avec 🔑)

3. **Contenu de .env.local** (masquez les valeurs sensibles)
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51SLV2RI... (montrez juste le début)
   ```

4. **Version de Node.js**
   ```bash
   node --version
   ```

---

## 💡 Notes importantes

- Le cache `.next` a déjà été supprimé
- La clé est détectée dans `.env.local` (pk_live_51SLV2RIcAmH5ulu8FVXmC...)
- Le problème vient du fait que Next.js ne la charge pas
- **La solution est presque toujours un redémarrage propre du serveur**

---

## 🎉 Une fois que ça fonctionne

Vous pourrez tester le paiement avec une carte de test :
- **Numéro** : `4242 4242 4242 4242`
- **Date** : N'importe quelle date future
- **CVC** : N'importe quels 3 chiffres

