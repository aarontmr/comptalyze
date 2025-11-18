"use client";

import { useState } from "react";
import { Search, HelpCircle, BookOpen, MessageCircle, X, ChevronRight } from "lucide-react";
import Breadcrumbs from "@/app/components/Breadcrumbs";

interface HelpArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  fullContent: string;
}

const helpArticles: HelpArticle[] = [
  {
    id: "getting-started",
    title: "Premiers pas avec Comptalyze",
    category: "Démarrage",
    content: "Découvrez comment utiliser Comptalyze pour gérer votre comptabilité de micro-entrepreneur.",
    fullContent: `# Premiers pas avec Comptalyze

Bienvenue sur Comptalyze ! Ce guide vous accompagne dans vos premiers pas pour gérer efficacement votre comptabilité de micro-entrepreneur.

## 🎯 Configuration initiale

### 1. Créer votre compte
- Rendez-vous sur la page d'inscription
- Utilisez votre email professionnel
- Choisissez un mot de passe sécurisé
- Validez votre email via le lien reçu

### 2. Compléter votre profil
- Indiquez votre activité principale (ventes, services BIC, ou libéral BNC)
- Précisez votre régime fiscal (Versement Libératoire, Barème, ou Pas encore soumis)
- Si vous êtes éligible, activez l'ACRE (Aide à la Création ou Reprise d'Entreprise)

### 3. Première simulation URSSAF
- Accédez au simulateur depuis votre dashboard
- Saisissez votre chiffre d'affaires du mois
- Le système calcule automatiquement vos cotisations
- Enregistrez votre simulation pour suivre votre évolution

## 📊 Comprendre votre dashboard

Votre tableau de bord affiche :
- **CA du mois** : Votre chiffre d'affaires en cours
- **Cotisations estimées** : Montant des cotisations sociales calculées
- **Revenu net** : Ce qui vous reste après cotisations
- **Graphiques d'évolution** : Visualisez votre progression

## 💡 Conseils pour bien démarrer

1. **Enregistrez régulièrement votre CA** : Plus vous saisissez vos données, plus les projections sont précises
2. **Utilisez le calendrier fiscal** : Ne manquez aucune échéance de déclaration
3. **Explorez les fonctionnalités** : Chaque module a été conçu pour vous faire gagner du temps
4. **Consultez l'aide** : Notre centre d'aide répond à toutes vos questions

## 🆘 Besoin d'aide ?

Si vous rencontrez des difficultés :
- Consultez les autres articles de ce centre d'aide
- Utilisez le chatbot ComptaBot (disponible en Premium)
- Contactez notre support : support@comptalyze.fr`
  },
  {
    id: "calcul-urssaf",
    title: "Comment calculer mes cotisations URSSAF",
    category: "Calculs",
    content: "Apprenez à utiliser le simulateur URSSAF pour calculer vos cotisations.",
    fullContent: `# Comment calculer mes cotisations URSSAF

Le simulateur URSSAF de Comptalyze calcule automatiquement vos cotisations sociales en fonction de votre activité et de votre chiffre d'affaires.

## 📐 Taux de cotisations par activité

### Ventes de marchandises (BIC - Vente)
- **Taux** : 12,3% de votre CA
- **Plafond** : 188 700€ par an
- **Exemple** : 5 000€ de CA = 615€ de cotisations

### Prestations de services (BIC - Service)
- **Taux** : 21,2% de votre CA
- **Plafond** : 77 700€ par an
- **Exemple** : 3 000€ de CA = 636€ de cotisations

### Activités libérales (BNC - Libéral)
- **Taux** : 21,1% de votre CA
- **Plafond** : 77 700€ par an
- **Exemple** : 4 000€ de CA = 844€ de cotisations

## 🔧 Utiliser le simulateur

### Étape 1 : Accéder au simulateur
- Depuis votre dashboard, cliquez sur "Simulateur URSSAF"
- Ou utilisez le raccourci dans le menu latéral

### Étape 2 : Saisir votre CA
- Entrez votre chiffre d'affaires du mois
- Sélectionnez votre activité si vous avez plusieurs activités
- Le calcul se fait automatiquement en temps réel

### Étape 3 : Consulter les résultats
Le simulateur affiche :
- **Cotisations sociales** : Montant total à payer
- **Revenu net** : Ce qui vous reste après cotisations
- **Détail par cotisation** : Retraite, maladie, famille, formation
- **Projection annuelle** : Estimation sur l'année complète

## 🎯 Cas particuliers

### ACRE (Aide à la Création ou Reprise d'Entreprise)
Si vous êtes éligible à l'ACRE :
- **Année 1** : Réduction de 50% des cotisations
- **Année 2** : Réduction de 25% des cotisations
- **Année 3** : Réduction de 12,5% des cotisations

Activez l'ACRE dans vos paramètres pour que le calcul soit automatique.

### Versement Libératoire de l'impôt
Si vous avez choisi le Versement Libératoire :
- L'impôt sur le revenu est prélevé en même temps que les cotisations
- Le taux varie selon votre activité (1% à 2,2%)
- Le calcul est inclus dans le simulateur

### Franchise de TVA
- **Services** : Seuil à 36 800€ de CA
- **Ventes** : Seuil à 91 900€ de CA
- En dessous de ces seuils, vous êtes exonéré de TVA

## ⚠️ Points d'attention

1. **Déclaration mensuelle** : Vous devez déclarer votre CA chaque mois, même si c'est 0€
2. **Paiement** : Les cotisations sont prélevées automatiquement par l'URSSAF
3. **Régularisation** : En cas d'erreur, vous pouvez corriger jusqu'à 3 ans en arrière
4. **Plafonds** : Si vous dépassez les plafonds, vous basculez automatiquement au régime réel

## 💡 Astuces

- **Sauvegardez vos simulations** : Elles vous permettent de suivre l'évolution de votre activité
- **Utilisez les projections** : Anticipez vos cotisations pour mieux gérer votre trésorerie
- **Comparez les mois** : Visualisez vos graphiques pour identifier les tendances

## 🆘 Problèmes fréquents

**Q : Mon calcul ne correspond pas à celui de l'URSSAF**
R : Vérifiez que votre activité est correctement renseignée et que l'ACRE est activée si vous y êtes éligible.

**Q : Puis-je simuler plusieurs activités ?**
R : Oui, créez une simulation par activité et additionnez les résultats.

**Q : Les cotisations incluent-elles l'impôt ?**
R : Seulement si vous avez choisi le Versement Libératoire. Sinon, l'impôt se déclare séparément.`
  },
  {
    id: "factures",
    title: "Créer et gérer mes factures",
    category: "Factures",
    content: "Guide complet pour créer, modifier et envoyer vos factures.",
    fullContent: `# Créer et gérer mes factures

Comptalyze vous permet de créer des factures professionnelles conformes à la réglementation française.

## 📄 Créer une facture

### Étape 1 : Accéder au module Factures
- Depuis votre dashboard, cliquez sur "Factures" dans le menu
- Cliquez sur "Nouvelle facture"

### Étape 2 : Renseigner les informations
**Informations obligatoires :**
- Numéro de facture (généré automatiquement)
- Date d'émission
- Client : Nom, adresse, SIRET si professionnel
- Désignation des produits/services
- Prix unitaire et quantité
- Total HT et TTC

**Mentions légales automatiques :**
- "TVA non applicable, art. 293 B du CGI" (si franchise de TVA)
- Votre nom, adresse, SIRET
- Conditions de paiement

### Étape 3 : Personnaliser (optionnel)
- Ajoutez votre logo
- Personnalisez les couleurs
- Ajoutez des conditions particulières
- Incluez un message personnalisé

### Étape 4 : Générer et envoyer
- Cliquez sur "Générer le PDF"
- Téléchargez la facture
- Envoyez-la directement par email depuis Comptalyze

## 📋 Quand facturer ?

### Obligation de facturation
Vous **devez** émettre une facture pour :
- ✅ Toute vente à un professionnel (B2B)
- ✅ Toute vente > 25€ à un particulier (B2C)
- ✅ Sur demande du client (même < 25€)

### Pas de facture nécessaire
- ❌ Vente < 25€ à un particulier (sauf demande)
- ❌ Prestation de service < 25€ à un particulier (sauf demande)

## 🔢 Numérotation des factures

### Règles à respecter
- **Numérotation unique** : Chaque facture doit avoir un numéro unique
- **Numérotation chronologique** : Les numéros doivent suivre l'ordre chronologique
- **Pas de trou** : Ne sautez pas de numéros
- **Format libre** : Vous choisissez votre format (FAC-2025-001, 2025-001, etc.)

Comptalyze génère automatiquement la numérotation pour éviter les erreurs.

## 💰 TVA sur les factures

### Franchise de TVA
Si vous êtes en franchise de TVA (CA < seuils) :
- Mention obligatoire : "TVA non applicable, art. 293 B du CGI"
- Prix TTC = Prix HT (pas de TVA à ajouter)

### Assujetti à la TVA
Si vous dépassez les seuils :
- Vous devez facturer la TVA (20% généralement)
- Mention : "TVA 20%" sur la facture
- Déclaration TVA trimestrielle obligatoire

## 📤 Envoyer une facture

### Par email
1. Depuis la liste des factures, cliquez sur "Envoyer"
2. Entrez l'email du client
3. Personnalisez le message si besoin
4. Cliquez sur "Envoyer"

### Téléchargement
1. Cliquez sur "Télécharger PDF"
2. La facture se télécharge automatiquement
3. Vous pouvez l'envoyer manuellement

## ✏️ Modifier une facture

### Avant envoi
- Vous pouvez modifier tous les champs
- Le numéro reste inchangé

### Après envoi
- Créez un avoir (facture de crédit) pour annuler
- Créez une nouvelle facture corrigée
- Ne modifiez jamais une facture déjà envoyée

## 📊 Gérer vos factures

### Liste des factures
- Visualisez toutes vos factures
- Filtrez par période, client, statut
- Recherchez une facture par numéro

### Statuts
- **Brouillon** : Facture non finalisée
- **Envoyée** : Facture transmise au client
- **Payée** : Facture réglée
- **Impayée** : Facture en retard de paiement

### Relances (Premium)
- Relances automatiques pour les factures impayées
- Emails personnalisés
- Suivi des paiements

## 🆘 Problèmes fréquents

**Q : Puis-je modifier une facture déjà envoyée ?**
R : Non, créez un avoir pour annuler et une nouvelle facture corrigée.

**Q : Dois-je facturer la TVA ?**
R : Seulement si vous dépassez les seuils de franchise (36 800€ services, 91 900€ ventes).

**Q : Que faire si j'ai oublié un numéro ?**
R : Créez une facture avec le numéro manquant en date antérieure, ou contactez le support.

**Q : Puis-je personnaliser le design ?**
R : Oui, ajoutez votre logo et personnalisez les couleurs dans les paramètres.`
  },
  {
    id: "calendrier",
    title: "Utiliser le calendrier fiscal",
    category: "Calendrier",
    content: "Suivez toutes vos échéances fiscales et ajoutez vos propres événements.",
    fullContent: `# Utiliser le calendrier fiscal

Le calendrier fiscal de Comptalyze vous rappelle toutes vos échéances importantes pour ne jamais oublier une déclaration.

## 📅 Échéances automatiques

### Déclarations URSSAF mensuelles
- **Fréquence** : Tous les mois
- **Date limite** : Le dernier jour du mois suivant
- **Exemple** : CA de janvier à déclarer avant le 28 février
- **Rappels** : J-7, J-3, J-1 (Premium)

### Déclaration de revenus annuelle
- **Date** : Mai de chaque année
- **Déclaration** : Sur impots.gouv.fr
- **Rappel** : Début mai (Premium)

### CFE (Cotisation Foncière des Entreprises)
- **Date** : 15 décembre
- **Paiement** : Automatique si vous avez un compte pro
- **Rappel** : Début décembre (Premium)

### TVA trimestrielle (si assujetti)
- **Fréquence** : Tous les 3 mois
- **Dates** : Fin janvier, avril, juillet, octobre
- **Déclaration** : Sur impots.gouv.fr

## 🔔 Rappels automatiques (Premium)

### Emails de rappel
Vous recevez automatiquement :
- **J-7** : Rappel 7 jours avant l'échéance
- **J-3** : Rappel 3 jours avant l'échéance
- **J-1** : Rappel la veille de l'échéance

### Personnalisation
- Activez/désactivez les rappels dans les paramètres
- Choisissez l'heure de réception
- Ajoutez d'autres emails (expert-comptable, etc.)

## ➕ Ajouter des événements personnels

### Événements personnalisés
1. Cliquez sur "Ajouter un événement"
2. Renseignez :
   - Titre de l'événement
   - Date et heure
   - Description (optionnel)
   - Rappel (optionnel)
3. Sauvegardez

### Types d'événements
- Rendez-vous avec expert-comptable
- Échéances de paiement clients
- Renouvellement d'assurance
- Réunions fiscales
- Tout événement important

## 📊 Visualiser le calendrier

### Vue mensuelle
- Consultez les échéances du mois
- Voyez d'un coup d'œil ce qui est à venir
- Identifiez les périodes chargées

### Vue annuelle
- Vue d'ensemble de l'année
- Planifiez vos déclarations
- Anticipez les périodes de forte activité

### Statuts des échéances
- 🟢 **Terminé** : Déclaration effectuée
- 🔵 **À venir** : Plus de 7 jours
- 🟡 **Bientôt** : Moins de 7 jours
- 🔴 **En retard** : Date dépassée

## 🔗 Synchronisation (Premium)

### Google Calendar
- Synchronisez vos échéances avec Google Calendar
- Consultez-les depuis votre téléphone
- Recevez les notifications sur tous vos appareils

### Outlook
- Intégration avec Outlook
- Synchronisation bidirectionnelle
- Compatible avec tous les clients email

## ✅ Marquer comme terminé

### Après une déclaration
1. Cliquez sur l'échéance
2. Cliquez sur "Marquer comme terminé"
3. L'échéance passe en statut "Terminé"
4. Vous pouvez ajouter une note (date de déclaration, montant, etc.)

## 🆘 Problèmes fréquents

**Q : Je n'ai pas reçu de rappel**
R : Vérifiez vos paramètres de notification et votre adresse email. Les rappels sont disponibles en Premium.

**Q : Puis-je modifier une échéance ?**
R : Les échéances URSSAF sont fixes, mais vous pouvez ajouter des événements personnalisés.

**Q : Comment synchroniser avec mon calendrier ?**
R : Utilisez la fonctionnalité de synchronisation disponible en Premium dans les paramètres.

**Q : Que faire si j'ai oublié une déclaration ?**
R : Déclarez au plus vite sur autoentrepreneur.urssaf.fr. Des pénalités peuvent s'appliquer après 30 jours.`
  },
  {
    id: "export",
    title: "Exporter mes données",
    category: "Export",
    content: "Exportez vos données comptables en différents formats.",
    fullContent: `# Exporter mes données

Comptalyze vous permet d'exporter toutes vos données comptables dans différents formats pour vos archives ou votre expert-comptable.

## 📥 Formats d'export disponibles

### Excel (.xlsx)
- **Idéal pour** : Analyses, tableaux croisés dynamiques
- **Contenu** : Toutes vos données avec formules et graphiques
- **Utilisation** : Compatible avec Excel, Google Sheets, LibreOffice

### CSV (.csv)
- **Idéal pour** : Import dans d'autres logiciels comptables
- **Contenu** : Données brutes séparées par virgules
- **Utilisation** : Universellement compatible

### PDF (.pdf)
- **Idéal pour** : Archivage, justificatifs, partage
- **Contenu** : Documents formatés et imprimables
- **Utilisation** : Lecture sur tous les appareils

## 📊 Données exportées

### Simulations URSSAF
- Toutes vos simulations enregistrées
- Dates, montants, cotisations calculées
- Historique complet

### Factures
- Liste de toutes vos factures
- Numéros, dates, clients, montants
- Statuts (envoyée, payée, impayée)

### Chiffre d'affaires
- CA mensuel et annuel
- Par activité si plusieurs activités
- Graphiques d'évolution

### Cotisations
- Détail des cotisations par mois
- Répartition (retraite, maladie, famille, formation)
- Total annuel

### Charges déductibles (si enregistrées)
- Liste de toutes vos charges
- Catégories, montants, dates
- Justificatifs associés

## 🔧 Comment exporter

### Étape 1 : Accéder à l'export
- Depuis votre dashboard, cliquez sur "Export"
- Ou allez dans le menu "Export comptable"

### Étape 2 : Choisir la période
- **Mois** : Export du mois sélectionné
- **Trimestre** : Export des 3 derniers mois
- **Année** : Export de l'année complète

### Étape 3 : Sélectionner le format
- Choisissez Excel, CSV ou PDF
- Selon votre besoin

### Étape 4 : Télécharger
- Cliquez sur "Télécharger"
- Le fichier se télécharge automatiquement
- Sauvegardez-le dans un endroit sûr

## 📋 Export FEC (Fichier des Écritures Comptables)

### Pour votre expert-comptable
Le FEC est un fichier standardisé requis par l'administration fiscale.

**Format** : Fichier texte délimité
**Contenu** :
- Toutes vos écritures comptables
- Journal, compte, date, libellé, débit, crédit
- Format conforme aux exigences fiscales

### Génération du FEC
1. Allez dans "Export"
2. Sélectionnez "FEC"
3. Choisissez la période
4. Téléchargez le fichier
5. Transmettez-le à votre expert-comptable

## 💾 Archivage

### Recommandations
- **Export mensuel** : Exportez vos données chaque mois
- **Sauvegarde** : Conservez les exports dans un cloud sécurisé
- **Durée** : Gardez vos exports 10 ans (obligation légale)
- **Format** : Préférez PDF pour l'archivage long terme

### Organisation
- Nommez vos fichiers : "Export_Comptalyze_2025_01.xlsx"
- Créez un dossier par année
- Archivez régulièrement

## 🔒 Sécurité des données

### Confidentialité
- Vos exports sont générés uniquement pour vous
- Aucune donnée n'est partagée sans votre autorisation
- Les fichiers sont chiffrés lors du téléchargement

### Partage avec expert-comptable
- Partagez uniquement les données nécessaires
- Utilisez un canal sécurisé (email chiffré, plateforme sécurisée)
- Vérifiez les droits d'accès

## 🆘 Problèmes fréquents

**Q : Mon export est vide**
R : Vérifiez que vous avez bien des données dans la période sélectionnée.

**Q : Le format Excel ne s'ouvre pas**
R : Vérifiez que vous avez Excel ou un équivalent installé. Essayez Google Sheets en ligne.

**Q : Puis-je exporter toutes mes données d'un coup ?**
R : Oui, sélectionnez "Année" pour exporter l'année complète.

**Q : Le FEC est-il conforme ?**
R : Oui, le format FEC généré est conforme aux exigences de l'administration fiscale.

**Q : Mes données sont-elles supprimées après export ?**
R : Non, l'export ne supprime aucune donnée. C'est une copie de vos données.`
  },
  {
    id: "import-shopify-stripe",
    title: "Importer automatiquement depuis Shopify/Stripe",
    category: "Intégrations",
    content: "Connectez vos comptes Shopify et Stripe pour importer automatiquement votre CA.",
    fullContent: `# Importer automatiquement depuis Shopify/Stripe

L'import automatique Shopify/Stripe (Premium) synchronise votre chiffre d'affaires sans saisie manuelle.

## 🔗 Connexion Shopify

### Étape 1 : Accéder aux intégrations
- Allez dans "Mon Compte" > "Intégrations"
- Cliquez sur "Connecter Shopify"

### Étape 2 : Autoriser l'accès
- Vous êtes redirigé vers Shopify
- Connectez-vous à votre compte Shopify
- Autorisez Comptalyze à accéder à vos données
- Vous êtes redirigé vers Comptalyze

### Étape 3 : Vérifier la connexion
- La connexion apparaît comme "Active"
- Vous pouvez voir la date de dernière synchronisation
- Le prochain import se fera automatiquement

## 💳 Connexion Stripe

### Étape 1 : Accéder aux intégrations
- Allez dans "Mon Compte" > "Intégrations"
- Cliquez sur "Connecter Stripe"

### Étape 2 : Autoriser l'accès
- Vous êtes redirigé vers Stripe
- Connectez-vous à votre compte Stripe
- Autorisez Comptalyze à accéder à vos données
- Vous êtes redirigé vers Comptalyze

### Étape 3 : Vérifier la connexion
- La connexion apparaît comme "Active"
- Vous pouvez voir la date de dernière synchronisation

## ⏰ Synchronisation automatique

### Quand ça se passe
- **Date** : Dernier jour du mois à 23h
- **Fréquence** : Une fois par mois
- **Période** : CA du mois précédent

### Ce qui est importé
- **Shopify** : Toutes les commandes payées du mois
- **Stripe** : Toutes les transactions réussies du mois
- **Agrégation** : Les montants sont additionnés automatiquement
- **Enregistrement** : Le CA total est enregistré dans Comptalyze

### Email de confirmation
- Vous recevez un email récapitulatif
- Détail par source (Shopify, Stripe)
- CA total importé
- Lien vers votre dashboard

## 🔄 Synchronisation manuelle

### Forcer une synchronisation
1. Allez dans "Intégrations"
2. Cliquez sur "Synchroniser maintenant"
3. Attendez quelques secondes
4. Le CA est importé immédiatement

### Quand synchroniser manuellement
- Après une grosse journée de ventes
- Pour vérifier que tout fonctionne
- Si vous attendez l'import automatique

## 🔒 Sécurité

### Protection des données
- **OAuth sécurisé** : Connexion via protocole OAuth 2.0
- **Tokens chiffrés** : Vos tokens d'accès sont chiffrés (AES-256)
- **Accès limité** : Comptalyze accède uniquement aux données nécessaires
- **Pas de stockage de mots de passe** : Seuls les tokens sont stockés

### Révoquer l'accès
- Vous pouvez révoquer l'accès à tout moment
- Allez dans "Intégrations" > "Déconnecter"
- L'accès est immédiatement révoqué

## 📊 Pré-remplissage URSSAF

### Automatique après import
- Votre CA importé est automatiquement pré-rempli dans le simulateur URSSAF
- Plus besoin de saisir manuellement
- Gain de temps garanti

### Utilisation
1. Après l'import, allez dans "Simulateur URSSAF"
2. Le CA du mois est déjà renseigné
3. Vérifiez le montant
4. Calculez vos cotisations en 1 clic

## 🆘 Problèmes fréquents

**Q : L'import ne fonctionne pas**
R : Vérifiez que la connexion est active dans "Intégrations". Essayez une synchronisation manuelle.

**Q : Le CA importé est incorrect**
R : Vérifiez dans Shopify/Stripe que les transactions sont bien comptabilisées. Contactez le support si besoin.

**Q : Puis-je connecter plusieurs comptes Shopify ?**
R : Actuellement, un seul compte Shopify par utilisateur. Contactez le support pour plusieurs comptes.

**Q : Les données sont-elles en temps réel ?**
R : Non, la synchronisation se fait une fois par mois (dernier jour du mois). Vous pouvez forcer une sync manuelle.

**Q : Que faire si je change de compte Shopify/Stripe ?**
R : Déconnectez l'ancien compte et connectez le nouveau dans "Intégrations".

**Q : L'import inclut-il les remboursements ?**
R : Non, seuls les paiements réussis sont importés. Les remboursements doivent être déduits manuellement si besoin.`
  },
  {
    id: "charges-deductibles",
    title: "Gérer mes charges déductibles",
    category: "Charges",
    content: "Enregistrez et suivez vos dépenses professionnelles.",
    fullContent: `# Gérer mes charges déductibles

⚠️ **Important** : En micro-entreprise, vous ne pouvez **pas déduire** vos charges réelles. Vous bénéficiez d'un **abattement forfaitaire** à la place.

## 📋 Comprendre l'abattement forfaitaire

### Taux d'abattement par activité
- **Ventes de marchandises** : 71% d'abattement
- **Prestations de services BIC** : 50% d'abattement
- **Activités libérales BNC** : 34% d'abattement

### Exemple
Si vous avez 10 000€ de CA en services :
- Abattement : 5 000€ (50%)
- Base imposable : 5 000€
- Cotisations calculées sur 5 000€

## 💡 Pourquoi enregistrer vos charges alors ?

### Utilité du module Charges
Même si vous ne déduisez pas vos charges en micro-entreprise, enregistrer vos dépenses vous permet de :
1. **Suivre vos dépenses** : Connaître vos coûts réels
2. **Préparer un changement de statut** : Si vous passez au régime réel
3. **Analyser votre rentabilité** : CA - Charges = Marge réelle
4. **Justifier auprès de l'administration** : En cas de contrôle

## ➕ Enregistrer une charge

### Étape 1 : Accéder au module
- Allez dans "Charges déductibles"
- Cliquez sur "Ajouter une charge"

### Étape 2 : Renseigner les informations
- **Description** : Nature de la dépense
- **Montant** : Montant TTC
- **Date** : Date de la dépense
- **Catégorie** : Matériel, Logiciel, Transport, etc.
- **Justificatif** : Uploadez la facture/reçu (optionnel)

### Étape 3 : Sauvegarder
- Cliquez sur "Enregistrer"
- La charge apparaît dans votre liste

## 📊 Catégories de charges

### Catégories disponibles
- **Matériel** : Ordinateur, téléphone, équipement
- **Logiciel** : Abonnements SaaS, licences
- **Transport** : Essence, péages, transports en commun
- **Formation** : Cours, formations professionnelles
- **Communication** : Téléphone, internet
- **Frais de bureau** : Fournitures, location bureau
- **Publicité** : Campagnes pub, référencement
- **Assurance** : Assurance pro, responsabilité civile
- **Autres** : Autres dépenses professionnelles

## 📈 Suivi de vos charges

### Tableau de bord
- Total des charges par mois
- Répartition par catégorie
- Graphiques d'évolution
- Comparaison avec votre CA

### Export
- Exportez vos charges en Excel/CSV
- Transmettez à votre expert-comptable
- Archivez pour vos déclarations

## 🔄 Passage au régime réel

### Si vous dépassez les plafonds
Quand vous passez au régime réel (dépassement des plafonds micro-entreprise) :
- Vos charges enregistrées dans Comptalyze sont prêtes
- Vous pouvez les déduire réellement
- Transition facilitée

## 🆘 Problèmes fréquents

**Q : Puis-je déduire mes charges en micro-entreprise ?**
R : Non, vous bénéficiez d'un abattement forfaitaire à la place. Les charges ne sont pas déductibles.

**Q : Pourquoi enregistrer mes charges alors ?**
R : Pour suivre vos dépenses, analyser votre rentabilité, et préparer un éventuel passage au régime réel.

**Q : Dois-je justifier mes charges ?**
R : Même si non déductibles, gardez vos justificatifs au cas où (contrôles, passage au régime réel).

**Q : Les charges incluent-elles la TVA ?**
R : Enregistrez le montant TTC. Si vous passez au régime réel, la TVA sera récupérable.

**Q : Puis-je modifier une charge enregistrée ?**
R : Oui, cliquez sur la charge et modifiez les informations.`
  },
  {
    id: "tva",
    title: "Comprendre la TVA en micro-entreprise",
    category: "TVA",
    content: "Tout savoir sur la franchise de TVA et les seuils à respecter.",
    fullContent: `# Comprendre la TVA en micro-entreprise

En micro-entreprise, vous bénéficiez généralement de la **franchise de TVA** : vous ne facturez pas la TVA à vos clients.

## 🎯 Franchise de TVA

### Principe
- Vous **ne facturez pas** la TVA à vos clients
- Vous **ne récupérez pas** la TVA sur vos achats
- Vos prix sont TTC (qui = HT car pas de TVA)

### Seuils de franchise
- **Services** : 36 800€ de CA par an
- **Ventes de marchandises** : 91 900€ de CA par an
- **Activités mixtes** : Le seuil le plus élevé s'applique

### Exemple
Si vous faites 30 000€ de CA en services :
- ✅ Vous êtes en franchise de TVA
- ✅ Vous ne facturez pas la TVA
- ✅ Mention sur facture : "TVA non applicable, art. 293 B du CGI"

## ⚠️ Dépassement des seuils

### Conséquences
Si vous dépassez les seuils :
- ❌ Vous perdez la franchise de TVA
- ✅ Vous devez facturer la TVA (20% généralement)
- ✅ Vous pouvez récupérer la TVA sur vos achats
- ✅ Déclaration TVA trimestrielle obligatoire

### Calcul du seuil
Le seuil est calculé sur :
- **Année N-1** : Votre CA de l'année précédente
- **Année N** : Si vous dépassez en cours d'année

### Exemple de dépassement
Si vous faites 40 000€ de CA en services :
- ❌ Vous dépassez le seuil (36 800€)
- ✅ Vous devez facturer la TVA à partir du 1er janvier suivant
- ✅ Déclaration TVA obligatoire

## 📊 Simulateur TVA (Pro/Premium)

### Utilisation
1. Allez dans "Simulateur TVA"
2. Entrez votre CA prévisionnel
3. Le système calcule :
   - Si vous restez en franchise
   - Si vous dépassez le seuil
   - Montant de TVA à facturer si dépassement

### Alertes (Premium)
- Alerte automatique si vous approchez du seuil
- Calcul de la distance au seuil
- Recommandations personnalisées

## 💰 Taux de TVA

### Taux normal
- **20%** : La plupart des biens et services
- S'applique par défaut

### Taux réduits
- **10%** : Restauration, transports, travaux
- **5,5%** : Produits alimentaires, livres
- **2,1%** : Médicaments remboursables

## 📋 Facturation avec TVA

### Si vous êtes assujetti
Sur vos factures, vous devez indiquer :
- Prix HT
- Taux de TVA (20%, 10%, etc.)
- Montant de la TVA
- Prix TTC

### Exemple de facture
- Produit : 100€ HT
- TVA 20% : 20€
- **Total TTC : 120€**

## 📅 Déclaration TVA

### Fréquence
- **Trimestrielle** : Tous les 3 mois
- **Dates** : Fin janvier, avril, juillet, octobre
- **Déclaration** : Sur impots.gouv.fr

### Contenu
- TVA collectée (facturée à vos clients)
- TVA déductible (sur vos achats)
- TVA à payer (différence)

## 🆘 Problèmes fréquents

**Q : Dois-je facturer la TVA ?**
R : Seulement si vous dépassez les seuils (36 800€ services, 91 900€ ventes).

**Q : Que faire si je dépasse le seuil ?**
R : Vous devez facturer la TVA à partir du 1er janvier suivant et déclarer la TVA trimestriellement.

**Q : Puis-je récupérer la TVA sur mes achats en franchise ?**
R : Non, en franchise de TVA, vous ne récupérez pas la TVA sur vos achats.

**Q : Le simulateur TVA est-il fiable ?**
R : Oui, il calcule selon les seuils officiels. Consultez un expert-comptable pour des cas complexes.

**Q : Puis-je opter pour la TVA volontairement ?**
R : Oui, vous pouvez opter pour la TVA même en dessous des seuils. Contactez les impôts pour plus d'infos.`
  },
  {
    id: "abonnement",
    title: "Gérer mon abonnement",
    category: "Compte",
    content: "Changer de plan, annuler, modifier votre abonnement.",
    fullContent: `# Gérer mon abonnement

Gérez facilement votre abonnement Comptalyze depuis votre compte.

## 📦 Plans disponibles

### Plan Gratuit
- **Prix** : 0€/mois
- **Limite** : 5 simulations par mois
- **Fonctionnalités** : Simulateur URSSAF basique, dashboard simple

### Plan Pro
- **Prix** : 3,90€/mois (offre de lancement, au lieu de 9,90€)
- **Fonctionnalités** : Simulations illimitées, factures, exports, TVA, charges

### Plan Premium
- **Prix** : 7,90€/mois (offre de lancement, au lieu de 17,90€)
- **Fonctionnalités** : Tout Pro + Import Shopify/Stripe, ComptaBot IA, calendrier fiscal, pré-remplissage URSSAF

## 🔄 Changer de plan

### Upgrade (passer à un plan supérieur)
1. Allez dans "Mon Compte" > "Abonnement"
2. Cliquez sur "Passer à Pro" ou "Passer à Premium"
3. Vous êtes redirigé vers le paiement
4. L'upgrade est immédiat après paiement

### Downgrade (passer à un plan inférieur)
1. Allez dans "Mon Compte" > "Abonnement"
2. Cliquez sur "Changer de plan"
3. Sélectionnez le plan souhaité
4. Le changement prend effet à la fin de la période payée

## ❌ Annuler mon abonnement

### Annulation
1. Allez dans "Mon Compte" > "Abonnement"
2. Cliquez sur "Annuler mon abonnement"
3. Confirmez l'annulation
4. Votre abonnement reste actif jusqu'à la fin de la période payée
5. Vous repassez automatiquement en Gratuit

### Remboursement
- Aucun remboursement pour la période en cours
- Vous gardez l'accès jusqu'à la fin de la période payée
- Pas de frais d'annulation

## 💳 Modifier le moyen de paiement

### Changer de carte
1. Allez dans "Mon Compte" > "Paiement"
2. Cliquez sur "Modifier la carte"
3. Entrez les nouvelles informations
4. Sauvegardez

### Ajouter une carte
- Suivez les mêmes étapes
- La nouvelle carte devient le moyen de paiement par défaut

## 📧 Factures et reçus

### Télécharger une facture
1. Allez dans "Mon Compte" > "Factures"
2. Cliquez sur la facture souhaitée
3. Téléchargez le PDF

### Reçus automatiques
- Vous recevez un email avec le reçu après chaque paiement
- Conservez ces reçus pour vos déclarations

## 🆘 Problèmes fréquents

**Q : Puis-je annuler à tout moment ?**
R : Oui, annulation possible à tout moment sans frais.

**Q : Que se passe-t-il si je n'ai plus accès à ma carte ?**
R : Mettez à jour votre moyen de paiement dans "Mon Compte" > "Paiement".

**Q : Puis-je repasser en Gratuit après avoir payé ?**
R : Oui, annulez votre abonnement. Vous repassez en Gratuit à la fin de la période payée.

**Q : Les prix vont-ils augmenter ?**
R : Les prix de lancement sont garantis pour les premiers clients. Vous serez prévenu en cas de changement.

**Q : Puis-je suspendre mon abonnement temporairement ?**
R : Non, mais vous pouvez annuler et vous réabonner plus tard sans frais.

**Q : Que se passe-t-il si le paiement échoue ?**
R : Vous recevez un email de rappel. Si le paiement échoue 3 fois, votre abonnement est suspendu.`
  },
  {
    id: "problemes-techniques",
    title: "Résoudre les problèmes techniques",
    category: "Support",
    content: "Solutions aux problèmes techniques les plus courants.",
    fullContent: `# Résoudre les problèmes techniques

Solutions aux problèmes techniques les plus fréquents sur Comptalyze.

## 🔐 Problèmes de connexion

### Je ne peux pas me connecter
**Solutions :**
1. Vérifiez votre email et mot de passe
2. Utilisez "Mot de passe oublié" si besoin
3. Vérifiez que votre compte email est vérifié
4. Essayez un autre navigateur
5. Videz le cache de votre navigateur

### Mot de passe oublié
1. Cliquez sur "Mot de passe oublié"
2. Entrez votre email
3. Cliquez sur le lien dans l'email reçu
4. Créez un nouveau mot de passe

## 🌐 Problèmes d'affichage

### La page ne charge pas
**Solutions :**
1. Vérifiez votre connexion internet
2. Rechargez la page (F5 ou Cmd+R)
3. Essayez un autre navigateur
4. Videz le cache et les cookies
5. Désactivez les extensions de navigateur

### Les données ne s'affichent pas
**Solutions :**
1. Attendez quelques secondes (chargement en cours)
2. Rechargez la page
3. Vérifiez que vous êtes bien connecté
4. Contactez le support si le problème persiste

## 📱 Problèmes sur mobile

### L'application ne fonctionne pas bien
**Solutions :**
1. Utilisez un navigateur récent (Chrome, Safari)
2. Mettez à jour votre navigateur
3. Videz le cache de votre navigateur
4. Essayez en mode bureau si disponible

### Les boutons ne répondent pas
**Solutions :**
1. Attendez que la page soit complètement chargée
2. Essayez de cliquer à nouveau
3. Rechargez la page
4. Vérifiez que JavaScript est activé

## 💾 Problèmes d'export

### L'export ne fonctionne pas
**Solutions :**
1. Vérifiez que vous avez des données à exporter
2. Essayez un autre format (Excel, CSV, PDF)
3. Vérifiez votre espace disque
4. Essayez avec un autre navigateur

### Le fichier exporté est vide
**Solutions :**
1. Vérifiez que vous avez sélectionné la bonne période
2. Vérifiez que vous avez des données dans cette période
3. Essayez d'exporter une autre période
4. Contactez le support

## 🔗 Problèmes d'intégrations

### Shopify/Stripe ne se connecte pas
**Solutions :**
1. Vérifiez que vous êtes connecté à Shopify/Stripe
2. Autorisez bien l'accès à Comptalyze
3. Vérifiez que vous avez un compte Premium
4. Réessayez la connexion
5. Contactez le support si le problème persiste

### La synchronisation ne fonctionne pas
**Solutions :**
1. Vérifiez que la connexion est active
2. Essayez une synchronisation manuelle
3. Attendez le prochain import automatique (fin du mois)
4. Contactez le support

## 🆘 Contacter le support

### Quand contacter le support
- Problème technique non résolu
- Bug ou erreur dans l'application
- Question sur une fonctionnalité
- Problème de paiement

### Comment contacter
- **Email** : support@comptalyze.fr
- **Réponse** : Sous 24h en moyenne
- **Chatbot** : Utilisez ComptaBot (Premium) pour des réponses instantanées

### Informations à fournir
- Votre email de compte
- Description du problème
- Captures d'écran si possible
- Navigateur et système d'exploitation

## 🔧 Maintenance programmée

### Indisponibilités prévues
- Nous effectuons des maintenances la nuit (2h-4h)
- Vous êtes prévenu par email si une maintenance est prévue
- Durée moyenne : 15-30 minutes

### En cas de panne
- Nous travaillons à résoudre le problème au plus vite
- Suivez notre statut : comptalyze.com/status
- Vous serez informé dès que le problème est résolu`
  }
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  const categories = Array.from(new Set(helpArticles.map((a) => a.category)));

  const filteredArticles = helpArticles.filter((article) => {
    const matchesSearch =
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <Breadcrumbs items={[{ label: "Aperçu", href: "/dashboard" }, { label: "Centre d'aide" }]} />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Centre d'aide</h1>
        <p className="text-gray-400">Trouvez des réponses à vos questions</p>
      </div>

      {/* Barre de recherche */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: "#6b7280" }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher dans l'aide..."
            className="w-full pl-12 pr-4 py-3 rounded-lg text-white"
            style={{ backgroundColor: "#14161b", border: "1px solid #1f232b" }}
          />
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            !selectedCategory
              ? "text-white"
              : "text-gray-400 hover:text-white"
          }`}
          style={{
            backgroundColor: !selectedCategory ? "#00D08420" : "#0e0f12",
            border: `1px solid ${!selectedCategory ? "#00D084" : "#2d3441"}`,
          }}
        >
          Toutes les catégories
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === category
                ? "text-white"
                : "text-gray-400 hover:text-white"
            }`}
            style={{
              backgroundColor: selectedCategory === category ? "#00D08420" : "#0e0f12",
              border: `1px solid ${selectedCategory === category ? "#00D084" : "#2d3441"}`,
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Liste des articles */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredArticles.length === 0 ? (
          <div
            className="col-span-2 rounded-2xl p-12 text-center"
            style={{
              backgroundColor: "#14161b",
              border: "1px solid #1f232b",
            }}
          >
            <HelpCircle className="w-16 h-16 mx-auto mb-4" style={{ color: "#6b7280" }} />
            <p className="text-gray-400">Aucun article trouvé</p>
          </div>
        ) : (
          filteredArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className="rounded-xl p-6 border cursor-pointer transition-all hover:scale-[1.02]"
              style={{
                backgroundColor: "#14161b",
                borderColor: "#1f232b",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="p-3 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: "#00D08420" }}
                >
                  <BookOpen className="w-6 h-6" style={{ color: "#00D084" }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "#2d3441", color: "#9ca3af" }}>
                      {article.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{article.title}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2">{article.content}</p>
                  <div className="mt-3 flex items-center gap-1 text-xs" style={{ color: "#00D084" }}>
                    <span>Lire la suite</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Contact support */}
      <div
        className="mt-8 rounded-2xl p-6 border"
        style={{
          backgroundColor: "#14161b",
          borderColor: "#1f232b",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="p-3 rounded-lg"
            style={{ backgroundColor: "#2E6CF620" }}
          >
            <MessageCircle className="w-6 h-6" style={{ color: "#2E6CF6" }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Besoin d'aide supplémentaire ?</h3>
            <p className="text-sm text-gray-400">
              Contactez notre équipe support pour une assistance personnalisée :{" "}
              <a href="mailto:support@comptalyze.fr" className="text-[#00D084] hover:underline">
                support@comptalyze.fr
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Modal pour afficher le contenu complet */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden"
            style={{
              backgroundColor: "#14161b",
              border: "1px solid #1f232b",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="sticky top-0 z-10 flex items-center justify-between p-6 border-b"
              style={{ borderColor: "#1f232b", backgroundColor: "#14161b" }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "#2d3441", color: "#9ca3af" }}>
                    {selectedArticle.category}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white">{selectedArticle.title}</h2>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="ml-4 p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              <div
                className="prose prose-invert max-w-none"
                style={{
                  color: "#d1d5db",
                }}
              >
                {(() => {
                  const lines = selectedArticle.fullContent.split("\n");
                  const elements: React.ReactElement[] = [];
                  let inList = false;
                  let listItems: string[] = [];

                  const flushList = () => {
                    if (listItems.length > 0) {
                      elements.push(
                        <ul key={`list-${elements.length}`} className="list-disc list-inside mb-4 ml-4 space-y-1">
                          {listItems.map((item, idx) => {
                            const cleanItem = item.replace(/^[-•]\s*/, "");
                            const parts = cleanItem.split(/(\*\*.*?\*\*)/g);
                            return (
                              <li key={idx} style={{ color: "#d1d5db" }}>
                                {parts.map((part, partIdx) => {
                                  if (part.startsWith("**") && part.endsWith("**")) {
                                    return <strong key={partIdx} className="text-white">{part.replace(/\*\*/g, "")}</strong>;
                                  }
                                  return <span key={partIdx}>{part}</span>;
                                })}
                              </li>
                            );
                          })}
                        </ul>
                      );
                      listItems = [];
                    }
                    inList = false;
                  };

                  lines.forEach((line, index) => {
                    const trimmed = line.trim();
                    
                    if (trimmed.startsWith("# ")) {
                      flushList();
                      elements.push(
                        <h1 key={index} className="text-2xl font-bold text-white mt-6 mb-4">
                          {trimmed.substring(2)}
                        </h1>
                      );
                    } else if (trimmed.startsWith("## ")) {
                      flushList();
                      elements.push(
                        <h2 key={index} className="text-xl font-bold text-white mt-6 mb-3">
                          {trimmed.substring(3)}
                        </h2>
                      );
                    } else if (trimmed.startsWith("### ")) {
                      flushList();
                      elements.push(
                        <h3 key={index} className="text-lg font-semibold text-white mt-4 mb-2">
                          {trimmed.substring(4)}
                        </h3>
                      );
                    } else if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
                      inList = true;
                      listItems.push(trimmed);
                    } else if (trimmed === "") {
                      flushList();
                      elements.push(<br key={index} />);
                    } else if (trimmed.includes("**Q :")) {
                      flushList();
                      const question = trimmed.replace(/\*\*/g, "").replace("Q :", "").trim();
                      elements.push(
                        <p key={index} className="font-semibold text-white mt-4 mb-1">
                          Q : {question}
                        </p>
                      );
                    } else if (trimmed.includes("**R :") || trimmed.startsWith("R :")) {
                      flushList();
                      const answer = trimmed.replace(/\*\*/g, "").replace("R :", "").trim();
                      elements.push(
                        <p key={index} className="mb-4" style={{ color: "#9ca3af" }}>
                          R : {answer}
                        </p>
                      );
                    } else {
                      flushList();
                      // Traitement du texte avec gras
                      const processed = trimmed
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>');
                      elements.push(
                        <p
                          key={index}
                          className="mb-3"
                          style={{ color: "#d1d5db" }}
                          dangerouslySetInnerHTML={{ __html: processed }}
                        />
                      );
                    }
                  });
                  
                  flushList();
                  return elements;
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}







