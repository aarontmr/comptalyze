# 🔐 Guide : Configuration de la connexion Google OAuth

## 📋 Prérequis

Pour activer la connexion Google sur Comptalyze, vous devez configurer Google OAuth dans Supabase.

## 🔧 Configuration dans Supabase

### Étape 1 : Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API "Google+ API" (ou "Google Identity Services API")

### Étape 2 : Créer les identifiants OAuth

1. Dans Google Cloud Console, allez dans **APIs & Services** > **Credentials**
2. Cliquez sur **Create Credentials** > **OAuth client ID**
3. Choisissez **Web application**
4. Configurez :
   - **Name** : Comptalyze OAuth
   - **Authorized JavaScript origins** : 
     - `https://votre-projet.supabase.co`
     - `http://localhost:3000` (pour le développement)
   - **Authorized redirect URIs** :
     - `https://votre-projet.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/v1/callback` (pour le développement)
5. Cliquez sur **Create**
6. **Copiez le Client ID et le Client Secret**

### Étape 3 : Configurer dans Supabase

1. Dans Supabase, allez dans **Authentication** > **Providers**
2. Trouvez **Google** dans la liste
3. Activez le provider Google
4. Entrez :
   - **Client ID (for OAuth)** : Votre Client ID Google
   - **Client Secret (for OAuth)** : Votre Client Secret Google
5. Cliquez sur **Save**

### Étape 4 : Configurer les URLs de redirection

Dans Supabase, allez dans **Authentication** > **URL Configuration** et vérifiez que :
- **Site URL** : `https://votre-domaine.com` (ou `http://localhost:3000` pour le dev)
- **Redirect URLs** : Ajoutez `https://votre-domaine.com/dashboard`

## ✅ Test

1. Allez sur la page de login
2. Cliquez sur "Continuer avec Google"
3. Vous devriez être redirigé vers Google pour vous connecter
4. Après connexion, vous serez redirigé vers le dashboard

## 🔒 Sécurité

- Les emails Google sont automatiquement vérifiés (pas besoin de vérification supplémentaire)
- Les utilisateurs peuvent se connecter avec leur compte Google existant
- Les nouveaux utilisateurs sont automatiquement créés lors de la première connexion

## 📝 Notes

- Assurez-vous que les URLs de redirection dans Google Cloud Console correspondent exactement à celles configurées dans Supabase
- Pour la production, utilisez votre domaine réel dans les URLs de redirection
- Les utilisateurs connectés via Google n'ont pas besoin de mot de passe


