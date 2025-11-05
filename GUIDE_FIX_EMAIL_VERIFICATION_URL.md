# 🔧 Guide : Corriger l'URL de vérification d'email

## ❌ Problème

Le lien "Vérifier mon adresse mail" dans les emails redirige vers `http://localhost:3000` au lieu de `https://comptalyze.com`.

## ✅ Solution en 2 étapes

### Étape 1 : Configuration Supabase Dashboard (IMPORTANT)

C'est l'étape la plus importante ! Supabase utilise la configuration "Site URL" pour générer les liens de confirmation.

1. **Connectez-vous à votre [Supabase Dashboard](https://app.supabase.com)**

2. **Sélectionnez votre projet Comptalyze**

3. **Allez dans Authentication > URL Configuration** :
   - Cliquez sur **"Authentication"** dans le menu de gauche
   - Puis cliquez sur **"URL Configuration"** (ou **"Settings"** puis **"Auth"**)

4. **Configurez les URLs** :

   **Site URL** : Remplacez par votre domaine de production
   ```
   https://comptalyze.com
   ```

   **Redirect URLs** : Ajoutez vos URLs autorisées (une par ligne)
   ```
   https://comptalyze.com/**
   https://comptalyze.com/dashboard
   http://localhost:3000/**
   http://localhost:3000/dashboard
   ```
   
   > **Note** : On garde localhost pour le développement local

5. **Cliquez sur "Save"** en bas de la page

### Étape 2 : Vérifier votre fichier .env.local

Assurez-vous que votre fichier `.env.local` contient bien :

```env
NEXT_PUBLIC_BASE_URL=https://comptalyze.com
```

> **Remarque** : Le code a été mis à jour pour utiliser cette variable au lieu de `window.location.origin`.

### Étape 3 : Redémarrer votre application

Si vous développez en local, **redémarrez votre serveur** pour que les changements soient pris en compte :

```bash
# Arrêtez le serveur avec Ctrl+C
# Puis relancez :
npm run dev
```

### Étape 4 : En production (Vercel)

Si vous avez déjà déployé sur Vercel :

1. Allez dans votre projet Vercel
2. **Settings** > **Environment Variables**
3. Vérifiez que `NEXT_PUBLIC_BASE_URL` est bien définie à `https://comptalyze.com`
4. Si vous avez fait des changements, **redéployez** votre application

## 🧪 Test

1. Créez un nouveau compte de test avec une vraie adresse email
2. Vérifiez votre boîte email
3. Le lien dans l'email devrait maintenant pointer vers `https://comptalyze.com/...`

## 🎯 Résultat attendu

Avant :
```
https://localhost:3000/auth/confirm?token=...
```

Après :
```
https://comptalyze.com/auth/confirm?token=...
```

## 📝 Notes importantes

- **Site URL dans Supabase** contrôle la base du lien de confirmation
- **emailRedirectTo** (dans le code) contrôle où l'utilisateur est redirigé APRÈS avoir cliqué sur le lien
- Les deux doivent pointer vers votre domaine de production pour que tout fonctionne correctement

## ❓ Dépannage

### Le lien pointe toujours vers localhost

1. Vérifiez que vous avez bien sauvegardé la configuration dans Supabase Dashboard
2. Attendez quelques minutes (le cache de Supabase peut prendre du temps à se mettre à jour)
3. Essayez de créer un nouveau compte pour tester

### L'utilisateur est redirigé vers une erreur après avoir cliqué sur le lien

- Assurez-vous que l'URL est bien ajoutée dans "Redirect URLs" dans Supabase
- Vérifiez que votre application est accessible à l'URL configurée

