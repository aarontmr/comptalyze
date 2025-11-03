# Dépannage - Variables d'environnement

## Erreur : "supabaseUrl is required"

Si vous obtenez cette erreur, suivez ces étapes :

### 1. Vérifiez que le fichier `.env.local` existe

Le fichier doit être à la **racine** du projet (même niveau que `package.json`), pas dans un sous-dossier.

```
testcomptalyze/
├── .env.local          ← ICI !
├── package.json
├── app/
├── lib/
└── ...
```

### 2. Vérifiez le contenu de `.env.local`

Le fichier doit contenir exactement ceci (remplacez par vos vraies valeurs) :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_ici
```

**Important** :
- ✅ Commence par `NEXT_PUBLIC_` (obligatoire pour le côté client)
- ✅ Pas d'espaces autour du `=`
- ✅ Pas de guillemets autour des valeurs
- ✅ Pas de point-virgule à la fin

### 3. Redémarrez le serveur de développement

**TRÈS IMPORTANT** : Après avoir créé ou modifié `.env.local`, vous **DEVEZ** redémarrer le serveur :

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez :
npm run dev
```

Next.js ne lit les variables d'environnement qu'au démarrage. Si vous modifiez `.env.local` sans redémarrer, les changements ne seront pas pris en compte.

### 4. Vérifiez vos clés Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Ouvrez votre projet
3. Allez dans **Settings** > **API**
4. Copiez :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 5. Vérifiez dans la console

Ouvrez la console de votre navigateur (F12) et regardez les erreurs. Le client Supabase devrait maintenant afficher un message d'erreur clair si les variables manquent.

### 6. Test rapide

Créez un fichier de test temporaire `test-env.js` à la racine :

```js
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30));
console.log('KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 10));
```

Puis dans le terminal :
```bash
node -e "require('dotenv').config({path:'.env.local'}); console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

Si cela ne fonctionne pas, installez d'abord dotenv :
```bash
npm install dotenv
```

## Vérifications courantes

- ❌ Le fichier s'appelle `.env` au lieu de `.env.local`
- ❌ Le fichier est dans un mauvais dossier
- ❌ Il y a des espaces : `NEXT_PUBLIC_SUPABASE_URL = valeur` (incorrect)
- ❌ Les valeurs sont entre guillemets : `NEXT_PUBLIC_SUPABASE_URL="valeur"` (inutile mais OK)
- ❌ Oubli de redémarrer le serveur après modification
- ❌ Variables mal nommées (typo dans `NEXT_PUBLIC_`)

## Besoin d'aide ?

Si le problème persiste :
1. Vérifiez que votre fichier `.env.local` contient bien les deux variables requises
2. Redémarrez complètement le serveur (`Ctrl+C` puis `npm run dev`)
3. Videz le cache : supprimez le dossier `.next` et relancez



