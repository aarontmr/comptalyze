# 🔧 Guide : Configurer un domaine personnalisé pour OAuth Google

## Problème

Lors de la connexion avec Google, l'URL Supabase (`lagcnharitvvharfxhob.supabase.co`) s'affiche au lieu de votre domaine professionnel, ce qui n'est pas professionnel.

**⚠️ Important** : L'URL de callback Supabase (`https://lagcnharitvvharfxhob.supabase.co/auth/v1/callback`) **ne peut pas être modifiée directement**. C'est l'URL que Supabase utilise pour gérer les callbacks OAuth.

## Solutions disponibles

### Solution 1 : Utiliser un domaine personnalisé Supabase (Recommandé - Plan Pro/Team requis)

Si vous avez un plan Supabase Pro ou Team, vous pouvez configurer un domaine personnalisé pour votre projet Supabase.

#### Étapes :

1. **Dans Supabase Dashboard** :
   - Allez dans **Settings** > **General**
   - Faites défiler jusqu'à **Custom Domain**
   - Cliquez sur **Add Custom Domain**
   - Entrez votre domaine (ex: `api.comptalyze.com` ou `auth.comptalyze.com`)

2. **Configurez votre DNS** :
   - Ajoutez un enregistrement CNAME pointant vers votre projet Supabase
   - Supabase vous donnera les instructions exactes

3. **Mettez à jour votre code** :
   - Remplacez `NEXT_PUBLIC_SUPABASE_URL` par votre domaine personnalisé
   - Exemple : `https://api.comptalyze.com` au lieu de `https://lagcnharitvvharfxhob.supabase.co`

4. **Mettez à jour Google OAuth** :
   - Dans Google Cloud Console, modifiez les **Authorized redirect URIs**
   - Remplacez `https://lagcnharitvvharfxhob.supabase.co/auth/v1/callback` par `https://api.comptalyze.com/auth/v1/callback`

**Avantages** :
- ✅ URL professionnelle (`api.comptalyze.com` au lieu de `lagcnharitvvharfxhob.supabase.co`)
- ✅ Meilleure expérience utilisateur
- ✅ Plus de confiance de la part des utilisateurs

**Inconvénients** :
- ⚠️ Nécessite un plan Supabase Pro ou Team (payant)
- ⚠️ Configuration DNS requise

### Solution 2 : Minimiser l'affichage de l'URL (Gratuit)

### 1. Configurer la variable d'environnement

Assurez-vous que `NEXT_PUBLIC_BASE_URL` est configurée avec votre domaine de production :

**En développement local** (`.env.local`) :
```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**En production** (Vercel ou votre hébergeur) :
```env
NEXT_PUBLIC_BASE_URL=https://comptalyze.com
```

Si vous ne pouvez pas utiliser un domaine personnalisé, vous pouvez minimiser l'affichage de l'URL Supabase en configurant correctement les redirections.

#### Étapes :

1. **Configurer la variable d'environnement** :
   - Assurez-vous que `NEXT_PUBLIC_BASE_URL` est configurée avec votre domaine
   - Le code utilisera cette URL pour les redirections après OAuth

2. **Configurer les URLs de redirection dans Supabase** :
   - Allez dans **Authentication > URL Configuration**
   - Ajoutez vos URLs de redirection autorisées :
     - `https://comptalyze.com/dashboard`
     - `https://comptalyze.com/**` (pour autoriser toutes les pages)
     - `http://localhost:3000/dashboard` (pour le développement)

3. **Configurer Google OAuth dans Supabase** :
   - Allez dans **Authentication > Providers > Google**
   - Vérifiez que les URLs de redirection autorisées incluent :
     - `https://comptalyze.com/dashboard`
     - `https://lagcnharitvvharfxhob.supabase.co/auth/v1/callback` (nécessaire - ne peut pas être supprimé)

4. **Dans la console Google Cloud** :
   - Allez dans [Google Cloud Console](https://console.cloud.google.com)
   - Sélectionnez votre projet
   - Allez dans **APIs & Services > Credentials**
   - Modifiez votre OAuth 2.0 Client ID
   - Dans **Authorized redirect URIs**, assurez-vous d'avoir :
     - `https://lagcnharitvvharfxhob.supabase.co/auth/v1/callback` (obligatoire)

### 4. Vérifier la configuration

Après ces modifications :
- ✅ L'URL affichée lors de la connexion Google utilisera votre domaine
- ✅ Les redirections fonctionneront correctement
- ✅ L'expérience utilisateur sera plus professionnelle

## Notes importantes

- ⚠️ **L'URL de callback Supabase (`*.supabase.co/auth/v1/callback`) ne peut pas être changée** - c'est l'URL que Supabase utilise pour gérer OAuth
- ⚠️ **Ne supprimez jamais** cette URL des redirections autorisées dans Google Cloud Console, elle est obligatoire
- ✅ **Solution recommandée** : Utiliser un domaine personnalisé Supabase (plan Pro/Team requis)
- ✅ Le code utilise maintenant `NEXT_PUBLIC_BASE_URL` en priorité pour les redirections après OAuth
- 🔄 Après modification des URLs dans Supabase, attendez quelques minutes pour que les changements prennent effet

## Résumé des options

| Option | Coût | URL affichée | Difficulté |
|--------|------|--------------|------------|
| **Domaine personnalisé Supabase** | Plan Pro/Team (~$25/mois) | `api.comptalyze.com` | Moyenne |
| **Configuration minimale** | Gratuit | `lagcnharitvvharfxhob.supabase.co` | Facile |

## Test

1. Déconnectez-vous de votre compte
2. Cliquez sur "Continuer avec Google"
3. **Avec domaine personnalisé** : L'URL affichée sera votre domaine (`api.comptalyze.com`)
4. **Sans domaine personnalisé** : L'URL Supabase s'affichera toujours, mais l'utilisateur sera redirigé vers votre domaine après connexion

