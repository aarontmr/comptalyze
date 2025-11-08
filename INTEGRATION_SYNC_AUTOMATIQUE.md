# 📧 Synchronisation Automatique Mensuelle + Emails

## ✅ Fonctionnalités Implémentées

### 1. **Cron Mensuel Automatique**

Tous les **derniers jours du mois à 23h**, le système :

1. ✅ Récupère automatiquement le CA du mois écoulé depuis Shopify/Stripe
2. ✅ Calcule le CA total
3. ✅ Enregistre dans `ca_records` (avec source "auto_sync")
4. ✅ Envoie un email récapitulatif à chaque utilisateur

---

## 🗓️ Planning d'Exécution

**Cron quotidien** (`/api/cron/sync-integrations`)
- **Fréquence** : Tous les jours à 2h du matin
- **Action** : Sync les transactions des 30 derniers jours (mise à jour continue)

**Cron mensuel** (`/api/cron/monthly-sync`) ✨ **NOUVEAU**
- **Fréquence** : Dernier jour de chaque mois à 23h
- **Action** : Agrège le CA du mois + Envoie email
- **Sécurité** : Vérifie qu'on est bien le dernier jour avant de s'exécuter

---

## 📊 Flux de Données

```
┌─────────────────────────────────────────────────────────┐
│  Dernier jour du mois (ex: 31 janvier) à 23h00         │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│  Cron /api/cron/monthly-sync se déclenche               │
│  (Vérifie que demain = nouveau mois)                    │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│  Pour chaque utilisateur avec Shopify/Stripe :          │
│                                                           │
│  1. Récupère toutes les transactions de janvier         │
│  2. Calcule le CA total :                                │
│     - Shopify : 3,500 €                                  │
│     - Stripe :  1,200 €                                  │
│     → Total : 4,700 €                                    │
│                                                           │
│  3. Enregistre dans ca_records :                         │
│     {                                                     │
│       user_id: "...",                                    │
│       year: 2025,                                        │
│       month: 1,                                          │
│       amount_eur: 4700,                                  │
│       source: "auto_sync",                               │
│       metadata: {...}                                    │
│     }                                                     │
│                                                           │
│  4. Envoie email à user@example.com                      │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│  📧 Email reçu par l'utilisateur                        │
│                                                           │
│  ✅ Votre CA de janvier 2025 a été importé              │
│                                                           │
│  CA Total : 4,700 €                                      │
│                                                           │
│  Détails :                                               │
│  🛒 Shopify : 3,500 €                                    │
│  💳 Stripe  : 1,200 €                                    │
│                                                           │
│  [Bouton: Voir mon dashboard]                            │
└─────────────────────────────────────────────────────────┘
```

---

## 📧 Système d'Emails

### **Service : Resend** (recommandé)

**Pourquoi Resend ?**
- ✅ API simple et moderne
- ✅ Plan gratuit : 3,000 emails/mois
- ✅ Délivrabilité excellente
- ✅ Dashboard analytics intégré
- ✅ Support domaines personnalisés

**Alternative** : SendGrid, Mailgun, AWS SES

### **Template Email**

L'email envoyé contient :
- ✅ Header avec gradient Comptalyze
- ✅ CA total en grand et stylé
- ✅ Détails par source (Shopify/Stripe)
- ✅ Bouton CTA vers le dashboard
- ✅ Footer avec lien préférences
- ✅ Design responsive mobile

---

## 🚀 Configuration

### **Étape 1 : Créer un compte Resend**

1. Allez sur https://resend.com
2. Créez un compte gratuit
3. Allez dans **API Keys**
4. Créez une clé → Copiez-la

### **Étape 2 : Configurer le domaine (optionnel mais recommandé)**

1. Dans Resend Dashboard → **Domains**
2. Ajoutez votre domaine (`comptalyze.fr`)
3. Ajoutez les DNS records fournis
4. Attendez la validation (~5 min)

**Avantages** :
- Emails envoyés depuis `noreply@comptalyze.fr` (professionnel)
- Meilleure délivrabilité
- Pas de "via resend.dev"

### **Étape 3 : Variables d'Environnement**

Ajoutez dans **Vercel** → **Settings** → **Environment Variables** :

```bash
# Resend API
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxx

# Email expéditeur (doit être un domaine vérifié sur Resend)
EMAIL_FROM=Comptalyze <noreply@comptalyze.fr>

# URL de l'app (pour les liens dans l'email)
NEXT_PUBLIC_APP_URL=https://comptalyze.vercel.app
```

**Puis redéployez** pour que les variables soient prises en compte.

### **Étape 4 : Tester**

**Test manuel du cron** :

```bash
curl -X POST https://votre-domaine.vercel.app/api/cron/monthly-sync \
  -H "Authorization: Bearer VOTRE_CRON_SECRET"
```

**Test en développement local** :

```bash
# Dans votre terminal
npm run dev

# Dans un autre terminal
curl -X POST http://localhost:3000/api/cron/monthly-sync \
  -H "Authorization: Bearer VOTRE_CRON_SECRET"
```

**Résultat attendu** :
- Console : Logs de sync
- Email envoyé (ou simulé si pas de RESEND_API_KEY)
- Nouvelle entrée dans `ca_records`
- Nouvelle entrée dans `sync_logs`

---

## 📊 Base de Données

### **ca_records** (nouvelles entrées)

```sql
SELECT * FROM ca_records 
WHERE source = 'auto_sync' 
ORDER BY created_at DESC;
```

**Exemple** :
```
user_id  | year | month | amount_eur | source     | metadata
---------|------|-------|------------|------------|-------------------
abc123   | 2025 |   1   |   4700.00  | auto_sync  | {"sync_type": "monthly_cron", "details": [...]}
```

### **sync_logs** (historique)

```sql
SELECT * FROM sync_logs 
WHERE provider = 'monthly_sync' 
ORDER BY synced_at DESC;
```

**Exemple** :
```
user_id  | provider      | sync_type | status  | records_synced | metadata
---------|---------------|-----------|---------|----------------|----------
abc123   | monthly_sync  | cron      | success | 2              | {...}
```

---

## 🎨 Email Design

### **Preview**

```
┌───────────────────────────────────────────┐
│  ✅ CA Importé !                          │
│  janvier 2025                              │
│  (Header gradient vert → bleu)            │
├───────────────────────────────────────────┤
│                                            │
│  Bonjour ! 👋                             │
│                                            │
│  Votre CA de janvier 2025 a été importé   │
│  automatiquement.                          │
│                                            │
│  ┌─────────────────────────────────────┐ │
│  │        CA Total                      │ │
│  │        4,700 €                       │ │
│  │  (Gradient vert → bleu)              │ │
│  └─────────────────────────────────────┘ │
│                                            │
│  Détails par source                       │
│  ┌─────────────────────────────────────┐ │
│  │ 🛒 Shopify      │      3,500 €      │ │
│  │ 💳 Stripe       │      1,200 €      │ │
│  └─────────────────────────────────────┘ │
│                                            │
│  [  Voir mon dashboard  ]                 │
│  (Bouton gradient CTA)                    │
│                                            │
│  💡 Astuce : Ces données sont déjà        │
│  pré-remplies dans votre simulateur !     │
│                                            │
├───────────────────────────────────────────┤
│  Comptalyze - La compta simplifiée        │
│  Gérer mes préférences                    │
└───────────────────────────────────────────┘
```

### **Personnalisation**

Le template est dans `lib/email.ts` → fonction `generateEmailHTML()`.

**Modifiable** :
- Couleurs
- Textes
- Layout
- CTA

---

## 🔧 Paramètres Avancés

### **Changer la fréquence du cron**

Éditez `vercel.json` :

```json
{
  "crons": [
    {
      "path": "/api/cron/monthly-sync",
      "schedule": "0 23 28-31 * *"
    }
  ]
}
```

**Format cron** : `minute hour day month day-of-week`

**Exemples** :
- `0 23 28-31 * *` → Dernier jour du mois à 23h
- `0 0 1 * *` → 1er jour du mois à minuit
- `0 12 * * 1` → Tous les lundis à midi

### **Désactiver les emails**

**Option 1** : Ne pas configurer `RESEND_API_KEY`
- Les emails seront simulés (logs console)

**Option 2** : Ajouter une condition dans le code
```typescript
if (process.env.DISABLE_EMAILS === 'true') {
  console.log('Emails désactivés');
  return;
}
```

---

## 🐛 Troubleshooting

### **Les emails ne partent pas**

✅ Vérifiez :
- `RESEND_API_KEY` configurée dans Vercel
- `EMAIL_FROM` correspond à un domaine vérifié sur Resend
- Logs Vercel (Functions → Cron) pour voir les erreurs
- Dashboard Resend → Logs pour voir les tentatives d'envoi

### **Le cron ne se déclenche pas**

✅ Vérifiez :
- `vercel.json` à la racine du projet
- Déploiement Vercel réussi
- Logs dans Vercel → Deployments → Functions → Cron

### **Les données ne s'enregistrent pas**

✅ Vérifiez :
- Tables `ca_records` et `sync_logs` existent
- RLS policies permettent l'insertion
- `CRON_SECRET` correctement configurée
- Logs Supabase pour voir les erreurs SQL

### **Doublon de CA**

Le système vérifie que c'est le **dernier jour du mois** avant de s'exécuter.

Si vous testez manuellement, assurez-vous de ne pas créer de doublons.

---

## 📈 Métriques

### **Suivi des syncs**

```sql
-- Nombre d'utilisateurs avec sync auto
SELECT COUNT(DISTINCT user_id) 
FROM sync_logs 
WHERE provider = 'monthly_sync' 
AND status = 'success';

-- CA moyen importé par mois
SELECT 
  AVG((metadata->>'totalCA')::numeric) as avg_ca,
  COUNT(*) as total_syncs
FROM sync_logs 
WHERE provider = 'monthly_sync' 
AND status = 'success' 
AND synced_at > NOW() - INTERVAL '90 days';

-- Taux de succès
SELECT 
  COUNT(*) FILTER (WHERE status = 'success') * 100.0 / COUNT(*) as success_rate
FROM sync_logs 
WHERE provider = 'monthly_sync';
```

---

## 🎉 Résultat Final

**Avant** :
- ❌ Saisie manuelle du CA chaque mois (10 min)
- ❌ Risque d'oubli ou d'erreur
- ❌ Pas de notification

**Après** :
- ✅ CA importé automatiquement le dernier jour du mois
- ✅ Email de confirmation avec détails
- ✅ Données pré-remplies dans le simulateur
- ✅ **Gain : 10 min/mois + zéro erreur + 100% automatisé**

---

## 📞 Support

**Questions fréquentes** :

**Q : Puis-je changer le jour du sync ?**
R : Oui, éditez `vercel.json` et ajustez le `schedule`.

**Q : Les utilisateurs peuvent-ils désactiver les emails ?**
R : Oui, ajoutez une préférence dans les réglages utilisateur et vérifiez-la avant d'envoyer.

**Q : Que se passe-t-il si Shopify/Stripe est déconnecté ?**
R : Le système skip cet utilisateur et log l'erreur dans `sync_logs`.

**Q : Les données sont-elles recalculées (cotisations, etc.) ?**
R : Non, seul le CA brut est enregistré. Les calculs se font à la demande dans le simulateur.

---

**Développé avec ❤️ pour Comptalyze**

**Automatisation = Gain de Temps + Fiabilité** 🚀

