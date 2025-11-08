# 📖 COMPTALYZE - RUNBOOK OPÉRATIONNEL

Guide opérationnel pour la gestion quotidienne et les incidents de Comptalyze.

**Dernière mise à jour**: 2025-01-08  
**Version**: 1.0.0

---

## TABLE DES MATIÈRES

1. [Démarrage rapide](#démarrage-rapide)
2. [Onboarding nouvel utilisateur](#onboarding-nouvel-utilisateur)
3. [Gestion des incidents](#gestion-des-incidents)
4. [Opérations courantes](#opérations-courantes)
5. [Monitoring & Alertes](#monitoring--alertes)
6. [Procédures d'urgence](#procédures-durgence)
7. [Contacts & Escalation](#contacts--escalation)

---

## DÉMARRAGE RAPIDE

### Accès essentiels

| Service | URL | Accès |
|---------|-----|-------|
| **App (Prod)** | https://comptalyze.com | Public |
| **Vercel Dashboard** | https://vercel.com/dashboard | Admin |
| **Supabase Dashboard** | https://supabase.com/dashboard | Admin |
| **Stripe Dashboard** | https://dashboard.stripe.com | Admin |
| **Resend Dashboard** | https://resend.com/emails | Admin |
| **Health Check** | https://comptalyze.com/api/health | Public |
| **Status Page** | https://comptalyze.com/status | Public |

### Commandes de base

```bash
# Déploiement
git push origin main  # Auto-deploy via Vercel

# Logs production
vercel logs  # Derniers logs

# Health check
curl https://comptalyze.com/api/health | jq

# Vérifier Stripe sync
npm run seed:stripe

# Seed DB dev
npm run seed:db
npm run seed:db:clean  # Nettoyer
```

---

## ONBOARDING NOUVEL UTILISATEUR

### Parcours normal (automatique)

1. **Inscription** → `/signup`
   - Formulaire email/password
   - reCAPTCHA validé
   - Email de vérification envoyé (Supabase)

2. **Vérification email**
   - Click lien → email confirmé
   - Redirection `/dashboard`

3. **Onboarding checklist**
   - Visible sur dashboard
   - Étapes: profil, première simulation, découverte features

4. **Période découverte (Free)**
   - 3 simulations gratuites/mois
   - Accès limité aux features

5. **Upgrade (optionnel)**
   - Checkout Stripe → Pro ou Premium
   - Webhook activate plan → accès features

### Intervention manuelle (si nécessaire)

#### Activer manuellement Premium pour un utilisateur test

```bash
# 1. Trouver le user ID
# Via Supabase Dashboard > Auth > Users

# 2. Exécuter SQL
-- Supabase Dashboard > SQL Editor
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{is_premium}',
  'true'::jsonb
)
WHERE email = 'test@example.com';

UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data,
  '{subscription_plan}',
  '"premium"'::jsonb
)
WHERE email = 'test@example.com';
```

#### Réinitialiser quota Free (3/3)

```bash
# Via Supabase Dashboard > SQL Editor
DELETE FROM urssaf_records
WHERE user_id = '<user_id>'
AND created_at >= date_trunc('month', CURRENT_DATE);
```

#### Débloquer un utilisateur

Si un utilisateur est bloqué (ex: rate-limit), pas de mécanisme automatique pour l'instant. Le middleware rate-limit est en mémoire donc redémarrage de l'app suffit (ou attendre 60s).

---

## GESTION DES INCIDENTS

### Matrice de sévérité

| Sévérité | Description | SLA Réponse | SLA Résolution |
|----------|-------------|-------------|----------------|
| **P0 - Critique** | Site down, paiements bloqués | 15 min | 1h |
| **P1 - Haute** | Feature majeure cassée | 1h | 4h |
| **P2 - Moyenne** | Feature mineure cassée | 4h | 24h |
| **P3 - Basse** | Bug mineur, cosmétique | 24h | 1 semaine |

### Checklist premier réflexe (P0/P1)

1. ✅ **Vérifier status** → https://comptalyze.com/api/health
2. ✅ **Vérifier Vercel** → Dashboard > Deployment logs
3. ✅ **Vérifier Supabase** → Dashboard > Database health
4. ✅ **Vérifier Stripe** → Dashboard > Webhooks > Logs
5. ✅ **Communiquer** → Update status page + email clients (si P0)

### Incidents courants

#### 🚨 Site inaccessible (P0)

**Symptômes**: 502/504 errors, timeout

**Diagnostic**:
```bash
# 1. Health check
curl https://comptalyze.com/api/health

# 2. Vercel status
vercel logs --prod

# 3. Vérifier Vercel deployment
# Dashboard > Deployments > Voir dernier deploy
```

**Actions**:
1. Si dernier deploy cassé → Rollback: Vercel Dashboard > Deployments > [...] > Redeploy
2. Si DB down → Vérifier Supabase Dashboard
3. Si tout OK mais site down → Contacter Vercel support

---

#### 🚨 Webhooks Stripe échouent (P0)

**Symptômes**: Paiements OK mais utilisateurs n'ont pas accès Premium

**Diagnostic**:
```bash
# Stripe Dashboard > Developers > Webhooks
# Cliquer sur endpoint > Voir événements récents
# Chercher des 4xx/5xx
```

**Actions**:
1. **Vérifier signature webhook**:
   ```bash
   # Vercel Dashboard > Settings > Environment Variables
   # Vérifier STRIPE_WEBHOOK_SECRET = celui de Stripe Dashboard
   ```

2. **Rejouer webhooks échoués**:
   - Stripe Dashboard > Webhooks > Event > [...] > Resend

3. **Fix code si nécessaire**:
   - Logs dans Vercel pour voir l'erreur
   - Fix + deploy
   - Rejouer les events échoués

4. **Activation manuelle (workaround temporaire)**:
   - Voir section "Activer manuellement Premium"

---

#### 🚨 Import CA auto échoue (P1)

**Symptômes**: Job mensuel n'a pas importé le CA

**Diagnostic**:
```bash
# 1. Vérifier logs import
# Supabase Dashboard > Table Editor > import_logs
# Chercher status='error'

# 2. Vérifier CRON a tourné
# Vercel Dashboard > Cron > Logs
```

**Actions**:
1. **Run manuel en dry-run**:
   ```bash
   # Depuis Postman/curl (besoin token admin)
   curl -X POST https://comptalyze.com/api/admin/run-import?dryRun=1 \
     -H "Authorization: Bearer <ADMIN_TOKEN>"
   ```

2. **Si dry-run OK → Run réel**:
   ```bash
   curl -X POST https://comptalyze.com/api/admin/run-import \
     -H "Authorization: Bearer <ADMIN_TOKEN>"
   ```

3. **Si erreur Stripe/Shopify API**:
   - Vérifier tokens d'intégration dans `integration_tokens`
   - Rafraîchir si expirés
   - Re-run import

---

#### 🚨 Emails non reçus (P1)

**Symptômes**: Utilisateurs ne reçoivent pas emails (bienvenue, récap, etc.)

**Diagnostic**:
```bash
# 1. Tester email admin
curl -X POST https://comptalyze.com/api/admin/test-email \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","template":"welcome"}'

# 2. Vérifier Resend Dashboard
# Resend Dashboard > Emails > Voir statut
```

**Actions**:
1. **Si Resend Dashboard montre "bounced"**:
   - Email invalide côté user → demander de changer
   
2. **Si Resend Dashboard montre "delivered" mais pas reçu**:
   - Vérifier spam
   - Vérifier DNS (SPF/DKIM/DMARC): Resend Dashboard > Domains

3. **Si API Resend retourne erreur**:
   - Vérifier RESEND_API_KEY valide
   - Vérifier domaine vérifié

---

#### 🚨 User bloqué après rate-limit (P2)

**Symptômes**: Utilisateur reçoit 429 "Trop de requêtes"

**Diagnostic**:
- Middleware rate-limit en mémoire
- Se reset automatiquement après 60s

**Actions**:
1. **Attendre 60s** (fenêtre rate-limit)
2. **Si abuse** → Investiguer via logs Vercel
3. **Si légitime** → Ajuster limits dans `middleware.ts`

---

## OPÉRATIONS COURANTES

### Déploiement

```bash
# 1. Merger PR sur main
git checkout main
git merge feature/xxx
git push origin main

# 2. Vercel auto-deploy
# Vérifier: Vercel Dashboard > Deployments

# 3. Vérifier health check
curl https://comptalyze.com/api/health | jq
```

### Rollback

```bash
# Via Vercel Dashboard
# Deployments > Sélectionner version précédente > [...] > Redeploy
```

### Rotation des secrets

#### Stripe Webhook Secret

```bash
# 1. Stripe Dashboard > Webhooks > [...] > Signing secret > Roll

# 2. Mettre à jour Vercel
vercel env rm STRIPE_WEBHOOK_SECRET production
vercel env add STRIPE_WEBHOOK_SECRET production
# Coller nouveau secret

# 3. Redeploy
vercel --prod
```

#### CRON_SECRET

```bash
# 1. Générer nouveau secret
uuidgen  # ou openssl rand -hex 32

# 2. Mettre à jour Vercel
vercel env rm CRON_SECRET production
vercel env add CRON_SECRET production

# 3. Mettre à jour CRON config (vercel.json si utilisé)

# 4. Redeploy
vercel --prod
```

### Ajouter un admin

```sql
-- Supabase Dashboard > SQL Editor
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{is_admin}',
  'true'::jsonb
)
WHERE email = 'admin@comptalyze.com';
```

### Supprimer un utilisateur (RGPD)

```bash
# 1. User peut self-delete via /dashboard/compte

# 2. OU via API admin
curl -X POST https://comptalyze.com/api/delete-account \
  -H "Authorization: Bearer <USER_TOKEN>"

# 3. OU manuellement via Supabase Dashboard
# Auth > Users > [...] > Delete User
# ⚠️ Vérifie que RLS supprime aussi les données associées
```

### Exporter données user (RGPD)

```bash
# User peut self-export via /dashboard/compte

# OU via API
curl https://comptalyze.com/api/export-data \
  -H "Authorization: Bearer <USER_TOKEN>"
```

---

## MONITORING & ALERTES

### Métriques clés à surveiller

| Métrique | Outil | Seuil critique |
|----------|-------|----------------|
| **Uptime** | UptimeRobot / Vercel | < 99.5% |
| **Latence P95** | Vercel Analytics | > 500ms |
| **Erreurs 5xx** | Vercel Logs | > 0.5% |
| **Webhooks échoués** | Stripe Dashboard | > 1% |
| **Import CA** | Supabase `import_logs` | Échec job mensuel |
| **Emails bounced** | Resend Dashboard | > 5% |

### Configuration alertes (TODO)

#### Sentry (Error tracking)

```bash
# 1. Créer compte Sentry
# 2. Créer projet Next.js
# 3. Installer
npm install @sentry/nextjs

# 4. Configurer
npx @sentry/wizard@latest -i nextjs

# 5. Ajouter DSN dans Vercel env
SENTRY_DSN=https://xxx@sentry.io/xxx
```

#### Slack Notifications

```javascript
// Webhook Slack pour alertes critiques
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL;

async function alertSlack(message) {
  await fetch(SLACK_WEBHOOK, {
    method: 'POST',
    body: JSON.stringify({ text: message }),
  });
}

// Utiliser dans code critique (webhooks, import CA, etc.)
```

---

## PROCÉDURES D'URGENCE

### 🔥 Fuite de données suspectée (P0)

1. ✅ **Isoler immédiatement**
   - Désactiver API keys compromises
   - Changer tous les secrets
   
2. ✅ **Investiguer**
   - Supabase: Table `access_logs` (si activée)
   - Vercel: Logs d'accès
   
3. ✅ **Communiquer**
   - Email clients affectés (RGPD: 72h max)
   - Informer CNIL si données sensibles
   
4. ✅ **Remediation**
   - Patcher faille
   - Audit sécurité complet
   - Post-mortem

### 🔥 Perte de données (P0)

1. ✅ **Restaurer depuis backup**
   - Supabase: Dashboard > Database > Backups
   - Point-in-time recovery disponible
   
2. ✅ **Vérifier intégrité**
   - Check counts par table
   - Vérifier cohérence données
   
3. ✅ **Communiquer**
   - Transparence clients
   - Timeline de restauration

### 🔥 Compte Vercel/Stripe/Supabase compromis (P0)

1. ✅ **Changer MDP immédiatement**
2. ✅ **Activer 2FA si pas déjà fait**
3. ✅ **Révoquer tous tokens/API keys**
4. ✅ **Regénérer nouveaux + redeploy**
5. ✅ **Audit logs d'accès**

---

## CONTACTS & ESCALATION

### Équipe

| Rôle | Nom | Email | Tel | Disponibilité |
|------|-----|-------|-----|---------------|
| Lead Dev | [Nom] | dev@comptalyze.com | +33... | 24/7 (P0) |
| DevOps | [Nom] | ops@comptalyze.com | +33... | Heures bureau |
| Support | [Nom] | support@comptalyze.com | - | Lun-Ven 9-18h |

### Supports externes

| Service | Support | URL | SLA |
|---------|---------|-----|-----|
| **Vercel** | Pro Support | https://vercel.com/support | < 1h (P0) |
| **Supabase** | Enterprise Support | https://supabase.com/support | < 4h |
| **Stripe** | Email/Chat | https://support.stripe.com | < 24h |
| **Resend** | Email | support@resend.com | < 24h |

### Escalation path

1. **P3 (Basse)** → Support → Dev lead (si >48h)
2. **P2 (Moyenne)** → Dev lead → Escalade si >24h
3. **P1 (Haute)** → Dev lead immédiat → CTO si >4h
4. **P0 (Critique)** → Dev lead + CTO immédiat → CEO si >1h

---

## ANNEXES

### Checklist post-incident

- [ ] Incident résolu et vérifié
- [ ] Root cause identifiée
- [ ] Fix déployé en prod
- [ ] Tests de non-régression ajoutés
- [ ] Documentation mise à jour
- [ ] Post-mortem rédigé (si P0/P1)
- [ ] Communication clients (si impact)
- [ ] Alerting amélioré (si applicable)

### Template post-mortem

```markdown
# Post-Mortem: [Titre incident]

**Date**: YYYY-MM-DD
**Durée**: Xh Xm
**Sévérité**: PX
**Impact**: X utilisateurs affectés

## Résumé
[Description courte]

## Timeline
- HH:MM: Incident détecté
- HH:MM: Équipe mobilisée
- HH:MM: Root cause identifiée
- HH:MM: Fix déployé
- HH:MM: Service restauré

## Root Cause
[Cause racine technique]

## Impact
- Utilisateurs affectés: X
- Revenus perdus: X€
- Durée downtime: Xh

## Resolution
[Actions prises]

## Action Items
- [ ] Court terme (immédiat)
- [ ] Moyen terme (1 semaine)
- [ ] Long terme (1 mois)

## Learnings
[Ce qu'on a appris]
```

---

**Dernière mise à jour**: 2025-01-08  
**Prochaine revue**: Mensuelle  
**Responsable**: Lead Dev

