# 📧 Guide des Emails Automatiques Comptalyze

Ce guide explique les trois systèmes d'emails automatiques implémentés dans Comptalyze.

## ✅ Fonctionnalités Implémentées

### 1. 📄 Envoi Automatique des Factures

**Description** : Lorsqu'un client crée une facture, un email est automatiquement envoyé avec le PDF de la facture en pièce jointe.

**Fonctionnement** :
- Après la création d'une facture dans `/factures/nouvelle`, l'email est envoyé automatiquement
- L'email est envoyé à l'adresse du client (si renseignée) ou à l'email de l'utilisateur
- Le PDF de la facture est généré et attaché à l'email

**Fichiers modifiés** :
- `app/factures/nouvelle/page.tsx` : Envoi automatique après création
- `app/api/invoices/[id]/email/route.ts` : Route API existante pour l'envoi d'emails

**Configuration requise** :
- Variable d'environnement `RESEND_API_KEY` configurée
- Variable d'environnement `COMPANY_FROM_EMAIL` configurée

---

### 2. 📅 Rappels Mensuels (Le 2 du Mois)

**Description** : Un email de rappel est envoyé automatiquement le 2 de chaque mois pour rappeler aux utilisateurs Premium d'enregistrer leur chiffre d'affaires du mois précédent.

**Fonctionnement** :
- Le cron job s'exécute automatiquement le 2 de chaque mois
- Seuls les utilisateurs Premium avec `monthly_reminder = true` dans `email_preferences` reçoivent l'email
- L'email rappelle d'enregistrer le CA du mois précédent

**Fichier** : `app/api/cron/send-reminders/route.ts`

**Configuration requise** :
- Variable d'environnement `CRON_SECRET` pour sécuriser l'endpoint
- Configuration d'un cron job (Vercel Cron ou équivalent) qui appelle :
  ```
  GET /api/cron/send-reminders?secret=VOTRE_CRON_SECRET
  ```
  Le 2 de chaque mois à 9h00 (heure de Paris)

**Exemple de configuration Vercel Cron** (`vercel.json`) :
```json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 9 2 * *"
    }
  ]
}
```

⚠️ **Note** : Le cron job doit inclure le secret dans l'URL ou dans les headers.

---

### 3. ⚠️ Alertes de Dépassement de Seuils

**Description** : Un email d'alerte est envoyé automatiquement lorsqu'un utilisateur dépasse les seuils autorisés pour le statut de micro-entreprise.

**Seuils** :
- **Services/Activités libérales** : 77 700 €
- **Ventes** : 188 700 €

**Fonctionnement** :
- La vérification se fait automatiquement après chaque enregistrement de CA
- Si le CA cumulé de l'année dépasse un seuil, un email d'alerte est envoyé
- L'email informe l'utilisateur qu'il doit basculer vers le régime réel simplifié ou normal

**Fichiers** :
- `app/api/cron/check-thresholds/route.ts` : Route API pour vérifier les seuils
- `app/components/UrssafCalculator.tsx` : Appel automatique après enregistrement

**Modes d'utilisation** :

1. **Automatique (après enregistrement)** :
   - Appelé automatiquement après chaque enregistrement de CA
   - Vérifie seulement l'utilisateur connecté

2. **Cron job (vérification globale)** :
   - Peut être configuré pour vérifier tous les utilisateurs périodiquement
   - Exemple : une fois par semaine
   - Appel : `POST /api/cron/check-thresholds?secret=VOTRE_CRON_SECRET`

**Exemple de configuration Vercel Cron** :
```json
{
  "crons": [
    {
      "path": "/api/cron/check-thresholds?secret=VOTRE_CRON_SECRET",
      "schedule": "0 10 * * 1"
    }
  ]
}
```
(Ceci exécuterait la vérification tous les lundis à 10h)

---

## 🔧 Configuration des Variables d'Environnement

Assurez-vous d'avoir configuré ces variables dans `.env.local` (local) et dans Vercel (production) :

```env
# Resend (Email)
RESEND_API_KEY=re_votre_cle_api
COMPANY_FROM_EMAIL="Comptalyze <onboarding@resend.dev>"

# Cron Security
CRON_SECRET=votre_secret_aleatoire_securise

# Base URL (pour les liens dans les emails)
NEXT_PUBLIC_BASE_URL=https://comptalyze.com
```

---

## 📝 Notes Importantes

1. **Envoi automatique des factures** :
   - Si l'email ne peut pas être envoyé (problème de configuration Resend, etc.), la facture est quand même créée
   - L'utilisateur peut toujours envoyer l'email manuellement depuis la page de détail de la facture

2. **Rappels mensuels** :
   - Actuellement réservés aux utilisateurs Premium
   - Les utilisateurs peuvent activer/désactiver les rappels via leurs préférences (table `email_preferences`)

3. **Alertes de seuils** :
   - Les alertes sont envoyées immédiatement après détection
   - Un utilisateur peut recevoir plusieurs alertes si plusieurs seuils sont dépassés
   - Les alertes sont informatives et ne remplacent pas l'avis d'un expert-comptable

---

## 🧪 Test des Fonctionnalités

### Tester l'envoi automatique de facture :
1. Créez une facture dans `/factures/nouvelle`
2. Vérifiez que l'email est reçu automatiquement

### Tester les rappels mensuels :
1. Configurez un utilisateur Premium avec `monthly_reminder = true`
2. Appelez manuellement : `GET /api/cron/send-reminders?secret=VOTRE_SECRET`
3. Vérifiez que l'email est reçu

### Tester les alertes de seuils :
1. Enregistrez un CA qui dépasse les seuils
2. Vérifiez que l'email d'alerte est reçu
3. Ou appelez manuellement : `POST /api/cron/check-thresholds` avec votre token d'authentification

---

## 🚀 Prochaines Étapes

- [ ] Configurer les cron jobs dans Vercel
- [ ] Tester tous les emails en production
- [ ] Ajouter des préférences utilisateur pour activer/désactiver les alertes de seuils
- [ ] Améliorer les templates d'emails avec un design plus professionnel


















