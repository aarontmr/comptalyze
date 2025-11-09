# 🔧 Guide : Résoudre l'erreur "Load failed" sur mobile

## 🎯 Problème

Vous recevez une erreur "Load failed" lors de la tentative de connexion sur l'application mobile Comptalyze.

## 📋 Diagnostic

Cette erreur indique que l'application mobile ne peut pas communiquer avec le serveur Supabase. Voici les causes possibles :

### 1. ⚠️ Problème de configuration Supabase (CAUSE LA PLUS FRÉQUENTE)

**Symptômes :**
- Erreur "Load failed" immédiate lors de la connexion
- L'application web fonctionne mais pas le mobile

**Solution :**

#### Vérifiez votre fichier `.env.local` :

1. Ouvrez le fichier `.env.local` à la racine du projet
2. Vérifiez que ces variables sont bien remplies :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Si elles sont vides, allez sur [supabase.com](https://supabase.com) :
   - Sélectionnez votre projet
   - Cliquez sur **Settings** → **API**
   - Copiez **Project URL** et **anon public key**

4. **REDÉMARREZ le serveur** :
```bash
# Appuyez sur Ctrl+C pour arrêter le serveur
npm run dev
```

### 2. 🌐 Problème de connexion réseau

**Symptômes :**
- L'erreur se produit de manière intermittente
- Votre connexion internet est instable

**Solution :**
- Vérifiez que votre mobile a une connexion internet stable (WiFi ou 4G/5G)
- Essayez de basculer entre WiFi et données mobiles
- Redémarrez votre routeur si nécessaire

### 3. 🔒 Identifiants incorrects

**Symptômes :**
- Vous êtes certain que vos identifiants sont corrects
- Mais l'erreur persiste

**Solutions possibles :**

#### a) Email non vérifié
Si vous venez de créer votre compte :
1. Vérifiez votre boîte mail (et les spams)
2. Cliquez sur le lien de confirmation
3. Réessayez de vous connecter

#### b) Mot de passe oublié
1. Allez sur la page d'inscription
2. Cliquez sur "Mot de passe oublié ?" (si disponible)
3. Réinitialisez votre mot de passe

#### c) Compte inexistant
- Vérifiez que vous utilisez le bon email
- Si nécessaire, créez un nouveau compte

### 4. 🚫 Problème CORS ou de firewall

**Symptômes :**
- L'erreur se produit uniquement sur certains réseaux (bureau, école, entreprise)

**Solution :**
- Essayez avec une autre connexion (données mobiles par exemple)
- Vérifiez que votre pare-feu ne bloque pas l'accès à Supabase

### 5. 📱 Problème avec l'application mobile

**Symptômes :**
- La version web fonctionne mais pas le mobile

**Solutions :**

#### a) Vider le cache de l'application
1. Allez dans les paramètres de votre téléphone
2. Applications → Comptalyze
3. Stockage → Vider le cache
4. Relancez l'application

#### b) Réinstaller l'application
1. Désinstallez Comptalyze
2. Réinstallez-la depuis le store
3. Réessayez de vous connecter

## 🔍 Tests de diagnostic

### Test 1 : Vérifier la configuration Supabase

```bash
# Dans le terminal, à la racine du projet
npm run dev
```

Regardez les logs dans le terminal. Vous devriez voir :
```
✅ Supabase client initialisé avec succès
   URL: https://votre-projet.supabase.co...
```

Si vous voyez des erreurs, c'est un problème de configuration.

### Test 2 : Tester la connexion depuis un navigateur

1. Ouvrez votre application dans un navigateur web sur votre téléphone
2. Allez sur l'URL de votre application (ex: `http://192.168.x.x:3000`)
3. Essayez de vous connecter

Si ça fonctionne dans le navigateur mais pas dans l'app mobile, c'est un problème spécifique à l'app.

### Test 3 : Vérifier les identifiants manuellement

1. Allez sur [supabase.com](https://supabase.com)
2. Ouvrez votre projet
3. Allez dans **Authentication** → **Users**
4. Vérifiez que votre compte existe et que l'email est confirmé

## 📝 Modifications apportées

J'ai amélioré la page de connexion pour :

1. **Meilleure gestion des erreurs** :
   - Messages d'erreur plus clairs et en français
   - Détection spécifique de l'erreur "Load failed"
   - Suggestions de solutions

2. **Connexion directe à Supabase** :
   - Suppression de l'appel API intermédiaire qui causait des problèmes sur mobile
   - Connexion plus rapide et plus fiable

3. **Détection des problèmes courants** :
   - Email non confirmé
   - Identifiants incorrects
   - Problèmes de réseau

## 🆘 Si le problème persiste

### Option 1 : Créer un nouveau compte test

Pour vérifier si le problème vient de votre compte :

1. Essayez de créer un nouveau compte avec un autre email
2. Confirmez l'email
3. Essayez de vous connecter avec ce nouveau compte

### Option 2 : Vérifier les logs côté serveur

Si vous avez accès au terminal où tourne le serveur :

1. Regardez les logs lors de votre tentative de connexion
2. Cherchez les messages d'erreur
3. Notez l'erreur exacte pour plus d'aide

### Option 3 : Contacter le support

Si rien ne fonctionne, contactez le support avec ces informations :

- Email utilisé : `aaronthimeur@gmail.com`
- Message d'erreur exact : "Load failed"
- Ce que vous avez déjà essayé
- Si ça fonctionne dans un navigateur web ou non

## ✅ Checklist de vérification rapide

- [ ] Les variables `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont remplies dans `.env.local`
- [ ] Le serveur a été redémarré après modification de `.env.local`
- [ ] Votre connexion internet fonctionne
- [ ] Vous utilisez le bon email
- [ ] Vous utilisez le bon mot de passe
- [ ] Votre email a été confirmé (vérifiez vos mails)
- [ ] Vous avez vidé le cache de l'application

## 🎓 Pour les développeurs

Si vous développez l'application et que vous testez sur mobile :

### Configuration pour le développement mobile

1. **Trouvez l'IP locale de votre machine** :

**Windows :**
```bash
ipconfig
# Cherchez "Adresse IPv4" (ex: 192.168.1.10)
```

**Mac/Linux :**
```bash
ifconfig | grep inet
# Cherchez votre IP locale (ex: 192.168.1.10)
```

2. **Accédez à l'application depuis votre mobile** :
   - Connectez votre téléphone au même réseau WiFi que votre ordinateur
   - Ouvrez le navigateur sur votre mobile
   - Allez sur `http://VOTRE_IP:3000` (ex: `http://192.168.1.10:3000`)

3. **Vérifiez que le serveur écoute sur toutes les interfaces** :
```bash
# Dans package.json, vérifiez que le script dev est :
"dev": "next dev -H 0.0.0.0"
```

### Variables d'environnement pour mobile

Si vous compilez une application mobile native (React Native, etc.), assurez-vous que :

1. Les variables d'environnement sont bien injectées dans le build
2. L'URL de l'API pointe vers l'URL de production (pas localhost)
3. Le client Supabase est correctement configuré

## 📚 Ressources utiles

- [Documentation Supabase Auth](https://supabase.com/docs/guides/auth)
- [Troubleshooting Supabase](https://supabase.com/docs/guides/platform/troubleshooting)
- [Guide de configuration Comptalyze](./GUIDE_ENV.md)

