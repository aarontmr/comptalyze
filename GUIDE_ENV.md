# 🔧 Guide : Configuration de .env.local

## ❌ Problème actuel

Les variables `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont **VIDES** dans votre fichier `.env.local`.

## ✅ Solution étape par étape

### Étape 1 : Ouvrez votre fichier .env.local

Le fichier se trouve à la racine du projet :
```
testcomptalyze/
├── .env.local    ← OUVREZ CE FICHIER
├── package.json
└── ...
```

### Étape 2 : Éditez les lignes 3 et 4

Trouvez ces lignes dans votre fichier :
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Étape 3 : Ajoutez vos valeurs APRÈS le signe =

**Exemple correct :**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk4NzY1NCwiZXhwIjoxOTU0NTYzNjU0fQ.xxxxx
```

**❌ INCORRECT - Ne faites PAS ça :**
```env
NEXT_PUBLIC_SUPABASE_URL = https://...    ← Pas d'espaces autour du =
NEXT_PUBLIC_SUPABASE_URL="https://..."   ← Pas de guillemets
NEXT_PUBLIC_SUPABASE_URL https://...      ← Il faut le signe =
```

### Étape 4 : Où trouver vos clés Supabase ?

1. Allez sur [supabase.com](https://supabase.com) et connectez-vous
2. Sélectionnez votre projet
3. Cliquez sur **Settings** (icône d'engrenage en bas à gauche)
4. Cliquez sur **API** dans le menu de gauche
5. Vous verrez :
   - **Project URL** → C'est votre `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → C'est votre `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Étape 5 : Sauvegardez le fichier

Appuyez sur **Ctrl+S** pour sauvegarder (ou File > Save dans votre éditeur)

### Étape 6 : Redémarrez le serveur

**TRÈS IMPORTANT** : Next.js ne lit les variables d'environnement qu'au démarrage !

```bash
# 1. Arrêtez le serveur actuel avec Ctrl+C
# 2. Relancez :
npm run dev
```

### Étape 7 : Vérifiez que ça fonctionne

Vous pouvez exécuter ce script pour vérifier :
```bash
npm run check-env
```

## 📝 Exemple complet de .env.local

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvdHJlLXByb2pldCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjM4OTg3NjU0LCJleHAiOjE5NTQ1NjM2NTR9.xxxxx

# Supabase Service Role (optionnel pour l'instant)
SUPABASE_SERVICE_ROLE_KEY=

# Stripe Configuration (optionnel pour l'instant)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# URL de l'application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## ⚠️ Erreurs courantes

- ❌ Oublier de sauvegarder le fichier après modification
- ❌ Oublier de redémarrer le serveur
- ❌ Mettre des espaces autour du `=`
- ❌ Copier la mauvaise clé (copier `service_role` au lieu de `anon`)
- ❌ Mettre la valeur sur une ligne différente

## 🆘 Besoin d'aide ?

Si après avoir suivi ces étapes l'erreur persiste :

1. Vérifiez avec : `npm run check-env`
2. Assurez-vous que le fichier s'appelle bien `.env.local` (avec le point au début)
3. Assurez-vous qu'il est bien à la racine du projet
4. Redémarrez complètement votre terminal et votre serveur













