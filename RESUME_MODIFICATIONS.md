# Résumé des modifications - Redesign du plan FREE

## 📋 Fichiers modifiés

### 1. Configuration des plans
- **`lib/planLimits.ts`** (NOUVEAU) : Configuration centralisée des limites par plan
  - FREE : 5 URSSAF records/mois, 1 facture/mois, dashboard 30 jours, graphiques 3 mois
  - PRO : Illimité sauf pré-remplissage URSSAF et IA
  - PREMIUM : Tout illimité + toutes les fonctionnalités

### 2. Composant URSSAF Calculator
- **`app/components/UrssafCalculator.tsx`**
  - Limite passée de 3 à 5 records/mois
  - Vérification par mois calendaire (pas juste le total)
  - Bannière mise à jour avec compteur mensuel
  - Messages d'upsell améliorés

### 3. Système de factures
- **`app/factures/nouvelle/page.tsx`**
  - FREE peut maintenant créer 1 facture/mois (au lieu de 0)
  - Vérification de limite avant création via API
  - Message d'upsell si limite atteinte

### 4. Dashboard
- **`app/dashboard/page.tsx`**
  - Limitation des données à 30 derniers jours pour FREE
  - Graphiques limités à 3 mois pour FREE

### 5. Page Pricing
- **`app/pricing/page.tsx`**
  - Plan FREE redessiné avec nouvelles fonctionnalités
  - Badge "Free forever" et sous-titre rassurant
  - Liste complète des fonctionnalités FREE
  - Badge de confiance "Sans carte bancaire"
  - Tableau de comparaison mis à jour

### 6. Page d'accueil
- **`app/page.tsx`**
  - Badge de confiance au-dessus du CTA principal
  - Message "Sans carte bancaire" et "30 secondes"
  - Bannière Google Ads (composant dynamique)

### 7. Tracking Google Ads
- **`app/api/track-conversion/route.ts`** (NOUVEAU) : API pour tracker les conversions Google Ads
- **`app/signup/page.tsx`** : Tracking des conversions FREE signup depuis Google Ads
- **`lib/analytics.ts`** : Utilisation des fonctions existantes pour capturer UTM

### 8. Composants d'upsell
- **`app/components/LimitReachedModal.tsx`** (NOUVEAU) : Modal affichée quand une limite est atteinte
- **`app/components/GoogleAdsBanner.tsx`** (NOUVEAU) : Bannière en haut de page pour Google Ads

### 9. API de vérification des limites
- **`app/api/check-limits/route.ts`** (NOUVEAU) : API pour vérifier les limites côté serveur
  - Vérifie les limites URSSAF par mois
  - Vérifie les limites de factures par mois

## ✅ Fonctionnalités implémentées

### Plan FREE
- ✅ 5 simulations URSSAF sauvegardées / mois (limite par mois calendaire)
- ✅ Calcul en temps réel des cotisations et revenu net
- ✅ Dashboard basique : CA, cotisations, revenu net (30 derniers jours)
- ✅ 1 graphique CA (3 derniers mois)
- ✅ 1 facture / mois (PDF téléchargeable)
- ✅ Accès à tous les guides et tutoriels
- ❌ Pas de pré-remplissage URSSAF (Premium uniquement)
- ❌ Pas d'envoi email de factures (Pro/Premium)
- ❌ Pas de personnalisation factures (Pro/Premium)
- ❌ Pas de simulateur TVA (Pro/Premium)
- ❌ Pas d'exports complets (Pro/Premium)
- ❌ Pas de statistiques avancées & IA (Premium uniquement)

### Messages de confiance
- ✅ Badge "Plan gratuit – sans carte bancaire" sur / et /pricing
- ✅ Message "Créez votre compte en moins de 30 secondes"
- ✅ Bannière Google Ads avec message d'accueil

### Tracking Google Ads
- ✅ Capture des paramètres UTM (utm_source, utm_campaign, etc.)
- ✅ Stockage dans localStorage
- ✅ Tracking des conversions FREE signup
- ✅ API dédiée pour les conversions
- ✅ Événements nommés de manière cohérente (`google_ads_free_signup`, etc.)

### Upsells
- ✅ Modal quand limite atteinte (URSSAF ou factures)
- ✅ Bannière dans UrssafCalculator avec compteur
- ✅ Messages d'encouragement à upgrader
- ✅ CTAs vers /pricing

## 🔒 Limites techniques

Toutes les limites sont **techniquement appliquées** côté serveur :
- API `/api/check-limits` vérifie les limites avant création
- Dashboard limite les requêtes SQL pour FREE
- UrssafCalculator vérifie côté client ET serveur (via API si nécessaire)

## 📊 Points d'amélioration suggérés

1. **Notification push** : Ajouter une notification quand l'utilisateur FREE approche de la limite (4/5 records)
2. **Essai gratuit Pro** : Offrir 7 jours d'essai Pro après 3 mois d'utilisation FREE
3. **Email de bienvenue** : Envoyer un email avec un guide de démarrage pour les nouveaux FREE users
4. **Dashboard teaser** : Afficher un aperçu flouté des statistiques avancées pour FREE avec CTA "Upgrade to Premium"

## 🚀 Prochaines étapes

1. Tester toutes les limites avec un compte FREE
2. Vérifier que les conversions Google Ads sont bien trackées
3. Ajouter le tracking des upgrades (FREE → Pro/Premium) dans `/checkout/[plan]`
4. Créer un dashboard analytics pour visualiser les conversions Google Ads


