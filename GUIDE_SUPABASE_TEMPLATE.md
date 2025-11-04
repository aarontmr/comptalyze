# 📧 Guide : Configuration du Template Email Supabase

## 🎯 Objectif

Ce guide vous explique comment utiliser le template HTML personnalisé Comptalyze dans Supabase pour avoir un email de vérification professionnel avec votre branding.

## 📋 Étapes de configuration

### 1. Aller dans Supabase Dashboard

1. Connectez-vous à votre [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet Comptalyze
3. Allez dans **Authentication** > **Email Templates**

### 2. Modifier le template "Confirm signup"

1. Dans la liste des templates, cliquez sur **"Confirm signup"**
2. Vous verrez deux onglets : **"Subject"** et **"Body"**

### 3. Configurer le Subject (sujet de l'email)

Dans l'onglet **Subject**, remplacez le contenu par :

```
Vérifiez votre adresse email – Comptalyze
```

### 4. Configurer le Body (corps de l'email)

1. Cliquez sur l'onglet **"Body"**
2. Assurez-vous que le mode est sur **"Custom HTML"** (pas "Plain text")
3. Ouvrez le fichier `SUPABASE_EMAIL_TEMPLATE.html` dans votre éditeur
4. **Copiez tout le contenu** du fichier (Ctrl+A puis Ctrl+C)
5. **Collez-le** dans le champ "Body" de Supabase (Ctrl+V)
6. Cliquez sur **"Save"** en bas de la page

## 🔑 Variables Supabase utilisées

Le template utilise ces variables automatiques de Supabase :

- `{{ .ConfirmationURL }}` : Le lien de confirmation unique pour l'utilisateur
- `{{ .Email }}` : L'adresse email de l'utilisateur

Ces variables sont automatiquement remplacées par Supabase lors de l'envoi de l'email.

## ✅ Vérification

### Activer la confirmation email

1. Allez dans **Authentication** > **Settings** > **Auth**
2. Assurez-vous que **"Enable email confirmations"** est activé
3. Si ce n'est pas le cas, activez-le et sauvegardez

### Tester l'email

1. Créez un nouveau compte de test sur votre application
2. Utilisez une vraie adresse email que vous contrôlez
3. Après l'inscription, vérifiez votre boîte email
4. Vous devriez recevoir l'email personnalisé avec le design Comptalyze

## 🎨 Design du template

Le template inclut :

- ✅ **Gradient Comptalyze** : #00D084 → #2E6CF6
- ✅ **Fond sombre** : #0e0f12 (cohérent avec l'interface)
- ✅ **Bouton CTA** : "Vérifier mon email" avec gradient
- ✅ **Lien de secours** : Si le bouton ne fonctionne pas
- ✅ **Mentions URSSAF** : Partenaire officiel
- ✅ **Liste des fonctionnalités** : Ce que permet Comptalyze
- ✅ **Responsive** : S'adapte aux mobiles et tablettes

## 🔄 Note importante

Si vous utilisez aussi l'endpoint `/api/send-verification-email`, vous recevrez potentiellement **deux emails** :
1. L'email de Supabase (avec notre template personnalisé)
2. L'email de notre API (via Resend)

Pour éviter cela, vous pouvez :
- **Option A** : Désactiver l'endpoint `/api/send-verification-email` dans votre code signup
- **Option B** : Garder les deux mais c'est redondant

## 🛠️ Personnalisation

Si vous voulez modifier le template :

1. Éditez le fichier `SUPABASE_EMAIL_TEMPLATE.html`
2. Copiez-collez le nouveau contenu dans Supabase
3. Sauvegardez

Les couleurs principales :
- **Vert** : `#00D084`
- **Bleu** : `#2E6CF6`
- **Fond sombre** : `#0e0f12`
- **Texte clair** : `#e5e7eb`
- **Texte secondaire** : `#9ca3af`
