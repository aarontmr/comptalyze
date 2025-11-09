# 🚨 Solution : Erreur "Failed to fetch"

## 🎯 Diagnostic

L'erreur **"Failed to fetch"** signifie que votre application mobile ne peut pas se connecter au serveur Supabase.

## 🔍 Quelle est votre situation ?

### Situation A : Vous êtes un **utilisateur** de l'application
### Situation B : Vous êtes le **développeur** et vous testez l'application

---

## 👤 SITUATION A : Vous êtes un utilisateur

### Solution 1 : Vérifiez votre connexion internet

1. **Testez votre connexion** :
   - Ouvrez un navigateur web sur votre téléphone
   - Allez sur n'importe quel site (Google, etc.)
   - Si ça ne marche pas → Reconnectez-vous au WiFi ou activez vos données mobiles

2. **Votre batterie est à 14%** (visible sur l'écran) :
   - Certains téléphones limitent les connexions réseau en mode économie d'énergie
   - Essayez de charger votre téléphone
   - Désactivez le mode économie d'énergie

### Solution 2 : Redémarrez l'application

1. Fermez complètement l'application (pas juste en arrière-plan)
2. Attendez 5 secondes
3. Relancez-la
4. Réessayez de vous connecter

### Solution 3 : Videz le cache

**Sur Android :**
1. Paramètres → Applications
2. Comptalyze → Stockage
3. Vider le cache
4. Relancez l'app

**Sur iOS :**
1. Désinstallez l'application
2. Réinstallez-la
3. Réessayez

### Solution 4 : Changez de réseau

- Si vous êtes en WiFi → Passez en 4G/5G
- Si vous êtes en 4G/5G → Connectez-vous à un WiFi
- Certains réseaux d'entreprise ou d'école bloquent certaines connexions

### Solution 5 : L'application est peut-être en maintenance

- Attendez quelques minutes
- Réessayez
- Contactez le support si le problème persiste

---

## 💻 SITUATION B : Vous êtes développeur

### Cause probable : Variables d'environnement manquantes ou incorrectes

L'erreur "Failed to fetch" arrive généralement quand :
- Le serveur Supabase n'est pas configuré
- Les variables d'environnement sont vides
- L'URL Supabase est incorrecte

### ✅ Solution étape par étape

#### Étape 1 : Vérifiez votre fichier `.env.local`

```bash
# À la racine du projet
cat .env.local
```

Vous devez voir quelque chose comme :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx...
```

❌ **Si elles sont VIDES** :
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

🔧 **Remplissez-les** :

1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous à votre projet
3. Settings → API
4. Copiez :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

5. Collez dans `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-vrai-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_vraie_cle_ici_qui_est_tres_longue
```

⚠️ **ATTENTION** : Pas d'espaces, pas de guillemets !

#### Étape 2 : Redémarrez le serveur (OBLIGATOIRE)

```bash
# Arrêtez le serveur avec Ctrl+C
# Puis relancez :
npm run dev
```

Vous devriez voir dans les logs :

```
✅ Supabase client initialisé avec succès
   URL: https://votre-projet.supabase.co...
```

❌ Si vous voyez une erreur, c'est que les variables sont mal configurées.

#### Étape 3 : Testez depuis un navigateur

1. Ouvrez votre navigateur
2. Allez sur `http://localhost:3000/login`
3. Essayez de vous connecter

Si ça marche dans le navigateur mais pas sur mobile → Passez à l'étape 4

#### Étape 4 : Testez sur mobile (développement)

Si vous testez l'application sur un téléphone pendant le développement :

**Option A : Expo / React Native**

Votre application mobile doit pointer vers l'URL de **production** Supabase, pas vers localhost.

Dans votre code mobile, vérifiez :

```typescript
// ❌ MAUVAIS
const supabaseUrl = 'http://localhost:3000';

// ✅ BON
const supabaseUrl = 'https://votre-projet.supabase.co';
```

**Option B : Application web sur mobile**

Si vous testez la version web depuis votre mobile :

1. **Trouvez l'IP de votre ordinateur** :

**Windows :**
```bash
ipconfig
# Cherchez "Adresse IPv4" (ex: 192.168.1.10)
```

**Mac/Linux :**
```bash
ifconfig | grep inet
# ou
ip addr show
```

2. **Configurez Next.js pour écouter sur toutes les interfaces** :

Dans `package.json` :
```json
{
  "scripts": {
    "dev": "next dev -H 0.0.0.0"
  }
}
```

3. **Accédez depuis votre mobile** :
   - Connectez votre téléphone au même WiFi
   - Ouvrez `http://VOTRE_IP:3000` (ex: `http://192.168.1.10:3000`)

#### Étape 5 : Vérifiez que Supabase fonctionne

Testez directement avec curl :

```bash
curl https://votre-projet.supabase.co/rest/v1/ \
  -H "apikey: VOTRE_ANON_KEY"
```

Si vous recevez une réponse (même une erreur 400), c'est bon signe - Supabase est accessible.

Si timeout → Problème réseau ou URL incorrecte

#### Étape 6 : Utilisez le script de diagnostic automatique

J'ai créé un script qui vérifie automatiquement votre configuration :

```bash
npm run check-connection
```

Ce script va :
- ✅ Vérifier que `.env.local` existe
- ✅ Vérifier que les variables sont remplies
- ✅ Tester la connexion à Supabase
- ✅ Vous donner des instructions précises si quelque chose ne va pas

**Exemple de sortie si tout va bien :**
```
🔍 Vérification de la configuration Supabase...

✅ Fichier .env.local trouvé

📌 NEXT_PUBLIC_SUPABASE_URL :
   ✅ https://abcdef.supabase.co

📌 NEXT_PUBLIC_SUPABASE_ANON_KEY :
   ✅ eyJhbGciOiJIUzI1NiIsInR5cCI6... (150 caractères)

🌐 Test de connexion à Supabase...
   ✅ Supabase est accessible (status: 200)

🎉 Configuration OK !
```

---

## 📋 Checklist de résolution

Pour résoudre "Failed to fetch", suivez dans l'ordre :

### Pour les utilisateurs :
- [ ] Vérifier la connexion internet
- [ ] Redémarrer l'application
- [ ] Vider le cache
- [ ] Essayer un autre réseau (WiFi ↔ 4G)
- [ ] Charger le téléphone (désactiver mode économie d'énergie)

### Pour les développeurs :
- [ ] Exécuter `npm run check-connection`
- [ ] Vérifier que `.env.local` contient les bonnes valeurs
- [ ] Redémarrer le serveur après modification de `.env.local`
- [ ] Tester dans un navigateur desktop d'abord
- [ ] Si mobile : vérifier que l'app utilise l'URL Supabase (pas localhost)

---

## 🆘 Toujours bloqué ?

### Si vous êtes développeur :

**Partagez ces informations pour obtenir de l'aide :**

```bash
# Exécutez cette commande et partagez le résultat (masquez les clés sensibles) :
npm run check-connection

# Vérifiez aussi les logs du serveur :
npm run dev
# Regardez s'il y a des erreurs lors du démarrage
```

### Si vous êtes utilisateur :

**Contactez le support avec ces informations :**
- Message d'erreur exact : "Failed to fetch"
- Téléphone et système : (ex: iPhone 12, iOS 17)
- Type de connexion : WiFi ou 4G/5G
- Ce que vous avez déjà essayé

---

## 🔄 Différence entre les erreurs

| Erreur | Signification | Solution principale |
|--------|---------------|---------------------|
| "Load failed" | Erreur réseau générique | Vérifier connexion internet |
| "Failed to fetch" | Impossible de joindre le serveur | Vérifier config Supabase + connexion |
| "Invalid login credentials" | Identifiants incorrects | Vérifier email/mot de passe |
| "Email not confirmed" | Email non vérifié | Cliquer sur le lien dans l'email |

---

## ✅ Une fois résolu

Après avoir résolu le problème :

1. Vous devriez voir "Connexion réussie..."
2. Vous serez redirigé vers le dashboard
3. L'application devrait fonctionner normalement

Si vous voyez un nouveau message d'erreur, consultez le tableau ci-dessus pour identifier la cause.

