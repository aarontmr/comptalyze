// Contexte complet des fonctionnalités Comptalyze pour ComptaBot

export const COMPTALYZE_FEATURES = `
# COMPTALYZE - Guide Complet des Fonctionnalités

## 🎯 Vue d'Ensemble
Comptalyze est une plateforme SaaS de gestion comptable simplifiée pour auto-entrepreneurs et micro-entreprises françaises.

## 📊 PLANS & TARIFS

### Plan Gratuit (0€/mois)
- 3 enregistrements de CA par mois
- Simulateur URSSAF basique (calcul cotisations sociales)
- Projection simple de l'activité
- Accès limité aux fonctionnalités

### Plan Pro (7,90€/mois)
- **Enregistrements illimités** de CA
- **Calcul TVA automatique**
- **Gestion des charges déductibles**
- **Factures PDF complètes** générées automatiquement
- **Export CSV/PDF** (journal comptable simple)
- Simulateur URSSAF complet
- Projections avancées

### Plan Premium (7,90€/mois - Prix de lancement)
**Tout Pro + :**

🤖 **Automatisation Totale**
- Import automatique Shopify/Stripe (CA mensuel synchronisé)
- Email récapitulatif chaque fin de mois
- Pré-remplissage URSSAF en 1 clic
- Calendrier fiscal intelligent avec rappels automatiques
- Économie : 10h/mois

🧠 **Intelligence Artificielle**
- ComptaBot personnalisé 24/7 (expert-comptable IA)
- Optimisations fiscales sur-mesure (ACRE, IR, déductions)
- Conseils adaptés à votre situation réelle
- Équivaut à 100€/h de conseil comptable

📊 **Analytics Pro**
- Tableaux de bord avancés
- Alertes intelligentes (seuils TVA, CFE, plafonds CA)
- Anticipation des échéances fiscales
- Export comptable professionnel (compatible expert-comptable)
- Économie : 200€/an de saisie

**ROI Premium :** 3 000€/an de valeur pour 94,80€/an → Rentabilisé en 2 semaines

## 🛠️ FONCTIONNALITÉS DÉTAILLÉES

### 1. Simulateur URSSAF
- **Calcul automatique des cotisations sociales**
  - Taux selon activité (12,3% ventes, 21,1-21,2% services)
  - Support ACRE (exonération partielle années 1-3)
  - Calcul impôt sur le revenu (Versement Libératoire ou Barème)
- **Projection mensuelle et annuelle**
- **Pré-remplissage des déclarations** (Premium)
- **Historique complet** des déclarations

### 2. Gestion du CA (Chiffre d'Affaires)
- **Enregistrement manuel** (illimité en Pro/Premium)
- **Import automatique Shopify/Stripe** (Premium uniquement)
  - Sync dernier jour du mois à 23h
  - Agrégation multi-sources
  - Email récap automatique
- **Catégorisation par activité** (ventes, services BIC, libéral BNC)
- **Graphiques d'évolution** mensuelle et annuelle
- **Export Excel/CSV/PDF**

### 3. Gestion TVA
- **Calcul automatique TVA** (Pro/Premium)
- **Suivi des seuils de franchise**
  - Services : 36 800€
  - Ventes : 91 900€
- **Alertes avant dépassement** (Premium)
- **Déclaration TVA facilitée** si assujetti

### 4. Charges Déductibles
- **Enregistrement des dépenses** professionnelles
- **Catégorisation automatique**
- **Calcul impact fiscal**
- **Export pour comptable**
- **Justificatifs attachés** (scan/photo)

### 5. Facturation
- **Génération factures PDF** conformes (Pro/Premium)
- **Numérotation automatique**
- **Mentions légales pré-remplies**
- **Personnalisation logo/couleurs**
- **Envoi direct par email**
- **Relances automatiques** (Premium)

### 6. Calendrier Fiscal (Premium)
- **Échéances URSSAF** pré-enregistrées
- **Rappels par email** (J-7, J-3, J-1)
- **CFE (Cotisation Foncière des Entreprises)**
- **Déclaration revenus annuelle**
- **TVA trimestrielle** si applicable
- **Synchronisation Google Calendar/Outlook**

### 7. Intégrations (Premium)

**Shopify**
- OAuth sécurisé
- Import commandes automatique
- Calcul CA mensuel
- Tokens chiffrés AES-256

**Stripe**
- Stripe Connect OAuth
- Import paiements automatique
- Réconciliation multi-devises
- Tokens chiffrés AES-256

**Workflow :**
1. Connexion en 1 clic (OAuth)
2. Sync automatique dernier jour du mois
3. CA enregistré + Email envoyé
4. Données pré-remplies dans URSSAF

### 8. ComptaBot (Assistant IA - Premium)
- **Expert-comptable IA 24/7**
- **Contexte personnalisé** :
  - Connaît votre régime fiscal (IR)
  - Connaît votre statut ACRE
  - Connaît vos intégrations Shopify/Stripe
  - Accès à votre historique CA
- **Questions supportées** :
  - Calculs cotisations
  - Optimisations fiscales
  - Déclarations URSSAF
  - TVA et seuils
  - Charges déductibles
  - ACRE et exonérations
  - Stratégies d'optimisation
- **Réponses en français**, courtes et actionnables
- **Équivalent 100€/h** de conseil

### 9. Onboarding Premium
Configuration guidée en 5 étapes :
1. **Bienvenue** - Présentation des bénéfices
2. **Régime IR** - Versement Libératoire, Barème ou Pas encore soumis
3. **ACRE** - Configuration exonération (année 1-3)
4. **Intégrations** - Connexion Shopify/Stripe
5. **Récapitulatif** - Validation et sauvegarde

Temps : 3-5 minutes
Résultat : Calculs ultra-précis personnalisés

### 10. Analytics Avancés (Premium)
- **Tableaux de bord temps réel**
- **KPIs clés** :
  - CA mensuel/annuel
  - Taux de cotisations effectif
  - Projection fin d'année
  - Distance aux seuils TVA/CA
- **Alertes intelligentes** :
  - Approche seuil TVA (J-3 mois)
  - Risque dépassement plafond CA
  - CFE à venir
  - Déclaration URSSAF oubliée
- **Comparaisons** année N vs N-1
- **Export Excel avancé**

### 11. Sécurité & Conformité
- **Chiffrement AES-256** des données sensibles
- **Hébergement France** (RGPD compliant)
- **Backup quotidien** automatique
- **OAuth sécurisé** (Shopify/Stripe)
- **Authentification Supabase**
- **RLS (Row Level Security)** sur toutes les tables
- **Conformité URSSAF** (calculs certifiés)

### 12. Support & Documentation
- **Base de connaissances** intégrée
- **FAQ interactive**
- **Guides pas-à-pas** (captures d'écran)
- **ComptaBot** pour questions instantanées (Premium)
- **Email support** : support@comptalyze.fr
- **Temps de réponse** : < 24h

## 💰 AVANTAGES ÉCONOMIQUES

### Gain de Temps
- **Sans Comptalyze** : 3-4h/mois de compta manuelle
- **Avec Comptalyze Premium** : 15 min/mois
- **Économie** : 120h/an = 3 000€ à 25€/h

### Économies Directes
- **Expert-comptable** : 100-150€/mois → 0€ avec Comptalyze
- **Logiciel compta classique** : 30-50€/mois → 7,90€
- **Pénalités URSSAF évitées** : Rappels automatiques
- **Optimisations fiscales** : Peut faire économiser 1 000€+/an

### ROI Premium
- **Investissement** : 94,80€/an
- **Valeur apportée** : 3 000€/an minimum
- **Ratio** : ×32
- **Rentabilité** : Dès le 1er mois

## 🎓 CAS D'USAGE TYPES

### Cas 1 : E-commerçant Shopify
- **Avant** : 2h/mois à saisir CA manuellement
- **Après** : 0 min (import auto) + email récap
- **Économie** : 24h/an

### Cas 2 : Freelance avec ACRE
- **Avant** : Calculs approximatifs, risque erreur
- **Après** : Calculs précis avec réduction ACRE automatique
- **Économie** : 0€ de régularisation URSSAF

### Cas 3 : Multi-activités (Shopify + Stripe)
- **Avant** : 3-4h/mois à consolider les sources
- **Après** : Sync auto + agrégation intelligente
- **Économie** : 40h/an = 1 000€

## 🚀 ROADMAP (À venir)

### Q1 2025
- Intégration WooCommerce
- Intégration PayPal
- Application mobile (iOS/Android)

### Q2 2025
- Mode multi-entreprises
- Collaboration avec expert-comptable
- API publique

### Q3 2025
- Gestion paie (si salariés)
- Prévisionnel financier IA
- Comparateur banques pro

## ❓ QUESTIONS FRÉQUENTES

**Q : Puis-je changer de plan à tout moment ?**
R : Oui, upgrade/downgrade instantané. Pas d'engagement.

**Q : Mes données sont-elles sécurisées ?**
R : Oui. Chiffrement AES-256, hébergement France, RGPD compliant.

**Q : Comptalyze remplace-t-il mon expert-comptable ?**
R : Pour les micro-entreprises simples, oui. Pour des cas complexes (SAS, SARL), c'est un complément.

**Q : Les calculs URSSAF sont-ils certifiés ?**
R : Oui, conformes à la réglementation URSSAF 2024.

**Q : Puis-je annuler mon abonnement ?**
R : Oui, annulation en 1 clic depuis Mon Compte. Aucun frais.

**Q : L'import Shopify/Stripe est-il en temps réel ?**
R : Non, sync automatique dernier jour du mois. Vous pouvez aussi sync manuellement.

**Q : ComptaBot peut-il remplir mes déclarations URSSAF ?**
R : Non, mais il pré-remplit les montants. Vous validez et envoyez sur autoentrepreneur.urssaf.fr.

**Q : Y a-t-il une limite de CA sur Comptalyze ?**
R : Non. Utilisable jusqu'aux plafonds légaux micro-entreprise (77 700€ ou 188 700€).

## 🎯 POSITIONNEMENT

Comptalyze n'est PAS :
- ❌ Un logiciel de compta classique (trop complexe)
- ❌ Un ERP (trop lourd)
- ❌ Une banque pro (on se concentre sur la compta)

Comptalyze EST :
- ✅ La solution la plus simple pour auto-entrepreneurs
- ✅ Automatisée au maximum (gain de temps)
- ✅ Intelligente (IA personnalisée)
- ✅ Abordable (7,90€/mois pour Premium)

**Cible** : Auto-entrepreneurs qui veulent se concentrer sur leur business, pas sur la paperasse.

---

**Dernière mise à jour** : Novembre 2024
**Version** : 2.0 (avec intégrations Shopify/Stripe)
`;

export function getComptalyzeContext(): string {
  return COMPTALYZE_FEATURES;
}

