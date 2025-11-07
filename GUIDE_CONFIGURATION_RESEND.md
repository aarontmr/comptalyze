# 📧 Guide de Configuration Resend (Email)

## Étape 1 : Créer un compte Resend

1. Allez sur https://resend.com
2. Créez un compte gratuit (100 emails/jour gratuit)
3. Vérifiez votre email

## Étape 2 : Récupérer votre clé API

1. Une fois connecté, allez dans **API Keys** (dans le menu)
2. Cliquez sur **Create API Key**
3. Donnez-lui un nom (ex: "Comptalyze Production")
4. Copiez la clé API (elle commence par `re_...`)
   ⚠️ **Important** : Vous ne pourrez la voir qu'une seule fois ! Copiez-la immédiatement.

## Étape 3 : Configurer localement (.env.local)

1. **Créez un fichier `.env.local`** à la racine de votre projet (à côté de `package.json`)

2. **Ajoutez ces lignes** (ajoutez aussi vos autres variables d'environnement si nécessaire) :

```env
# Email (Resend)
RESEND_API_KEY=re_votre_cle_api_ici
COMPANY_FROM_EMAIL="Comptalyze <onboarding@resend.dev>"
```

⚠️ **Note** : Pour commencer, utilisez `onboarding@resend.dev` comme email "from". C'est l'email par défaut de Resend pour tester.

3. **Redémarrez votre serveur de développement** :
```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez
npm run dev
```

## Étape 4 : Configurer sur Vercel (Production)

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet **Comptalyze**
3. Allez dans **Settings** > **Environment Variables**
4. Cliquez sur **Add New**
5. Ajoutez ces variables :
   - **Name** : `RESEND_API_KEY`
   - **Value** : `re_votre_cle_api_ici`
   - **Environments** : ✅ Production, ✅ Preview, ✅ Development
6. **Name** : `COMPANY_FROM_EMAIL`
   - **Value** : `Comptalyze <onboarding@resend.dev>` (ou votre domaine vérifié)
   - **Environments** : ✅ Production, ✅ Preview, ✅ Development
7. Cliquez sur **Save**
8. **Redéployez** votre application (ou attendez le prochain déploiement)

## Étape 5 : Vérifier votre domaine (optionnel, pour plus tard)

Si vous voulez utiliser votre propre domaine (ex: `no-reply@comptalyze.com`) :

1. Dans Resend, allez dans **Domains**
2. Cliquez sur **Add Domain**
3. Ajoutez votre domaine (ex: `comptalyze.com`)
4. Suivez les instructions pour configurer les enregistrements DNS
5. Une fois vérifié, utilisez `Comptalyze <no-reply@comptalyze.com>` dans `COMPANY_FROM_EMAIL`

## ✅ Test

Une fois configuré :

1. Redémarrez votre serveur local
2. Essayez d'exporter un PDF
3. Vérifiez votre boîte email (et les spams)

## 🔍 Vérification

Pour vérifier que la clé est bien configurée :

```bash
# En local, vérifiez que le fichier .env.local existe
cat .env.local | grep RESEND_API_KEY

# Doit afficher quelque chose comme :
# RESEND_API_KEY=re_...
```

## ⚠️ Erreurs courantes

### "Service d'envoi d'email non configuré"
- Vérifiez que `.env.local` existe et contient `RESEND_API_KEY`
- Vérifiez que vous avez redémarré le serveur après avoir ajouté la variable

### "Invalid API key"
- Vérifiez que vous avez bien copié toute la clé (elle commence par `re_`)
- Vérifiez qu'il n'y a pas d'espaces avant/après la clé dans `.env.local`

### "Email not sent"
- Vérifiez votre quota Resend (100 emails/jour en gratuit)
- Vérifiez que l'email de destination est valide
- Vérifiez les logs Resend dans le dashboard

## 📚 Ressources

- Documentation Resend : https://resend.com/docs
- Support Resend : https://resend.com/support










