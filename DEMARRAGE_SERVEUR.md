# 🚀 Démarrage du Serveur - Guide Rapide

## ✅ Méthode recommandée (PowerShell)

### Option 1 : Script automatique (le plus simple)

```powershell
.\start-dev.ps1
```

Ce script :
- ✅ Arrête automatiquement les anciens processus Node.js
- ✅ Nettoie les fichiers de lock
- ✅ Configure les variables d'environnement correctement
- ✅ Lance Next.js sans Turbopack (plus stable)

---

### Option 2 : Commande manuelle

```powershell
$env:NODE_OPTIONS="--max-old-space-size=8192"
$env:NEXT_PRIVATE_TURBOPACK="false"
npx next dev
```

---

## ⚠️ Problèmes courants et solutions

### Erreur : "Port 3000 is in use"

**Solution** :
```powershell
# Arrêter tous les processus Node.js
Get-Process -Name "node" | Stop-Process -Force

# Puis relancer
.\start-dev.ps1
```

---

### Erreur : "Unable to acquire lock"

**Solution** :
```powershell
# Supprimer le fichier de lock
Remove-Item .next\dev\lock -Force

# Puis relancer
.\start-dev.ps1
```

---

### Erreur : "Turbopack error" / "Out of memory"

**Cause** : Turbopack n'est pas désactivé correctement

**Solution** : Utilisez `.\start-dev.ps1` au lieu de `npm run dev`

---

## 🔧 En cas de problème persistant

### Nettoyage complet

```powershell
# 1. Arrêter tous les processus Node.js
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Supprimer le cache
Remove-Item -Recurse -Force .next

# 3. Attendre 2 secondes
Start-Sleep -Seconds 2

# 4. Relancer
.\start-dev.ps1
```

---

## 📝 Notes importantes

1. **Utilisez toujours `.\start-dev.ps1`** plutôt que `npm run dev` sur Windows
   - Raison : `cross-env` peut avoir des problèmes avec les variables d'environnement sur Windows
   - Le script PowerShell contourne ce problème

2. **Redémarrez TOUJOURS le serveur après avoir modifié `.env.local`**
   - Les variables d'environnement ne sont chargées qu'au démarrage
   - `Ctrl+C` puis `.\start-dev.ps1`

3. **Port par défaut : 3000**
   - Si occupé, Next.js basculera sur 3001
   - Mais c'est mieux de libérer le 3000 avec le nettoyage ci-dessus

---

## ✅ Vérification que le serveur tourne

```powershell
# Vérifier les processus Node.js
Get-Process -Name "node"

# Vérifier quel port est utilisé
Get-NetTCPConnection -State Listen | Where-Object {$_.LocalPort -eq 3000 -or $_.LocalPort -eq 3001}
```

---

## 🎯 Après le démarrage

1. Ouvrez `http://localhost:3000` (ou 3001 si affiché dans les logs)
2. Videz le cache du navigateur : `Ctrl+Shift+R`
3. L'application devrait fonctionner normalement

---

## 🆘 Support

Si après avoir suivi ce guide vous avez encore des problèmes :

1. Copiez les logs du terminal
2. Faites une capture d'écran de l'erreur
3. Indiquez quelle commande vous avez utilisée
4. Contactez le support

---

**TL;DR** : Utilisez `.\start-dev.ps1` pour éviter les problèmes ! 🚀












