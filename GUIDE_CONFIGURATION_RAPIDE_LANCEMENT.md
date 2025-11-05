# ⚡ Configuration Rapide pour Lancement

Ce guide vous permet de configurer les services essentiels en **15 minutes** pour lancer votre SaaS.

---

## 📋 Prérequis

- ✅ Compte Vercel créé et projet déployé
- ✅ Compte Supabase créé et configuré
- ✅ Compte Stripe créé et configuré

---

## 🚀 Configuration en 3 étapes

### Étape 1 : Configurer Resend (5 minutes) - OBLIGATOIRE

#### 1.1 Créer un compte

1. Allez sur **https://resend.com**
2. Cliquez sur "Sign Up"
3. Inscrivez-vous avec votre email
4. Vérifiez votre email

#### 1.2 Récupérer l'API Key

1. Une fois connecté, allez dans **API Keys**
2. Cliquez sur "Create API Key"
3. Nommez-la : `Comptalyze Production`
4. Cliquez sur "Create"
5. **⚠️ COPIEZ la clé immédiatement** (elle ne sera plus affichée)

```
Format : re_xxxxxxxxxxxxxxxxxxxxxxxx
```

#### 1.3 Configurer le domaine (2 options)

**Option A : Utiliser le domaine de test (pour tester rapidement)**

- Utilisez `onboarding@resend.dev` comme email d'envoi
- ⚠️ Limite : Vous ne pouvez envoyer qu'à votre propre email
- ✅ Pratique pour tester avant le vrai lancement

**Option B : Configurer votre vrai domaine (recommandé pour production)**

1. Allez dans **Domains** dans Resend
2. Cliquez sur "Add Domain"
3. Entrez votre domaine : `comptalyze.com`
4. Copiez les enregistrements DNS fournis
5. Allez dans votre registrar (OVH, Namecheap, Cloudflare, etc.)
6. Ajoutez ces enregistrements DNS :
   - Type TXT pour SPF
   - Type TXT pour DKIM
   - Type CNAME pour DKIM
7. Attendez 5-10 minutes
8. Vérifiez dans Resend que le domaine est vérifié ✅

#### 1.4 Ajouter l'API Key dans Vercel

1. Allez sur **https://vercel.com**
2. Sélectionnez votre projet Comptalyze
3. Allez dans **Settings > Environment Variables**
4. Ajoutez :
   ```
   Name: RESEND_API_KEY
   Value: re_xxxxxxxxxxxxxxxxxxxxxxxx
   Environment: Production, Preview, Development
   ```
5. Cliquez sur "Save"

#### 1.5 Configurer l'email d'envoi

Dans Vercel, ajoutez aussi :

```
Name: COMPANY_FROM_EMAIL
Value: no-reply@comptalyze.com
Environment: Production, Preview, Development
```

OU si vous utilisez le domaine de test :

```
Value: onboarding@resend.dev
```

#### 1.6 Redéployer

1. Dans Vercel, allez dans **Deployments**
2. Cliquez sur "..." du dernier déploiement
3. Cliquez sur "Redeploy"

✅ **Resend est configuré !**

---

### Étape 2 : Configurer OpenAI (5 minutes) - RECOMMANDÉ

#### 2.1 Créer un compte

1. Allez sur **https://platform.openai.com**
2. Cliquez sur "Sign up"
3. Inscrivez-vous avec votre email
4. Vérifiez votre email

#### 2.2 Ajouter du crédit

1. Une fois connecté, cliquez sur votre profil (en haut à droite)
2. Allez dans **Billing**
3. Cliquez sur "Add payment method"
4. Ajoutez votre carte bancaire
5. Ajoutez **10€ de crédit** (ou plus selon votre besoin)

#### 2.3 Configurer les limites de dépense

1. Dans **Billing > Limits**
2. Configurez :
   - **Hard limit** : 15€/mois (pour éviter les surprises)
   - **Soft limit** : 10€/mois (pour recevoir une alerte)

#### 2.4 Créer une API Key

1. Allez dans **API Keys** (menu gauche)
2. Cliquez sur "Create new secret key"
3. Nommez-la : `Comptalyze Production`
4. Permissions : Sélectionnez "All" (ou "Write" minimum)
5. Cliquez sur "Create secret key"
6. **⚠️ COPIEZ la clé immédiatement**

```
Format : sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx
```

#### 2.5 Ajouter l'API Key dans Vercel

1. Allez sur **https://vercel.com**
2. Sélectionnez votre projet
3. Allez dans **Settings > Environment Variables**
4. Ajoutez :
   ```
   Name: OPENAI_API_KEY
   Value: sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx
   Environment: Production, Preview, Development
   ```
5. Cliquez sur "Save"

#### 2.6 Redéployer

1. Dans Vercel, allez dans **Deployments**
2. Cliquez sur "..." du dernier déploiement
3. Cliquez sur "Redeploy"

✅ **OpenAI est configuré !**

---

### Étape 3 : Tester (5 minutes) - ESSENTIEL

#### 3.1 Tester l'inscription

1. Allez sur votre site en production : `https://comptalyze.com`
2. Cliquez sur "S'inscrire"
3. Créez un compte avec un email test
4. **Vérifiez que vous recevez l'email de vérification** ✅
5. Cliquez sur le lien dans l'email
6. Vérifiez que vous êtes connecté

⚠️ **Si vous ne recevez PAS l'email :**
- Vérifiez les logs Vercel (Functions)
- Vérifiez que RESEND_API_KEY est bien configurée
- Vérifiez votre domaine Resend (doit être vérifié)

#### 3.2 Tester la création de facture

1. Une fois connecté, passez votre compte en **mode Pro** :
   - Méthode rapide : Utilisez le script `scripts/set-pro.js`
   - Ou faites un vrai paiement Stripe test

2. Allez dans **Factures > Nouvelle facture**

3. Remplissez une facture test :
   - Client : Test SARL
   - Email : votre-email@exemple.com
   - Créez des lignes de facture
   - Validez

4. **Vérifiez que vous recevez la facture PDF par email** ✅

⚠️ **Si vous ne recevez PAS la facture :**
- Vérifiez les logs Vercel
- Vérifiez que la facture a été créée dans Supabase
- Vérifiez RESEND_API_KEY

#### 3.3 Tester l'IA (si OpenAI configuré)

1. Passez votre compte en **mode Premium** (script ou paiement)

2. Cliquez sur l'icône **💬 Assistant IA** (en bas à droite sur desktop)

3. Tapez une question :
   ```
   Combien dois-je facturer pour avoir 3000€ net par mois ?
   ```

4. **Vérifiez que l'IA répond** ✅

⚠️ **Si l'IA ne répond pas :**
- Vérifiez les logs Vercel
- Vérifiez OPENAI_API_KEY
- Vérifiez que vous avez du crédit OpenAI

#### 3.4 Tester le paiement Stripe

1. Déconnectez-vous
2. Créez un nouveau compte test
3. Cliquez sur "Passer à Pro"
4. Utilisez une **carte de test Stripe** :
   ```
   Numéro : 4242 4242 4242 4242
   Date : N'importe quelle date future (ex: 12/25)
   CVC : N'importe quels 3 chiffres (ex: 123)
   ```

5. Validez le paiement

6. **Vérifiez que vous êtes redirigé vers la page de succès** ✅

7. **Vérifiez que votre compte est bien Pro** (badge dans le dashboard)

⚠️ **Si le paiement échoue :**
- Vérifiez que Stripe est en mode "Test" (pas "Live")
- Vérifiez les webhooks Stripe
- Vérifiez les logs Vercel

---

## ✅ Checklist finale

Avant d'ouvrir au public :

### Configuration
- [ ] Resend API Key configurée dans Vercel
- [ ] Domaine Resend vérifié (ou utilisation de resend.dev)
- [ ] OpenAI API Key configurée dans Vercel (optionnel)
- [ ] Limite de dépense OpenAI configurée
- [ ] Application redéployée sur Vercel

### Tests
- [ ] Email de vérification reçu et fonctionnel
- [ ] Connexion/Déconnexion fonctionne
- [ ] Dashboard affiche les données
- [ ] Création de facture fonctionne
- [ ] Facture PDF reçue par email
- [ ] Paiement Stripe test réussi
- [ ] Badge Pro/Premium appliqué après paiement
- [ ] (Optionnel) Assistant IA répond

### Monitoring
- [ ] Vérifier les logs Vercel (pas d'erreurs)
- [ ] Vérifier le dashboard Stripe (webhooks OK)
- [ ] Vérifier le dashboard Resend (emails envoyés)
- [ ] Vérifier le dashboard Supabase (utilisateurs créés)

---

## 🎉 Vous êtes prêt !

Si tous les tests passent, **votre SaaS est prêt à accueillir des clients** !

### Prochaines étapes

1. **Désactivez le mode test Stripe** et passez en **mode Live** :
   ```
   1. Dashboard Stripe > Mode Live
   2. Créez de nouveaux produits en mode Live
   3. Mettez à jour les Price IDs dans Vercel
   4. Configurez le webhook en mode Live
   ```

2. **Communiquez sur votre lancement** :
   - Réseaux sociaux
   - Email à votre liste
   - Product Hunt
   - Reddit (r/SideProject)

3. **Surveillez les métriques** :
   - Inscriptions quotidiennes
   - Taux de conversion Free → Pro
   - Taux d'emails bounced
   - Coûts OpenAI

---

## 🆘 En cas de problème

### Problème : Les emails ne partent pas

**Solutions :**
1. Vérifiez RESEND_API_KEY dans Vercel
2. Vérifiez que le domaine est vérifié dans Resend
3. Regardez les logs Vercel > Functions
4. Testez directement depuis le dashboard Resend

### Problème : L'IA ne répond pas

**Solutions :**
1. Vérifiez OPENAI_API_KEY dans Vercel
2. Vérifiez que vous avez du crédit OpenAI
3. Vérifiez la limite de dépense OpenAI
4. Regardez les logs Vercel > Functions

### Problème : Le paiement Stripe échoue

**Solutions :**
1. Vérifiez que vous utilisez une carte de test valide
2. Vérifiez que Stripe est en mode Test
3. Vérifiez les webhooks Stripe (Events > Events)
4. Regardez les logs Vercel > Functions

### Problème : Le webhook Stripe ne fonctionne pas

**Solutions :**
1. Vérifiez l'URL du webhook : `https://comptalyze.com/api/webhook`
2. Vérifiez les événements écoutés :
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
3. Vérifiez STRIPE_WEBHOOK_SECRET dans Vercel
4. Testez manuellement depuis Stripe Dashboard

---

## 📞 Support

Si vous bloquez vraiment :

1. **Consultez les logs** en premier
   - Vercel Functions
   - Stripe Events
   - Supabase Logs

2. **Vérifiez les variables d'environnement**
   - Toutes présentes ?
   - Bonnes valeurs ?
   - Bien dans les 3 environnements ?

3. **Testez les APIs directement**
   - Resend : Envoi email depuis dashboard
   - OpenAI : Playground
   - Stripe : Dashboard test

---

**Temps total : 15 minutes**  
**Budget : 5-15€/mois**  
**Capacité : 50-200 premiers clients**

🚀 **Bon lancement !**


