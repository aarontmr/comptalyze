# 🐛 Debug - Formulaire de paiement ne s'affiche pas

## ⚠️ Instructions de diagnostic

### Étape 1 : Ouvrir la console du navigateur

1. Appuyez sur **F12** (ou clic droit > Inspecter)
2. Allez dans l'onglet **Console**
3. Rafraîchissez la page de checkout

### Étape 2 : Lire les messages

Cherchez ces messages et notez ce que vous voyez :

#### ✅ Messages positifs (tout va bien) :
```
✅ Utilisateur connecté: votre-email@example.com
🔑 Clé publique Stripe: ✅ Définie
🔄 Création de la session Stripe pour: { plan: 'pro', userId: '...', autoRenew: true }
📥 Réponse API: { clientSecret: '...' }
✅ ClientSecret reçu
⚙️ Options Stripe configurées: {...}
```

#### ❌ Messages d'erreur possibles :

**Erreur 1 : Clé publique manquante**
```
❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY n'est pas définie
```
**Solution** : Ajoutez `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...` dans `.env.local` et redémarrez

---

**Erreur 2 : Price ID manquant**
```
❌ Price ID non défini pour le plan pro
```
**Solution** : Ajoutez les Price IDs dans `.env.local` :
```env
STRIPE_PRICE_PRO=price_xxxxx
STRIPE_PRICE_PREMIUM=price_xxxxx
STRIPE_PRICE_PRO_YEARLY=price_xxxxx
STRIPE_PRICE_PREMIUM_YEARLY=price_xxxxx
```

---

**Erreur 3 : Clé secrète manquante**
```
❌ STRIPE_SECRET_KEY n'est pas défini
```
**Solution** : Ajoutez `STRIPE_SECRET_KEY=sk_test_...` dans `.env.local` et redémarrez

---

**Erreur 4 : Erreur Stripe API**
```
Error: No such price: 'price_xxxxx'
```
**Solution** : Vérifiez que les Price IDs dans `.env.local` correspondent aux produits créés dans Stripe Dashboard

---

**Erreur 5 : Utilisateur non connecté**
```
❌ Utilisateur non connecté, redirection vers /login
```
**Solution** : Connectez-vous d'abord

### Étape 3 : Vérifier ce qui s'affiche à l'écran

#### Si vous voyez "Configuration Stripe manquante"
→ La clé publique n'est pas définie. Voir Erreur 1 ci-dessus.

#### Si vous voyez un message d'erreur rouge avec du texte
→ Lisez le message. Il vous dira exactement quel Price ID manque.

#### Si vous voyez "🔄 Chargement du formulaire Stripe..."
→ C'est bon signe ! Le formulaire devrait apparaître dans quelques secondes.

#### Si vous ne voyez rien (zone blanche/vide)
→ Ouvrez la console. Il y a probablement une erreur JavaScript.

## 🔧 Solutions rapides

### Solution A : Fichier .env.local complet

Créez ce fichier à la racine du projet :

```env
# Stripe - Mode Test
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxxxxxx

# Price IDs
STRIPE_PRICE_PRO=price_1xxxxxxxxxxxxx
STRIPE_PRICE_PREMIUM=price_1xxxxxxxxxxxxx
STRIPE_PRICE_PRO_YEARLY=price_1xxxxxxxxxxxxx
STRIPE_PRICE_PREMIUM_YEARLY=price_1xxxxxxxxxxxxx

# URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Important** : Redémarrez le serveur après (Ctrl+C puis `npm run dev`)

### Solution B : Vérifier que Stripe est bien configuré

1. Allez sur https://dashboard.stripe.com/test/apikeys
2. Copiez la **Publishable key** (commence par `pk_test_`)
3. Copiez la **Secret key** (commence par `sk_test_`)
4. Créez 4 produits dans Products (voir GUIDE_CONFIGURATION_STRIPE_CHECKOUT.md)

### Solution C : Tester avec une page simple

Tapez dans la console :
```javascript
console.log(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
```

Si ça affiche `undefined`, le fichier .env.local n'est pas chargé.

## 📸 Ce que vous devriez voir

Une fois tout configuré :
1. Page de checkout se charge
2. Message "🔄 Chargement du formulaire Stripe..."
3. Formulaire Stripe apparaît avec :
   - Champ "Numéro de carte"
   - Champ "Date d'expiration"
   - Champ "CVC"
   - Bouton de paiement
4. Le tout en fond noir (#0e0f12)

## 🆘 Si rien ne fonctionne

Partagez le contenu de votre console (F12) :
1. Copiez tous les messages (même en vert ✅)
2. Particulièrement les messages rouges ❌
3. Indiquez si vous voyez "🔄 Chargement du formulaire Stripe..."

Vérifiez aussi :
- [ ] Fichier `.env.local` existe à la racine
- [ ] Serveur redémarré après modification de `.env.local`
- [ ] Vous êtes connecté (sinon redirection vers /login)
- [ ] Vous êtes sur une page comme `/checkout/pro` ou `/checkout/premium`

