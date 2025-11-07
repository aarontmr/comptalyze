# 📧 Guide : Email Marketing Automatisé J+3

## 🎯 Vue d'ensemble

Cette automatisation envoie un **email marketing** 3 jours après l'inscription aux utilisateurs **gratuits** pour les encourager à upgrader avec un code promo **-5%** (`LAUNCH5`).

---

## ✅ CE QUI A ÉTÉ CRÉÉ

### **1. Cron Job automatique** 
- **Fichier** : `app/api/cron/send-upgrade-emails/route.ts`
- **Exécution** : Tous les jours à **10h du matin**
- **Cible** : Utilisateurs gratuits inscrits il y a exactement 3 jours

### **2. Migration SQL**
- **Fichier** : `supabase_migration_marketing_emails.sql`
- **Table** : `marketing_emails` pour tracker les envois et éviter doublons

### **3. Configuration Vercel**
- **Fichier** : `vercel.json` mis à jour
- **Cron** : Ajouté à la liste des tâches automatiques

### **4. Checkout Stripe activé pour codes promo**
- **Fichier** : `app/api/checkout/route.ts`
- **Option** : `allow_promotion_codes: true` ajoutée

---

## 🚀 CONFIGURATION ÉTAPE PAR ÉTAPE

### **ÉTAPE 1 : Créer la table dans Supabase**

1. Connectez-vous à https://supabase.com
2. Sélectionnez votre projet **Comptalyze**
3. Allez dans **SQL Editor**
4. Cliquez sur **New Query**
5. **Copiez-collez** le contenu de `supabase_migration_marketing_emails.sql`
6. Cliquez sur **Run** (ou `Ctrl + Enter`)

**Vérification** :
```sql
-- Vérifier que la table existe
SELECT * FROM marketing_emails LIMIT 1;
```

✅ Fait : [ ]

---

### **ÉTAPE 2 : Créer le code promo sur Stripe** ⭐ IMPORTANT

#### **A. Créer un Coupon**

1. Connectez-vous à https://dashboard.stripe.com
2. Allez dans **Products** > **Coupons**
3. Cliquez sur **Create coupon**
4. Remplissez :
   - **Name** : `Offre de Lancement -5%`
   - **ID** : `LAUNCH5` ⚠️ Exactement ce code !
   - **Type** : **Percentage**
   - **Percent off** : `5`
   - **Duration** : 
     - **Forever** (recommandé) → Réduction permanente
     - **Once** → Première facture uniquement
     - **Repeating** → X premiers mois
   - **Redemption limits** : Laissez vide ou mettez 200
5. Cliquez sur **Create coupon**

✅ Fait : [ ]

---

#### **B. Créer un Promotion Code**

1. Dans **Coupons**, cliquez sur `LAUNCH5`
2. Cliquez sur **Create promotion code**
3. Remplissez :
   - **Code** : `LAUNCH5`
   - **Active** : ✅ Yes
   - **Expires** : 
     - Laissez vide pour permanent
     - Ou 31/01/2025 pour limiter l'offre
   - **Limit to first-time customers** : ✅ (optionnel)
   - **Max redemptions** : Laissez vide ou 200
4. Cliquez sur **Create**

✅ Fait : [ ]

---

### **ÉTAPE 3 : Vérifier les variables d'environnement**

Sur **Vercel** et **Local** (.env.local), vérifiez :

```env
RESEND_API_KEY=re_votre_cle
COMPANY_FROM_EMAIL="Comptalyze <no-reply@comptalyze.com>"
CRON_SECRET=votre_secret_cron
NEXT_PUBLIC_BASE_URL=https://comptalyze.com
```

✅ Fait : [ ]

---

### **ÉTAPE 4 : Déployer**

```bash
git add .
git commit -m "Add: Email marketing automatisé J+3 avec code promo LAUNCH5"
git push origin main
```

Le déploiement Vercel se fera automatiquement.

✅ Fait : [ ]

---

## 📅 PLANIFICATION DES CRONS

Après déploiement, vous aurez **3 crons automatiques** :

| Cron | Horaire | Fréquence | Action |
|------|---------|-----------|--------|
| **send-upgrade-emails** | 10h | Quotidien | Email marketing J+3 avec code -5% |
| **send-reminders** | 00h | Le 2 du mois | Rappels URSSAF (Premium) |
| **check-trials** | 02h | Quotidien | Vérification essais expirés |

---

## 📧 CONTENU DE L'EMAIL

L'email envoyé contient :

### **1. Header professionnel**
- Gradient Comptalyze (vert → bleu)
- Logo et baseline

### **2. Badge Code Promo**
```
🎁 Offre Exclusive
-5% supplémentaire avec le code
┌──────────┐
│ LAUNCH5  │
└──────────┘
Valable jusqu'au 31 janvier 2025
```

### **3. Bénéfices Plan Pro**
- ✓ Simulations illimitées
- ✓ Factures PDF professionnelles
- ✓ Gestion TVA automatique
- ✓ Exports comptables

### **4. Bénéfices Plan Premium**
- 🤖 Assistant IA ComptaBot
- 📅 Calendrier fiscal intelligent
- 🔔 Rappels automatiques URSSAF
- 📊 Analytics avancés

### **5. Témoignage**
Citation de Sophie M. (graphiste, Lyon) avec avatar

### **6. Stats de confiance**
- 847+ utilisateurs
- 4.9/5 note moyenne
- 2547h économisées

### **7. Section "Pourquoi upgrader"**
- ⏱️ Gagnez 2h30 par mois
- 💰 Économisez jusqu'à 380€/trimestre
- ✅ 0 erreur, 0 stress

### **8. Prix avec promo calculé**
```
Plan Pro : 3,90€ → 3,71€/mois avec LAUNCH5
Plan Premium : 7,90€ → 7,51€/mois avec LAUNCH5
```

### **9. CTA principal**
Bouton gradient vers `/pricing`

### **10. Rappel du code**
Box jaune avec rappel du code LAUNCH5

---

## 🧪 TESTER L'AUTOMATISATION

### **Test 1 : Déclencher manuellement le cron**

Une fois déployé sur Vercel :

```bash
curl -X GET "https://comptalyze.com/api/cron/send-upgrade-emails" \
  -H "Authorization: Bearer VOTRE_CRON_SECRET"
```

**Résultat attendu** :
```json
{
  "success": true,
  "sentCount": 2,
  "errorCount": 0,
  "targetUsersCount": 2
}
```

✅ Testé : [ ]

---

### **Test 2 : Créer un compte de test et simuler J+3**

#### **A. Créer le compte**
1. Allez sur https://comptalyze.com/signup
2. Créez un compte test : `test-marketing@votreemail.com`

#### **B. Modifier la date dans Supabase**
1. Supabase > **SQL Editor**
2. Exécutez :
```sql
-- Faire comme si le compte a été créé il y a 3 jours
UPDATE auth.users 
SET created_at = NOW() - INTERVAL '3 days'
WHERE email = 'test-marketing@votreemail.com';
```

#### **C. Déclencher le cron**
```bash
curl -X GET "https://comptalyze.com/api/cron/send-upgrade-emails" \
  -H "Authorization: Bearer VOTRE_CRON_SECRET"
```

#### **D. Vérifier**
- Boîte email : Vous devriez avoir reçu l'email
- Supabase : 
```sql
SELECT * FROM marketing_emails 
WHERE email_type = 'upgrade_day3' 
ORDER BY sent_at DESC;
```

✅ Testé : [ ]

---

### **Test 3 : Tester le code promo LAUNCH5**

1. Allez sur https://comptalyze.com/pricing
2. Cliquez sur **Passer à Pro**
3. Sur la page Stripe Checkout :
   - Cherchez le champ **"Add promotion code"**
   - Entrez `LAUNCH5`
   - Le prix devrait baisser de 5%
4. **NE CONFIRMEZ PAS** (à moins de vouloir vraiment payer)

**Résultat attendu** :
```
Pro : 3,90€/mois → 3,71€/mois avec LAUNCH5 ✅
Premium : 7,90€/mois → 7,51€/mois avec LAUNCH5 ✅
```

✅ Testé : [ ]

---

## 📊 SUIVI ET ANALYTICS

### **Voir les emails envoyés**

```sql
-- Combien d'emails upgrade envoyés ?
SELECT COUNT(*) as total_sent
FROM marketing_emails
WHERE email_type = 'upgrade_day3';

-- Derniers emails envoyés
SELECT u.email, me.sent_at
FROM marketing_emails me
JOIN auth.users u ON u.id = me.user_id
WHERE me.email_type = 'upgrade_day3'
ORDER BY me.sent_at DESC
LIMIT 10;
```

### **Taux de conversion**

Pour mesurer l'efficacité, comparez :
```sql
-- Utilisateurs qui ont reçu l'email
SELECT COUNT(*) FROM marketing_emails WHERE email_type = 'upgrade_day3';

-- Utilisateurs qui ont upgradé dans les 7 jours suivants
SELECT COUNT(*)
FROM marketing_emails me
JOIN auth.users u ON u.id = me.user_id
WHERE me.email_type = 'upgrade_day3'
AND (u.user_metadata->>'is_pro' = 'true' OR u.user_metadata->>'is_premium' = 'true')
AND u.updated_at BETWEEN me.sent_at AND me.sent_at + INTERVAL '7 days';
```

---

## 💡 OPTIMISATIONS FUTURES

### **A. Séquence d'emails**

Créez d'autres automatisations :
- **J+1** : Email de bienvenue avec tutoriel
- **J+3** : Email upgrade avec code -5% ✅ (fait)
- **J+7** : Email avec cas d'usage et témoignages
- **J+14** : Dernier rappel avec offre limitée

### **B. Segmentation**

Adaptez le contenu selon :
- Type d'activité (services vs ventes)
- Nombre de simulations effectuées
- Fonctionnalités utilisées

### **C. A/B Testing**

Testez différentes versions :
- Sujet d'email
- Code promo (-5% vs -10%)
- Timing (J+3 vs J+5)

---

## ⚠️ BONNES PRATIQUES

### **✅ À FAIRE**
- Personnaliser avec le prénom
- Inclure des témoignages réels
- Proposer de l'aide (support@)
- Faciliter le désabonnement
- Envoyer à une heure optimale (10h)

### **❌ À ÉVITER**
- Envoyer trop d'emails (max 1/semaine)
- Être trop agressif dans le ton
- Oublier le lien de désinscription
- Envoyer aux utilisateurs déjà payants

---

## 🎯 TAUX DE CONVERSION ATTENDU

Avec cette automatisation bien configurée :

| Métrique | Objectif |
|----------|----------|
| Taux d'ouverture | 40-50% |
| Taux de clic | 15-25% |
| Taux de conversion | 3-8% |

**Exemple** : Si 100 utilisateurs reçoivent l'email → **3-8 conversions** attendues 🎯

---

## 🆘 TROUBLESHOOTING

### ❌ **Emails ne partent pas**

**Solutions** :
1. Vérifiez `RESEND_API_KEY` sur Vercel
2. Vérifiez `COMPANY_FROM_EMAIL` 
3. Consultez les logs Vercel
4. Vérifiez les logs Resend

### ❌ **Emails vont en spam**

**Solutions** :
1. Vérifiez SPF/DKIM dans Resend
2. Testez avec mail-tester.com
3. Ajoutez un lien de désinscription visible

### ❌ **Code LAUNCH5 ne fonctionne pas**

**Solutions** :
1. Vérifiez que le coupon existe sur Stripe
2. Vérifiez que le promotion code est actif
3. Vérifiez `allow_promotion_codes: true` dans checkout
4. Redéployez l'application

### ❌ **Doublons d'emails**

**Solutions** :
1. Vérifiez que la table `marketing_emails` existe
2. L'index unique empêche les doublons normalement
3. Si nécessaire, nettoyez :
```sql
DELETE FROM marketing_emails 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM marketing_emails 
  GROUP BY user_id, email_type
);
```

---

## 📈 MONITORING

### **Dashboard Resend**

Vérifiez quotidiennement :
- Taux de délivrabilité
- Taux d'ouverture
- Bounces / Plaintes spam

### **Logs Vercel**

```bash
vercel logs --filter=/api/cron/send-upgrade-emails
```

---

## 🎉 RÉSULTAT FINAL

Avec cette automatisation, vous allez :

1. ✅ **Engager** les utilisateurs gratuits après 3 jours
2. ✅ **Convertir** 3-8% en clients payants
3. ✅ **Récompenser** avec -5% supplémentaire
4. ✅ **Tracker** tous les envois (pas de doublon)
5. ✅ **Optimiser** avec les stats Resend

**ROI attendu** : Si 100 utilisateurs gratuits/mois → **5-10 conversions Pro** à 3,71€ = **20-40€ MRR** additionnel ! 💰

---

## 📚 RESSOURCES

- Documentation Stripe Coupons : https://stripe.com/docs/billing/subscriptions/coupons
- Documentation Resend : https://resend.com/docs
- Vercel Crons : https://vercel.com/docs/cron-jobs

---

## ✅ CHECKLIST FINALE

Avant de considérer l'automatisation active :

- [ ] Table `marketing_emails` créée dans Supabase
- [ ] Coupon `LAUNCH5` créé sur Stripe
- [ ] Promotion code `LAUNCH5` créé et actif
- [ ] `allow_promotion_codes: true` dans checkout
- [ ] Variables env configurées (Vercel + Local)
- [ ] Application déployée
- [ ] Cron visible dans Vercel Dashboard
- [ ] Test manuel du cron réussi
- [ ] Test du code LAUNCH5 sur checkout réussi
- [ ] Email de test reçu et bien formaté

---

## 🚀 ACTIVATION

Une fois toutes les étapes complétées :

✅ **L'automatisation est ACTIVE**

Chaque jour à 10h :
1. Le cron vérifie les comptes créés il y a 3 jours
2. Filtre les utilisateurs gratuits
3. Envoie l'email avec code LAUNCH5
4. Enregistre dans `marketing_emails`

**Premiers résultats** : Dans 3 jours ! 📈

---

**Besoin d'aide pour la configuration ? Suivez ce guide étape par étape ! 🎯**
