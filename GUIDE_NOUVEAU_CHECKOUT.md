# Guide - Système de paiement Stripe intégré avec plans annuels

## 📋 Vue d'ensemble

Le système de paiement a été redesigné pour offrir une expérience intégrée directement dans votre SAAS, au lieu de rediriger vers la page Stripe Checkout externe. Il inclut maintenant des plans mensuels ET annuels avec une option de renouvellement automatique.

## 🎨 Modifications apportées

### 1. Nouvelle page de checkout intégrée
- **Fichier** : `app/checkout/[plan]/page.tsx`
- **URL** : `/checkout/pro`, `/checkout/premium`, `/checkout/pro_yearly`, `/checkout/premium_yearly`
- Design cohérent avec le reste du SAAS (couleurs, typographie, espacements)
- Layout à deux colonnes :
  - Gauche : Récapitulatif du plan sélectionné (avec affichage des économies pour les plans annuels)
  - Droite : Formulaire de paiement Stripe intégré
- **Option de renouvellement automatique** : Pour les plans annuels, une checkbox permet de choisir si l'abonnement se renouvelle automatiquement ou s'arrête au bout d'un an

### 2. Composant de formulaire de paiement
- **Fichier** : `app/components/CheckoutForm.tsx`
- Utilise Stripe Embedded Checkout
- Interface entièrement personnalisée aux couleurs de Comptalyze
- Badge de sécurité "Paiement sécurisé par Stripe"

### 3. API route pour créer la session de paiement
- **Fichier** : `app/api/create-payment-intent/route.ts`
- Crée une session Stripe Checkout en mode "embedded"
- Gère les abonnements récurrents (mensuels et annuels)
- Validation des plans et des utilisateurs
- Gestion de l'option de renouvellement automatique (via `cancel_at_period_end`)
- Gestion des erreurs détaillée

### 4. Pages de succès et annulation améliorées
- **Success** : `app/success/page.tsx` - Amélioration du design et gestion du session_id
- **Cancel** : `app/cancel/page.tsx` - Design amélioré avec bouton de retour et message d'aide

### 5. Toggle mensuel/annuel
- **Page pricing** : `app/pricing/page.tsx`
- Toggle élégant pour basculer entre les plans mensuels et annuels
- Affichage dynamique des prix avec économies pour les plans annuels
- Badge "-20%" sur le bouton annuel
- Calcul et affichage des économies annuelles (13,90€ pour Pro, 24,90€ pour Premium)

### 6. Mise à jour des boutons d'abonnement
- `app/pricing/page.tsx` - Redirection vers `/checkout/[plan]` ou `/checkout/[plan]_yearly`
- `app/page.tsx` - Redirection vers `/checkout/[plan]`
- `app/components/SubscriptionButtons.tsx` - Redirection vers `/checkout/[plan]`

## 🎨 Cohérence du design

Le nouveau système utilise les mêmes éléments de design que le reste du SAAS :

- **Couleur de fond** : `#0e0f12`
- **Cartes** : `#14161b` avec bordure `#1f232b`
- **Gradient principal** : `linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)`
- **Typographie** : `Poppins, sans-serif`
- **Effets** : Ombres portées, animations hover scale, bordures arrondies

## 📦 Dépendances ajoutées

```json
{
  "@stripe/stripe-js": "^14.x",
  "@stripe/react-stripe-js": "^2.x"
}
```

## 🔧 Configuration requise

Les variables d'environnement suivantes doivent être configurées :

```env
# Stripe - Clés publiques
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...

# Stripe - Clés secrètes
STRIPE_SECRET_KEY=sk_...

# Stripe Price IDs - Plans mensuels
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_PREMIUM=price_...

# Stripe Price IDs - Plans annuels (NOUVEAUX)
STRIPE_PRICE_PRO_YEARLY=price_...
STRIPE_PRICE_PREMIUM_YEARLY=price_...

# URLs de base
NEXT_PUBLIC_BASE_URL=https://votre-domaine.com
```

### 📊 Tarification recommandée

**Plans mensuels :**
- Pro : 5,90 € / mois
- Premium : 9,90 € / mois

**Plans annuels (avec ~20% de réduction) :**
- Pro : 56,90 € / an (soit 4,74 € / mois - économie de 13,90 €)
- Premium : 94,90 € / an (soit 7,91 € / mois - économie de 24,90 €)

### 🛠️ Création des produits dans Stripe

1. Connectez-vous à votre [Dashboard Stripe](https://dashboard.stripe.com)
2. Allez dans **Products** > **Add product**
3. Créez 4 produits :
   - **Comptalyze Pro (Mensuel)** - 5,90 € / mois - Récurrent
   - **Comptalyze Pro (Annuel)** - 56,90 € / an - Récurrent
   - **Comptalyze Premium (Mensuel)** - 9,90 € / mois - Récurrent
   - **Comptalyze Premium (Annuel)** - 94,90 € / an - Récurrent
4. Copiez les Price IDs (ils commencent par `price_...`)
5. Ajoutez-les dans vos variables d'environnement

## 🚀 Flux utilisateur

### Pour un plan mensuel :
1. L'utilisateur sélectionne "Mensuel" dans le toggle (par défaut)
2. Il clique sur "Passer à Pro" ou "Passer à Premium"
3. Redirection vers `/checkout/pro` ou `/checkout/premium`
4. La page affiche :
   - Un récapitulatif du plan sélectionné avec toutes les fonctionnalités
   - Le prix mensuel
   - Un formulaire de paiement Stripe intégré
5. L'utilisateur remplit ses informations de paiement
6. Après validation, redirection vers `/success?session_id=...`
7. L'abonnement se renouvelle automatiquement chaque mois

### Pour un plan annuel :
1. L'utilisateur sélectionne "Annuel" dans le toggle
2. Il clique sur "Passer à Pro" ou "Passer à Premium"
3. Redirection vers `/checkout/pro_yearly` ou `/checkout/premium_yearly`
4. La page affiche :
   - Un récapitulatif du plan avec les économies annuelles mises en avant
   - Le prix annuel et le prix mensuel équivalent
   - **Une checkbox "Renouveler automatiquement tous les ans"** (cochée par défaut)
   - Un formulaire de paiement Stripe intégré
5. L'utilisateur peut :
   - **Cocher la checkbox** : L'abonnement se renouvellera automatiquement chaque année
   - **Décocher la checkbox** : L'abonnement s'arrêtera au bout d'un an (aucun prélèvement futur)
6. Après validation, redirection vers `/success?session_id=...`
7. Selon le choix :
   - Si renouvellement activé : L'abonnement se renouvelle chaque année
   - Si renouvellement désactivé : L'abonnement s'arrête au bout d'un an

## ✨ Avantages de la nouvelle solution

- **Expérience utilisateur améliorée** : Pas de redirection vers un site externe
- **Design cohérent** : Intégration parfaite avec le reste du SAAS
- **Confiance accrue** : L'utilisateur reste sur votre domaine
- **Personnalisation** : Contrôle total sur l'apparence
- **Mobile-friendly** : Design responsive adapté à tous les écrans
- **Plans annuels** : Augmentation du revenu immédiat avec économies attractives pour les clients
- **Flexibilité** : Option de renouvellement automatique pour les plans annuels
- **Transparence** : Affichage clair des économies et du prix mensuel équivalent

## 🔒 Sécurité

- Paiements sécurisés par Stripe (PCI-compliant)
- Aucune donnée de carte bancaire ne transite par votre serveur
- Validation côté serveur des plans et des utilisateurs
- Gestion automatique de la TVA avec Stripe Tax

## 📝 Notes importantes

- Le mode "embedded" de Stripe Checkout nécessite Stripe API version 2025-10-29 ou supérieure
- Les webhooks Stripe doivent être configurés pour gérer les événements d'abonnement
- L'ancienne route `/api/checkout` est toujours présente mais n'est plus utilisée
- **Plans annuels sans renouvellement** : Utilisent `cancel_at_period_end: true` dans Stripe
- **Plans annuels avec renouvellement** : Fonctionnent comme des abonnements récurrents normaux
- Les économies affichées sont calculées sur base de 12 mois (mensuel) vs 1 paiement annuel

## 🐛 Dépannage

Si le formulaire de paiement ne s'affiche pas :
1. Vérifiez que `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` est bien défini
2. Vérifiez que les Price IDs (mensuels ET annuels) sont corrects dans les variables d'environnement
3. Vérifiez que les 4 produits sont bien créés dans Stripe Dashboard
4. Consultez la console du navigateur pour les erreurs JavaScript
5. Vérifiez les logs serveur pour les erreurs API

Si un plan annuel ne fonctionne pas :
1. Vérifiez que les Price IDs `STRIPE_PRICE_PRO_YEARLY` et `STRIPE_PRICE_PREMIUM_YEARLY` sont définis
2. Assurez-vous que les produits annuels dans Stripe sont configurés en "Récurrent" avec une période de "12 mois"
3. Vérifiez que l'URL inclut bien `_yearly` (ex: `/checkout/pro_yearly`)

Option de renouvellement :
- La checkbox n'apparaît QUE pour les plans annuels
- Si décochée, l'abonnement Stripe aura `cancel_at_period_end: true`
- Après le paiement, l'utilisateur peut toujours modifier cette option depuis son dashboard Stripe

## 📞 Support

Pour toute question ou problème, contactez le développeur ou consultez la documentation Stripe :
- [Stripe Embedded Checkout](https://stripe.com/docs/payments/checkout/embedded)
- [Stripe React Elements](https://stripe.com/docs/stripe-js/react)

