# Résumé de la structure actuelle des plans

## 📍 Configuration des plans

**Fichiers principaux :**
- `lib/plan.ts` : Définit le type `Plan = 'free' | 'pro' | 'premium'` et les fonctions `getUserPlan()` / `getUserPlanServer()`
- `lib/subscriptionUtils.ts` : Utilitaires pour vérifier le plan depuis `user_metadata` et `hasFeatureAccess()`
- `app/pricing/page.tsx` : Page de tarification avec les 3 plans (Free, Pro, Premium)
- `app/checkout/[plan]/page.tsx` : Page de checkout Stripe avec détails des plans

**Mapping Stripe :**
- `app/api/create-payment-intent/route.ts` : Crée les PaymentIntent Stripe
- `app/api/checkout/route.ts` : Crée les sessions Stripe Checkout
- Variables d'environnement : `STRIPE_PRICE_PRO`, `STRIPE_PRICE_PREMIUM`, `STRIPE_PRICE_PRO_YEARLY`, `STRIPE_PRICE_PREMIUM_YEARLY`

## 🔒 Feature gating logic

**Fichiers de contrôle d'accès :**
- `lib/subscriptionUtils.ts` : `hasFeatureAccess()` pour vérifier l'accès aux fonctionnalités
- `lib/plan.ts` : `hasFeature()` pour vérifier les features par plan
- `app/components/UrssafCalculator.tsx` : Limite actuelle = 3 records/mois pour FREE (ligne 50: `FREE_PLAN_LIMIT = 3`)
- `app/factures/nouvelle/page.tsx` : Vérifie `userPlan === 'pro' || userPlan === 'premium'` (ligne 46)
- `app/dashboard/statistiques/page.tsx` : Redirige les FREE vers `/pricing` (ligne 65-67)

**Limites actuelles FREE :**
- 3 enregistrements URSSAF par mois (dans `UrssafCalculator.tsx`)
- Pas d'accès aux factures (bloqué dans `factures/nouvelle/page.tsx`)
- Pas d'accès aux statistiques (redirection vers pricing)

## 💰 Pricing page UI

**Fichier :** `app/pricing/page.tsx`

**Plan FREE actuel :**
- Prix : 0 €/mois
- Features affichées :
  - 3 enregistrements par mois
  - Simulateur URSSAF (cotisations sociales)
  - Projection simple de votre activité

**Plan PRO :**
- Prix : 3,90 €/mois (Black Friday, original 9,90 €)
- Features : Enregistrements illimités, Calcul TVA, Gestion charges, Factures PDF, Export CSV/PDF

**Plan PREMIUM :**
- Prix : 7,90 €/mois (Black Friday, original 17,90 €)
- Features : Tout Pro + Automatisation, IA, Analytics Pro

## 🎯 Points d'implémentation à modifier

1. **UrssafCalculator.tsx** : Changer `FREE_PLAN_LIMIT` de 3 à 5
2. **Dashboard** : Limiter les requêtes à 30 jours pour FREE
3. **Factures** : Autoriser 1 facture/mois pour FREE (avec limite serveur)
4. **Pricing page** : Mettre à jour la description du plan FREE
5. **Page d'accueil** : Ajouter badge "sans carte bancaire"
6. **Tracking** : Ajouter détection UTM Google Ads









