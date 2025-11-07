# ✅ CHECKLIST : Configuration après vérification du domaine Resend

## 🎯 VOTRE DOMAINE EST VÉRIFIÉ ! Suivez cette checklist :

---

## 📋 **ÉTAPE 1 : Configurer l'email d'envoi**

### **A. Local (.env.local)**

```env
# AVANT
COMPANY_FROM_EMAIL="Comptalyze <onboarding@resend.dev>"

# APRÈS (votre domaine vérifié)
COMPANY_FROM_EMAIL="Comptalyze <no-reply@comptalyze.com>"
```

**Action** : Modifiez `.env.local` puis redémarrez (`npm run dev`)

✅ Fait : [ ]

---

### **B. Vercel (Production)**

1. https://vercel.com/dashboard
2. Projet **Comptalyze** > **Settings** > **Environment Variables**
3. **Trouvez ou créez** `COMPANY_FROM_EMAIL`
4. **Valeur** : `Comptalyze <no-reply@comptalyze.com>`
5. **Environments** : ✅ Production, ✅ Preview, ✅ Development
6. Cliquez sur **Save**

✅ Fait : [ ]

---

## 📋 **ÉTAPE 2 : Redéployer l'application**

### **Option A : Via Git Push** (recommandé)
```bash
git add .
git commit --allow-empty -m "Config: Domaine email vérifié"
git push origin main
```

### **Option B : Via Dashboard Vercel**
1. https://vercel.com/dashboard
2. Projet **Comptalyze** > **Deployments**
3. Cliquez sur **"..."** > **Redeploy**

✅ Fait : [ ]

---

## 📋 **ÉTAPE 3 : Tester les emails**

### **Test 1 : Export PDF par email**
1. Connectez-vous : https://comptalyze.com/dashboard
2. Allez dans **Export**
3. Cliquez sur **Envoyer le PDF par email**
4. Vérifiez votre boîte email

**Résultat attendu** :
- ✅ Email reçu de `no-reply@comptalyze.com`
- ✅ Pas de spam
- ✅ PDF attaché

✅ Fait : [ ]

---

### **Test 2 : Envoi de facture** (si fonctionnalité activée)
1. Créez une facture de test
2. Cliquez sur **Envoyer par email**
3. Vérifiez la réception

✅ Fait : [ ]

---

## 📋 **ÉTAPE 4 : Configurer les Crons Vercel** (IMPORTANT)

Les automatisations d'emails nécessitent des crons Vercel.

### **A. Créer un secret CRON**

1. Générez un secret sécurisé :
```bash
# Sur Windows PowerShell
[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString()))

# Ou utilisez un générateur en ligne :
# https://www.random.org/strings/
```

2. Ajoutez dans Vercel :
   - **Name** : `CRON_SECRET`
   - **Value** : Votre secret généré
   - **Environments** : ✅ Production

✅ Fait : [ ]

---

### **B. Configurer les Crons dans vercel.json**

Créez/modifiez `vercel.json` à la racine :

```json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 0 2 * *"
    },
    {
      "path": "/api/cron/check-trials",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**Explication** :
- `send-reminders` : Le 2 de chaque mois à minuit
- `check-trials` : Tous les jours à 2h du matin

✅ Fait : [ ]

---

### **C. Push le fichier vercel.json**

```bash
git add vercel.json
git commit -m "Add: Configuration crons Vercel"
git push origin main
```

✅ Fait : [ ]

---

## 📋 **ÉTAPE 5 : Vérifier la délivrabilité**

### **A. Test avec Mail-Tester**

1. Allez sur https://www.mail-tester.com
2. Copiez l'email de test fourni
3. Envoyez un email depuis Comptalyze vers cet email
4. Retournez sur mail-tester et consultez le score

**Score attendu** : 8/10 ou plus ✅

✅ Score obtenu : [ ] / 10

---

### **B. Vérifier SPF/DKIM/DMARC**

Dans Resend Dashboard > **Domains** > **comptalyze.com** :

- [ ] SPF : ✅ Verified (vert)
- [ ] DKIM : ✅ Verified (vert)
- [ ] DMARC : ✅ Verified (vert) (optionnel mais recommandé)

Si pas tous verts, vérifiez vos enregistrements DNS.

✅ Tout vérifié : [ ]

---

## 📋 **ÉTAPE 6 : Surveiller les premiers envois**

### **A. Dashboard Resend**

https://resend.com/logs

Vérifiez :
- ✅ Status : **delivered** (pas bounced ou failed)
- ✅ From : `no-reply@comptalyze.com`
- ✅ Pas de plaintes spam

✅ Surveillé pendant 24h : [ ]

---

### **B. Logs Vercel**

https://vercel.com/dashboard > Projet > **Logs**

Vérifiez :
- Pas d'erreurs sur `/api/export-pdf`
- Pas d'erreurs sur `/api/invoices/[id]/email`
- Crons exécutés sans erreur

✅ Logs OK : [ ]

---

## 🎯 **AUTOMATISATIONS ACTIVES APRÈS CONFIGURATION**

### **1. Rappels mensuels URSSAF** 🗓️
- **Quand** : Le 2 de chaque mois à 00h00 (Paris)
- **Pour qui** : Utilisateurs Premium avec rappels activés
- **Email** : Rappel de faire la déclaration URSSAF

### **2. Alertes dépassement de seuils** ⚠️
- **Quand** : Automatique après enregistrement CA
- **Pour qui** : Utilisateurs Premium qui dépassent :
  - Services : 77 700 €
  - Ventes : 188 700 €
- **Email** : Alerte avec actions à effectuer

### **3. Vérification essais gratuits** ⏰
- **Quand** : Tous les jours à 2h
- **Pour qui** : Essais expirés
- **Action** : Désactivation automatique

---

## ⚠️ **TROUBLESHOOTING**

### ❌ **Emails vont en spam**

**Solutions** :
1. Vérifiez SPF/DKIM/DMARC dans Resend
2. Testez avec mail-tester.com
3. Ajoutez DMARC si pas déjà fait :
```
Type: TXT
Name: _dmarc.comptalyze.com
Value: v=DMARC1; p=none; rua=mailto:dmarc@comptalyze.com
```

---

### ❌ **Crons ne s'exécutent pas**

**Solutions** :
1. Vérifiez que `CRON_SECRET` est défini sur Vercel
2. Vérifiez que `vercel.json` est bien commité
3. Consultez les logs : Dashboard Vercel > Logs
4. Testez manuellement :
```bash
curl -X GET "https://comptalyze.com/api/cron/check-trials" \
  -H "Authorization: Bearer VOTRE_CRON_SECRET"
```

---

### ❌ **"Configuration Resend manquante"**

**Solutions** :
1. Vérifiez les variables sur Vercel :
   - `RESEND_API_KEY`
   - `COMPANY_FROM_EMAIL`
2. Redéployez l'application
3. Attendez 2-3 minutes pour propagation

---

## ✅ **VALIDATION FINALE**

Avant de considérer la config terminée :

- [ ] `COMPANY_FROM_EMAIL` mis à jour (local + Vercel)
- [ ] Application redéployée
- [ ] Test email envoyé et reçu
- [ ] Email vient de `no-reply@comptalyze.com`
- [ ] Pas en spam
- [ ] Score mail-tester >8/10
- [ ] `CRON_SECRET` configuré
- [ ] `vercel.json` créé et pusher
- [ ] Crons visibles dans Vercel Dashboard
- [ ] Logs sans erreur

---

## 🎉 **FÉLICITATIONS !**

Une fois cette checklist terminée :
- ✅ Emails professionnels opérationnels
- ✅ Automatisations actives
- ✅ Délivrabilité optimale
- ✅ Branding cohérent

**Votre application est maintenant prête pour le lancement ! 🚀**

---

## 📚 **RESSOURCES**

- Guide complet : `GUIDE_POST_VALIDATION_DOMAINE_RESEND.md`
- Documentation Resend : https://resend.com/docs
- Vercel Crons : https://vercel.com/docs/cron-jobs
- Support : https://resend.com/support

