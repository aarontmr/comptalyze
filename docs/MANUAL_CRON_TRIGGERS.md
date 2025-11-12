# 🔧 Orchestrators Cron et Déclenchement Manuel

Ce guide explique le système d'orchestrators qui regroupe plusieurs tâches cron en seulement 2 crons (limite du plan gratuit Vercel), et comment déclencher manuellement certaines tâches si nécessaire.

## 🎯 Système d'Orchestrators (2 Crons)

Pour contourner la limite de 2 crons du plan gratuit Vercel, nous avons créé 2 orchestrators qui regroupent plusieurs tâches :

### 1. Daily Orchestrator (`/api/cron/daily-orchestrator`)
**Schedule:** Toutes les 6 heures (`0 */6 * * *`)

**Tâches exécutées :**
- ✅ Envoi emails marketing J+3 (tous les jours)
- ✅ Synchronisation des intégrations (Shopify, Stripe) - seulement aux heures 0, 6, 12, 18

### 2. Monthly Orchestrator (`/api/cron/monthly-orchestrator`)
**Schedule:** Tous les jours à 7h UTC (`0 7 * * *`)

**Tâches exécutées selon la date :**
- ✅ Envoi rappels mensuels - **seulement le 2 du mois**
- ✅ Synchronisation mensuelle CA - **seulement le dernier jour du mois**

Chaque orchestrator vérifie automatiquement la date/heure et n'exécute les tâches que si les conditions sont remplies.

---

## 📋 Routes de Déclenchement Manuel

### 1. Vérification des Seuils URSSAF

**Endpoint:** `POST /api/manual/check-thresholds`

**Description:** Vérifie tous les utilisateurs pour détecter les dépassements de seuils de micro-entreprise et envoie des emails d'alerte.

**Usage:**
```bash
curl -X POST "https://comptalyze.com/api/manual/check-thresholds?secret=VOTRE_CRON_SECRET"
```

**Réponse:**
```json
{
  "message": "Vérification terminée : 5 alertes envoyées, 0 erreurs",
  "sent": 5,
  "errors": 0
}
```

---

### 2. Synchronisation Mensuelle

**Endpoint:** `POST /api/manual/monthly-sync`

**Description:** Synchronise le CA du mois écoulé depuis les intégrations (Shopify, Stripe) et envoie les emails récapitulatifs mensuels.

**Usage:**
```bash
# Normal (vérifie que c'est le dernier jour du mois)
curl -X POST "https://comptalyze.com/api/manual/monthly-sync?secret=VOTRE_CRON_SECRET"

# Forcer l'exécution même si ce n'est pas le dernier jour
curl -X POST "https://comptalyze.com/api/manual/monthly-sync?secret=VOTRE_CRON_SECRET&force=true"
```

**Réponse:**
```json
{
  "message": "Sync mensuel terminé",
  "month": "janvier 2025",
  "totalUsers": 12,
  "results": [...]
}
```

---

### 3. Synchronisation des Intégrations

**Endpoint:** `POST /api/manual/sync-integrations`

**Description:** Synchronise toutes les intégrations actives (Shopify, Stripe) pour récupérer les commandes/paiements des 30 derniers jours.

**Usage:**
```bash
curl -X POST "https://comptalyze.com/api/manual/sync-integrations?secret=VOTRE_CRON_SECRET"
```

**Réponse:**
```json
{
  "message": "Synchronisation terminée",
  "totalSynced": 45,
  "results": [...]
}
```

---

## 🔐 Authentification

Toutes les routes nécessitent le paramètre `secret` qui doit correspondre à la variable d'environnement `CRON_SECRET` configurée sur Vercel.

**Option 1: Query Parameter**
```
?secret=VOTRE_CRON_SECRET
```

**Option 2: Authorization Header**
```bash
curl -X POST "https://comptalyze.com/api/manual/check-thresholds" \
  -H "Authorization: Bearer VOTRE_CRON_SECRET"
```

---

## 📅 Quand Utiliser

### Vérification des Seuils (`check-thresholds`)
- **Recommandé:** Une fois par semaine (ex: tous les lundis)
- **Urgence:** Après un gros enregistrement de CA
- **Automatique:** Déjà déclenché après chaque enregistrement de CA dans l'interface

### Synchronisation Mensuelle (`monthly-sync`)
- **Recommandé:** Le dernier jour de chaque mois (ou le 1er du mois suivant)
- **Usage:** Pour générer les récapitulatifs mensuels et synchroniser le CA du mois écoulé

### Synchronisation des Intégrations (`sync-integrations`)
- **Recommandé:** Toutes les 6 heures (ou plusieurs fois par jour)
- **Usage:** Pour maintenir les données à jour depuis Shopify/Stripe

---

## 🛠️ Exemples d'Automatisation

### Via GitHub Actions (gratuit)

Créez `.github/workflows/manual-crons.yml`:

```yaml
name: Manual Cron Triggers

on:
  schedule:
    - cron: '0 10 * * 1'  # Tous les lundis à 10h UTC
  workflow_dispatch:  # Permet de déclencher manuellement

jobs:
  check-thresholds:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger check-thresholds
        run: |
          curl -X POST "https://comptalyze.com/api/manual/check-thresholds?secret=${{ secrets.CRON_SECRET }}"
  
  sync-integrations:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger sync-integrations
        run: |
          curl -X POST "https://comptalyze.com/api/manual/sync-integrations?secret=${{ secrets.CRON_SECRET }}"
```

### Via Vercel Cron (si vous upgradez)

Si vous passez au plan Pro, vous pouvez réactiver les crons dans `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 7 2 * *"
    },
    {
      "path": "/api/cron/daily-tasks",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/manual/check-thresholds",
      "schedule": "0 10 * * 1"
    },
    {
      "path": "/api/manual/sync-integrations",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

---

## ⚠️ Notes Importantes

1. **Sécurité:** Ne partagez jamais votre `CRON_SECRET` publiquement
2. **Rate Limiting:** Les routes peuvent prendre du temps si beaucoup d'utilisateurs
3. **Logs:** Tous les appels sont loggés dans `sync_logs` et les logs Vercel
4. **Erreurs:** En cas d'erreur, vérifiez les logs Vercel pour plus de détails

---

## 🔍 Vérification

Pour tester une route, utilisez `GET` pour voir les instructions:

```bash
curl "https://comptalyze.com/api/manual/check-thresholds"
```

Cela retournera les instructions d'utilisation.

