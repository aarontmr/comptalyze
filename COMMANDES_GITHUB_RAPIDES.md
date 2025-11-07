# ⚡ Commandes GitHub - Aide-Mémoire Rapide

## 🚀 Publication Initiale (À faire UNE fois)

```powershell
# 1. Initialiser Git (si pas déjà fait)
git init

# 2. Ajouter tous les fichiers
git add .

# 3. Premier commit
git commit -m "feat: Initial commit - Comptalyze avec ChatBot IA"

# 4. Connecter à GitHub (remplacez VOTRE-USERNAME)
git remote add origin https://github.com/VOTRE-USERNAME/comptalyze.git

# 5. Pousser sur GitHub
git branch -M main
git push -u origin main
```

---

## 🔄 Workflow Quotidien (Après chaque modification)

```powershell
# 1. Voir les fichiers modifiés
git status

# 2. Ajouter tous les changements
git add .

# 3. Commit avec message descriptif
git commit -m "feat: amélioration chatbot ComptaBot"

# 4. Pousser sur GitHub
git push
```

---

## 📝 Messages de Commit Recommandés

```powershell
# Nouvelle fonctionnalité
git commit -m "feat: ajout du chatbot IA ComptaBot"

# Correction de bug
git commit -m "fix: correction erreur mémoire Next.js"

# Documentation
git commit -m "docs: mise à jour README"

# Amélioration style/UI
git commit -m "style: design chatbot plus moderne"

# Refactoring
git commit -m "refactor: optimisation API chatbot"
```

---

## 🔧 Commandes Utiles

```powershell
# Voir l'historique des commits
git log --oneline

# Voir les différences non commitées
git diff

# Annuler les modifications locales (ATTENTION: perte de données)
git checkout .

# Annuler le dernier commit (garde les modifications)
git reset --soft HEAD~1

# Voir les branches
git branch

# Changer de branche
git checkout nom-de-branche

# Créer et changer de branche
git checkout -b nouvelle-branche
```

---

## 🆘 Urgence : .env.local sur GitHub

```powershell
# 1. Supprimer du repo (PAS du disque)
git rm --cached .env.local

# 2. Vérifier que .gitignore contient .env.local
echo ".env.local" >> .gitignore

# 3. Commit
git commit -m "fix: remove sensitive .env.local"

# 4. Push
git push

# 5. IMPORTANT : Régénérez TOUTES vos clés API !
```

---

## ✅ Checklist Avant Chaque Push

- [ ] Code testé localement (pas d'erreurs)
- [ ] `.env.local` n'est PAS dans les fichiers à commit
- [ ] Message de commit clair et descriptif
- [ ] Pas de `console.log()` de debug inutiles

---

## 🎯 Pour Aujourd'hui

**Copiez-collez ces commandes dans PowerShell** :

```powershell
# Créer le repo sur GitHub d'abord (https://github.com/new)
# Puis exécutez (remplacez VOTRE-USERNAME) :

git init
git add .
git commit -m "feat: Comptalyze SaaS avec ChatBot IA ComptaBot"
git remote add origin https://github.com/VOTRE-USERNAME/comptalyze.git
git branch -M main
git push -u origin main
```

**Fait ! Votre code est sur GitHub ! 🎉**

