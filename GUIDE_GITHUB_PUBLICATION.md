# 📤 Publication sur GitHub - Guide Complet

## 🎯 Objectif

Publier votre projet Comptalyze sur GitHub pour :
- ✅ Sauvegarder votre code
- ✅ Versionner vos modifications
- ✅ Collaborer avec d'autres développeurs
- ✅ Déployer facilement sur Vercel

---

## 🚀 Étape 1 : Créer un Repo GitHub

### Option A : Via l'Interface Web (Recommandé)

1. **Allez sur** : https://github.com/new
2. **Repository name** : `comptalyze` (ou le nom de votre choix)
3. **Description** : "SaaS de comptabilité pour micro-entrepreneurs français"
4. **Visibilité** :
   - ✅ **Private** (recommandé) : Seul vous pouvez voir le code
   - ⚠️ **Public** : Tout le monde peut voir le code
5. **NE PAS** cocher "Initialize with README" (vous en avez déjà un)
6. **Cliquez** sur "Create repository"

### Option B : Via GitHub CLI (Avancé)

```bash
gh repo create comptalyze --private --source=. --remote=origin
```

---

## 🔒 Étape 2 : Sécuriser les Secrets

**CRITIQUE** : Ne jamais commit les clés API !

### Vérifier le .gitignore

Le fichier `.gitignore` doit contenir :

```
# Fichiers à ne JAMAIS commit
.env.local
.env
.env*.local

# Clés et secrets
*.pem
*.key

# Node modules
node_modules/
```

### Vérifier que .env.local n'est PAS tracké

```powershell
git status
```

Si vous voyez `.env.local` en rouge/vert :

```powershell
git rm --cached .env.local
git add .gitignore
git commit -m "fix: remove .env.local from git"
```

---

## 💻 Étape 3 : Initialiser Git (si pas déjà fait)

### Vérifier si Git est initialisé

```powershell
git status
```

**Si ça marche** : Git est déjà initialisé, passez à l'étape 4  
**Si erreur** : Suivez les commandes ci-dessous

### Initialiser Git

```powershell
# Initialiser le repo
git init

# Ajouter tous les fichiers (sauf ceux dans .gitignore)
git add .

# Premier commit
git commit -m "feat: Initial commit - Comptalyze SaaS"
```

---

## 🔗 Étape 4 : Connecter à GitHub

### Ajouter l'origin remote

Remplacez `VOTRE-USERNAME` par votre nom d'utilisateur GitHub :

```powershell
git remote add origin https://github.com/VOTRE-USERNAME/comptalyze.git
```

**Exemple** :
```powershell
git remote add origin https://github.com/badav/comptalyze.git
```

### Vérifier la connexion

```powershell
git remote -v
```

Vous devriez voir :
```
origin  https://github.com/VOTRE-USERNAME/comptalyze.git (fetch)
origin  https://github.com/VOTRE-USERNAME/comptalyze.git (push)
```

---

## 🚀 Étape 5 : Pousser le Code

### Première publication

```powershell
# Renommer la branche en "main" (convention moderne)
git branch -M main

# Pousser le code
git push -u origin main
```

### Authentification

GitHub vous demandera de vous authentifier :

**Option 1 : GitHub Desktop (Plus simple)**
- Téléchargez GitHub Desktop : https://desktop.github.com/
- Connectez-vous avec votre compte
- Clonez le repo depuis GitHub Desktop

**Option 2 : Personal Access Token (CLI)**
1. Allez sur : https://github.com/settings/tokens
2. "Generate new token" → "Generate new token (classic)"
3. Cochez : `repo` (full control)
4. Copiez le token (commence par `ghp_...`)
5. Utilisez-le comme mot de passe quand Git vous le demande

**Option 3 : SSH (Avancé)**
```powershell
# Générer une clé SSH
ssh-keygen -t ed25519 -C "votre-email@example.com"

# Ajouter la clé à GitHub
cat ~/.ssh/id_ed25519.pub
# Copiez le contenu et ajoutez-le sur https://github.com/settings/keys

# Changer l'URL du remote en SSH
git remote set-url origin git@github.com:VOTRE-USERNAME/comptalyze.git
```

---

## ✅ Étape 6 : Vérifier la Publication

1. **Allez sur** : https://github.com/VOTRE-USERNAME/comptalyze
2. **Vérifiez** : Vous voyez tous vos fichiers
3. **Vérifiez** : `.env.local` n'est PAS visible (important !)

---

## 🔄 Workflow Quotidien

### Après Chaque Modification

```powershell
# 1. Voir les fichiers modifiés
git status

# 2. Ajouter les modifications
git add .

# 3. Commit avec un message clair
git commit -m "feat: amélioration du chatbot"

# 4. Pousser sur GitHub
git push
```

### Messages de Commit Recommandés

Suivez la convention **Conventional Commits** :

```
feat: nouvelle fonctionnalité
fix: correction de bug
docs: modification de documentation
style: formatage, pas de changement de code
refactor: refactoring du code
test: ajout de tests
chore: tâches de maintenance
```

**Exemples** :
```powershell
git commit -m "feat: ajout du chatbot IA ComptaBot"
git commit -m "fix: correction erreur d'hydration React"
git commit -m "docs: mise à jour du README"
git commit -m "style: amélioration du design du chatbot"
```

---

## 🌿 Branches (Optionnel mais Recommandé)

### Créer une Branche de Dev

```powershell
# Créer et basculer sur une branche dev
git checkout -b dev

# Travailler sur cette branche
# ... vos modifications ...

# Commit et push sur dev
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push -u origin dev
```

### Merger dans Main

Quand votre fonctionnalité est prête :

```powershell
# Retour sur main
git checkout main

# Merger dev dans main
git merge dev

# Pousser main
git push
```

---

## 🔐 Variables d'Environnement sur Vercel

Après avoir publié sur GitHub, pour déployer sur Vercel :

1. **Allez sur** : https://vercel.com
2. **Import Project** → Sélectionnez votre repo GitHub
3. **Environment Variables** → Ajoutez TOUTES vos variables :

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
OPENAI_API_KEY=sk-proj-...
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
COMPANY_FROM_EMAIL=no-reply@comptalyze.com
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Le...
RECAPTCHA_SECRET_KEY=6Le...
NEXT_PUBLIC_BASE_URL=https://comptalyze.com
```

4. **Deploy** !

---

## 📋 Checklist Complète

### Avant de Publier

- [ ] `.gitignore` contient `.env.local`
- [ ] `.env.local` n'est PAS tracké par Git
- [ ] Code testé en local (pas d'erreurs)
- [ ] README.md à jour
- [ ] Pas de clés API en dur dans le code

### Publication

- [ ] Repo créé sur GitHub
- [ ] Git initialisé localement
- [ ] Remote origin ajouté
- [ ] Code poussé sur GitHub
- [ ] `.env.local` n'apparaît PAS sur GitHub

### Après Publication

- [ ] Vérifier que le repo est visible sur GitHub
- [ ] Variables d'environnement ajoutées sur Vercel
- [ ] Déploiement Vercel réussi
- [ ] Site en production fonctionne

---

## 🆘 Problèmes Courants

### "error: remote origin already exists"

```powershell
git remote remove origin
git remote add origin https://github.com/VOTRE-USERNAME/comptalyze.git
```

### "Permission denied (publickey)"

Utilisez HTTPS au lieu de SSH :
```powershell
git remote set-url origin https://github.com/VOTRE-USERNAME/comptalyze.git
```

### "! [rejected] main -> main (fetch first)"

```powershell
git pull origin main --rebase
git push
```

### ".env.local apparaît sur GitHub"

**URGENT** : Supprimez-le immédiatement !

```powershell
# Supprimer du repo (pas du disque)
git rm --cached .env.local

# Commit
git commit -m "fix: remove sensitive .env.local"

# Push
git push
```

Ensuite :
1. **Régénérez TOUTES vos clés API** (Supabase, OpenAI, Stripe, etc.)
2. Considérez le repo comme compromis si c'était public

---

## 📚 Ressources

- **Documentation Git** : https://git-scm.com/doc
- **GitHub Guides** : https://guides.github.com/
- **Vercel Docs** : https://vercel.com/docs
- **Conventional Commits** : https://www.conventionalcommits.org/

---

## 🎉 Félicitations !

Votre projet est maintenant sur GitHub ! 🚀

**Prochaines étapes** :
1. Configurez le déploiement automatique sur Vercel
2. Ajoutez un README.md détaillé
3. Créez des branches pour les nouvelles features
4. Utilisez des Pull Requests pour review le code

---

**Bon développement ! 💻**


