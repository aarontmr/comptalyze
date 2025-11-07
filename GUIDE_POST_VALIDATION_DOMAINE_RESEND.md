# 🎯 Guide Post-Validation Domaine Resend

## ✅ Votre domaine est validé ! Et maintenant ?

Une fois que Resend a validé votre domaine (ex: `comptalyze.com`), suivez ces étapes pour activer l'envoi d'emails avec votre propre domaine.

---

## 📋 CHECKLIST COMPLÈTE

### ✅ **Étape 1 : Vérifier la validation dans Resend**

1. Connectez-vous à https://resend.com
2. Allez dans **Domains**
3. Vérifiez que votre domaine affiche **✓ Verified** (vert)
4. Si non vérifié, attendez ou vérifiez les enregistrements DNS

---

### ✅ **Étape 2 : Choisir votre adresse email d'envoi**

Choisissez l'une de ces options :

| Email | Usage recommandé |
|-------|------------------|
| `no-reply@comptalyze.com` | ✅ **Recommandé** - Emails transactionnels |
| `contact@comptalyze.com` | Pour support client |
| `hello@comptalyze.com` | Pour onboarding/bienvenue |
| `factures@comptalyze.com` | Spécifique aux factures |

💡 **Conseil** : Utilisez `no-reply@` pour les emails automatiques (factures, rappels, etc.)

---

### ✅ **Étape 3 : Mettre à jour l'environnement LOCAL**

#### **Fichier : `.env.local`** (à la racine du projet)

```env
# 1. Trouvez cette ligne
COMPANY_FROM_EMAIL="Comptalyze <onboarding@resend.dev>"

# 2. Remplacez par
COMPANY_FROM_EMAIL="Comptalyze <no-reply@comptalyze.com>"
```

#### **Redémarrer le serveur**
```bash
# Arrêtez le serveur (Ctrl+C)
npm run dev
```

---

### ✅ **Étape 4 : Mettre à jour l'environnement PRODUCTION (Vercel)**

#### **Option A : Via Dashboard Vercel**

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez **Comptalyze**
3. Cliquez sur **Settings** > **Environment Variables**
4. **Cherchez** `COMPANY_FROM_EMAIL` :
   - Si elle existe : Cliquez sur **Edit**
   - Sinon : Cliquez sur **Add New**
5. Remplissez :
   - **Name** : `COMPANY_FROM_EMAIL`
   - **Value** : `Comptalyze <no-reply@comptalyze.com>`
   - **Environments** : ✅ Production, ✅ Preview, ✅ Development
6. Cliquez sur **Save**

#### **Option B : Via CLI Vercel**

```bash
vercel env add COMPANY_FROM_EMAIL production
# Puis entrez : Comptalyze <no-reply@comptalyze.com>
```

---

### ✅ **Étape 5 : Redéployer l'application**

#### **Option A : Automatique (Push Git)**
```bash
git add .
git commit -m "Update: Configuration email domaine vérifié"
git push origin main
```
Vercel redéploiera automatiquement.

#### **Option B : Manuel (Dashboard Vercel)**
1. Allez dans l'onglet **Deployments**
2. Cliquez sur **⋯** (3 points) à côté du dernier déploiement
3. Cliquez sur **Redeploy**

---

### ✅ **Étape 6 : Tester l'envoi d'emails**

#### **Test 1 : Export PDF par email**
1. Connectez-vous à votre dashboard
2. Allez dans **Export** > **PDF par email**
3. Cliquez sur **Envoyer par email**
4. Vérifiez votre boîte email (et spam)

#### **Test 2 : Envoi de facture**
1. Créez une facture de test
2. Cliquez sur **Envoyer par email**
3. Vérifiez la réception

#### **Test 3 : Rappel automatique** (si configuré)
1. Attendez l'exécution du cron
2. Ou déclenchez manuellement via l'API

---

## 🔍 VÉRIFICATIONS

### **Vérifier que tout fonctionne**

✅ **1. Vérifier les logs Resend**
- Dashboard Resend > **Logs**
- Vous devriez voir les emails envoyés
- Status : **delivered** ✅

✅ **2. Vérifier les headers des emails reçus**
- Ouvrez un email reçu
- Affichez les en-têtes (headers)
- Vérifiez : `From: Comptalyze <no-reply@comptalyze.com>`

✅ **3. Vérifier SPF/DKIM**
- Les emails ne doivent **PAS** aller dans spam
- Vérifiez avec https://www.mail-tester.com

---

## ⚠️ ERREURS COURANTES

### ❌ **"Email not authorized"**
**Cause** : Le domaine n'est pas encore totalement validé ou propagé.

**Solution** :
```bash
# 1. Vérifier dans Resend Dashboard > Domains
# 2. Attendre 24-48h pour la propagation DNS complète
# 3. Tester avec un email différent
```

### ❌ **Emails dans spam**
**Cause** : SPF/DKIM/DMARC mal configurés

**Solution** :
1. Retourner dans Resend > **Domains**
2. Vérifier que **tous** les enregistrements DNS sont verts
3. Tester avec https://www.mail-tester.com
4. Score doit être >8/10

### ❌ **"Configuration Resend manquante"**
**Cause** : Variable `COMPANY_FROM_EMAIL` non définie

**Solution** :
```bash
# Vérifier en local
cat .env.local | grep COMPANY_FROM_EMAIL

# Vérifier sur Vercel
vercel env ls
```

---

## 📊 CONFIGURATION OPTIMALE

### **Emails transactionnels (recommandé)**

```env
# Production
COMPANY_FROM_EMAIL="Comptalyze <no-reply@comptalyze.com>"
```

### **Emails avec réponse possible**

```env
# Si vous voulez que les clients puissent répondre
COMPANY_FROM_EMAIL="Comptalyze <contact@comptalyze.com>"
```

---

## 🚀 ÉTAPES SUIVANTES (Optionnel)

### **1. Configurer DMARC** (Sécurité avancée)
```
Ajoutez un enregistrement DNS TXT :
_dmarc.comptalyze.com
Valeur : v=DMARC1; p=none; rua=mailto:dmarc@comptalyze.com
```

### **2. Surveiller la délivrabilité**
- Dashboard Resend > **Analytics**
- Taux d'ouverture, bounces, plaintes

### **3. Créer des alias supplémentaires**
```
- factures@comptalyze.com → Pour les factures
- rappels@comptalyze.com → Pour les alertes
- support@comptalyze.com → Pour le support
```

---

## ✅ VALIDATION FINALE

Une fois TOUT configuré, vérifiez :

- [ ] Domaine vérifié dans Resend (✓ Verified)
- [ ] `COMPANY_FROM_EMAIL` mis à jour en local
- [ ] `COMPANY_FROM_EMAIL` mis à jour sur Vercel
- [ ] Application redéployée
- [ ] Test d'envoi réussi
- [ ] Emails ne vont PAS dans spam
- [ ] Headers corrects (`From: votre-domaine`)

---

## 🆘 BESOIN D'AIDE ?

**Resend Support** : https://resend.com/support
**Documentation** : https://resend.com/docs

**Logs utiles** :
```bash
# Vérifier les variables d'environnement
vercel env ls

# Voir les logs Vercel
vercel logs
```

---

## 🎉 FÉLICITATIONS !

Votre configuration email est maintenant **professionnelle** et **complète** ! 

Vos emails partiront maintenant de votre propre domaine, ce qui :
- ✅ Améliore la **crédibilité**
- ✅ Réduit les chances d'aller en **spam**
- ✅ Renforce votre **branding**

🚀 **Prêt pour le lancement !**

