# Guide - Implémentation des plans annuels

## 🎯 Objectif

Ajouter une option de paiement annuel avec réduction de ~20% et une option de renouvellement automatique.

## ✅ Ce qui a été implémenté

### 1. Toggle Mensuel/Annuel sur la page pricing

**Fichier** : `app/pricing/page.tsx`

- Toggle élégant avec badge "-20%" sur l'option annuelle
- Affichage dynamique des prix selon le cycle choisi
- Pour les plans annuels :
  - Prix annuel total affiché en grand
  - Prix mensuel équivalent en dessous (ex: "Soit 4,74 €/mois")
  - Badge vert montrant les économies (ex: "Économisez 13,90 €")

**Tarification** :
- Pro Mensuel : 5,90 € / mois
- Pro Annuel : 56,90 € / an (soit 4,74 € / mois - économie de 13,90 €)
- Premium Mensuel : 9,90 € / mois
- Premium Annuel : 94,90 € / an (soit 7,91 € / mois - économie de 24,90 €)

### 2. Page de checkout avec support des plans annuels

**Fichier** : `app/checkout/[plan]/page.tsx`

Nouvelles URLs :
- `/checkout/pro` - Plan Pro mensuel
- `/checkout/pro_yearly` - Plan Pro annuel
- `/checkout/premium` - Plan Premium mensuel
- `/checkout/premium_yearly` - Plan Premium annuel

**Affichage différencié** :
- Plans mensuels : Affichage standard
- Plans annuels :
  - Prix annuel avec mention "/an"
  - Prix mensuel équivalent
  - Badge d'économies
  - **Checkbox "Renouveler automatiquement tous les ans"**

### 3. Option de renouvellement automatique

**Uniquement pour les plans annuels** :

Une checkbox permet à l'utilisateur de choisir :
- ✅ **Cochée (par défaut)** : L'abonnement se renouvelle automatiquement chaque année
- ☐ **Décochée** : L'abonnement s'arrête au bout d'un an (paiement unique)

Le texte sous la checkbox explique clairement ce qui va se passer.

### 4. API mise à jour

**Fichier** : `app/api/create-payment-intent/route.ts`

- Gère les 4 types de plans : `pro`, `premium`, `pro_yearly`, `premium_yearly`
- Récupère le paramètre `autoRenew` depuis le frontend
- Pour les plans annuels sans renouvellement :
  - Utilise `cancel_at_period_end: true` dans Stripe
  - L'abonnement s'arrête automatiquement après 12 mois
- Pour les plans avec renouvellement :
  - Fonctionne comme un abonnement récurrent classique

### 5. Variables d'environnement nécessaires

**Nouvelles variables à ajouter** :

```env
# Plans annuels Stripe
STRIPE_PRICE_PRO_YEARLY=price_...
STRIPE_PRICE_PREMIUM_YEARLY=price_...
```

## 🛠️ Configuration dans Stripe

### Étape 1 : Créer les produits annuels

1. Allez sur [Stripe Dashboard](https://dashboard.stripe.com) > **Products**
2. Créez 2 nouveaux produits :

**Comptalyze Pro (Annuel)** :
- Nom : Comptalyze Pro (Annuel)
- Prix : 56,90 €
- Facturation : Récurrent
- Période : Tous les 12 mois
- Devise : EUR

**Comptalyze Premium (Annuel)** :
- Nom : Comptalyze Premium (Annuel)
- Prix : 94,90 €
- Facturation : Récurrent
- Période : Tous les 12 mois
- Devise : EUR

### Étape 2 : Récupérer les Price IDs

Après création, copiez les Price IDs (format : `price_xxxxx`)

### Étape 3 : Ajouter dans les variables d'environnement

**Pour le développement local** (`.env.local`) :
```env
STRIPE_PRICE_PRO_YEARLY=price_xxxxx
STRIPE_PRICE_PREMIUM_YEARLY=price_xxxxx
```

**Pour la production** (Vercel) :
1. Allez dans Settings > Environment Variables
2. Ajoutez les deux variables
3. Redéployez l'application

## 🚀 Comment ça marche

### Scénario 1 : Abonnement mensuel (inchangé)

1. Utilisateur sélectionne "Mensuel" (par défaut)
2. Clique sur "Passer à Pro" ou "Passer à Premium"
3. Paye 5,90 € ou 9,90 € par mois
4. Renouvellement automatique chaque mois

### Scénario 2 : Abonnement annuel avec renouvellement

1. Utilisateur sélectionne "Annuel"
2. Clique sur "Passer à Pro" ou "Passer à Premium"
3. Sur la page de checkout, la checkbox "Renouveler automatiquement tous les ans" est **cochée**
4. Paye 56,90 € ou 94,90 € une fois
5. **Dans 1 an** : Renouvellement automatique pour 56,90 € ou 94,90 €
6. L'utilisateur peut annuler à tout moment depuis son dashboard

### Scénario 3 : Abonnement annuel SANS renouvellement

1. Utilisateur sélectionne "Annuel"
2. Clique sur "Passer à Pro" ou "Passer à Premium"
3. Sur la page de checkout, **décoche** la checkbox "Renouveler automatiquement tous les ans"
4. Paye 56,90 € ou 94,90 € une fois
5. **Dans 1 an** : L'abonnement s'arrête automatiquement
6. Aucun prélèvement futur
7. L'utilisateur devra souscrire manuellement s'il veut continuer

## 💡 Avantages business

### Pour vous (SaaS) :
- **Revenu immédiat plus élevé** : 56,90 € ou 94,90 € d'un coup au lieu de 5,90 € ou 9,90 € par mois
- **Meilleure trésorerie** : Cash-flow amélioré avec les paiements annuels
- **Réduction du churn** : Les clients annuels restent plus longtemps
- **Moins de transactions Stripe** : Frais de transaction réduits (1 transaction/an vs 12/an)

### Pour vos clients :
- **Économies attractives** : 19-20% de réduction
- **Simplicité** : Un seul paiement par an
- **Flexibilité** : Choix du renouvellement automatique ou non
- **Transparence** : Affichage clair du prix mensuel équivalent

## 📊 Récapitulatif des économies

| Plan | Mensuel (12 mois) | Annuel | Économie | % de réduction |
|------|-------------------|--------|----------|----------------|
| Pro | 70,80 € | 56,90 € | 13,90 € | 19,6% |
| Premium | 118,80 € | 94,90 € | 23,90 € | 20,1% |

## 🔍 Technique : Comment fonctionne le non-renouvellement

Quand l'utilisateur décoche la case de renouvellement automatique :

1. **Frontend** (`app/checkout/[plan]/page.tsx`) :
   - Envoie `autoRenew: false` dans la requête API

2. **Backend** (`app/api/create-payment-intent/route.ts`) :
   - Détecte que c'est un plan annuel ET que `autoRenew = false`
   - Configure l'abonnement Stripe avec :
   ```typescript
   subscription_data: {
     cancel_at_period_end: true
   }
   ```

3. **Stripe** :
   - Crée l'abonnement normalement
   - Marque l'abonnement pour annulation à la fin de la période
   - Dans 12 mois, l'abonnement passe automatiquement en statut "canceled"
   - Aucun prélèvement futur n'est effectué

4. **Résultat** :
   - L'utilisateur a accès pendant exactement 1 an
   - Au bout d'un an, son accès est révoqué
   - Il reçoit une notification de Stripe (configurable)

## 🎨 Interface utilisateur

### Toggle sur la page pricing
```
┌─────────────────────────────────────┐
│     [Mensuel]  [Annuel -20%] ✨    │
└─────────────────────────────────────┘
```

### Card de pricing (mode annuel)
```
┌─────────────────────────────────────┐
│ Pro                           ⭐ Recommandé
│ 56,90 € /an
│ Soit 4,74 €/mois
│ [Économisez 13,90 €]
│
│ ✓ Simulations illimitées
│ ✓ Export PDF par e-mail
│ ...
│
│ [Passer à Pro] ──────────────→
└─────────────────────────────────────┘
```

### Page de checkout (plan annuel)
```
┌─────────────────────────────────────┐
│ Récapitulatif                       │
│ Plan Pro                            │
│ 56,90 € /an                         │
│ Soit 4,74 €/mois                    │
│ [Économisez 13,90 €/an]             │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ☑ Renouveler automatiquement    │ │
│ │   tous les ans                  │ │
│ │                                 │ │
│ │   Votre abonnement sera auto-   │ │
│ │   matiquement renouvelé chaque  │ │
│ │   année. Annulable à tout moment│ │
│ └─────────────────────────────────┘ │
│                                     │
│ ✓ Paiement sécurisé avec Stripe    │
│ ✓ Renouvellement automatique annuel│
└─────────────────────────────────────┘
```

## ⚠️ Points d'attention

1. **Webhooks Stripe** : Assurez-vous que vos webhooks sont configurés pour gérer :
   - `customer.subscription.created` - Création de l'abonnement
   - `customer.subscription.updated` - Modification
   - `customer.subscription.deleted` - Fin de l'abonnement
   - `invoice.payment_succeeded` - Paiement réussi

2. **Gestion dans le dashboard utilisateur** :
   - L'utilisateur doit pouvoir voir s'il est en annuel ou mensuel
   - Il doit pouvoir voir sa date d'expiration
   - Il doit pouvoir réactiver le renouvellement automatique

3. **Notifications** :
   - Envoyer un email de confirmation après paiement annuel
   - Envoyer un rappel 1 mois avant l'expiration (si non-renouvelé)
   - Envoyer un email quand l'abonnement expire

## 🧪 Tests à effectuer

- [ ] Toggle mensuel/annuel fonctionne
- [ ] Prix s'affichent correctement en mode annuel
- [ ] Boutons redirigent vers les bonnes URLs (_yearly)
- [ ] Page checkout affiche les bonnes infos pour les plans annuels
- [ ] Checkbox de renouvellement apparaît uniquement pour les plans annuels
- [ ] Paiement fonctionne avec renouvellement activé
- [ ] Paiement fonctionne avec renouvellement désactivé
- [ ] Dans Stripe, vérifier que `cancel_at_period_end` est bien à `true` quand décochée
- [ ] Webhooks reçoivent les bons événements
- [ ] Accès utilisateur après paiement annuel

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez que les 4 Price IDs sont bien configurés
2. Vérifiez que les produits Stripe sont en mode "Récurrent" avec période de 12 mois
3. Consultez les logs Stripe pour voir les événements
4. Testez en mode Test avant de passer en production

---

**Prochaines améliorations possibles** :
- Badge "Meilleure offre" sur les plans annuels
- Affichage d'un timer "Offre limitée" pour inciter aux plans annuels
- Page dédiée pour gérer l'abonnement (annuler, réactiver le renouvellement, etc.)
- Analytics sur le taux de conversion mensuel vs annuel

