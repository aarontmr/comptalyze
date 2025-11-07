# 🚨 Correction Critique : Mémoire Insuffisante

## ⚠️ Problème

Le serveur Next.js **manque de mémoire** et crash au démarrage :
```
FATAL ERROR: JavaScript heap out of memory
```

## 🔧 Solution Complète (3 étapes)

### Étape 1 : Augmentation Mémoire (FAIT ✅)

J'ai augmenté la mémoire allouée de **4 GB → 8 GB** dans `package.json`.

### Étape 2 : Nettoyer le Cache

Le cache Next.js peut être corrompu. **Exécutez ces commandes** :

```powershell
# Arrêtez TOUS les processus Node/Next en cours
# (Appuyez plusieurs fois sur Ctrl+C dans tous les terminaux)

# Puis, dans PowerShell :
Remove-Item -Recurse -Force .next
npm run dev
```

**OU en une seule ligne** :
```powershell
Remove-Item -Recurse -Force .next; npm run dev
```

### Étape 3 : Si Ça Ne Marche TOUJOURS Pas

**Alternative 1 : Redémarrer votre PC**

Parfois des processus Node zombies restent en mémoire. Un redémarrage complet résout ça.

**Alternative 2 : Utiliser une commande spéciale**

Si vous avez plus de 8 GB de RAM, essayez directement :

```powershell
$env:NODE_OPTIONS="--max-old-space-size=12288"; npm run dev
```

(Ça alloue 12 GB temporairement)

---

## 🎯 Commande Complète à Exécuter

**Copiez-collez ceci dans PowerShell** :

```powershell
# 1. Tuer tous les processus Node
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Nettoyer le cache
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# 3. Relancer avec 8 GB
npm run dev
```

---

## 🔍 Vérification

Après avoir exécuté les commandes, vous devriez voir :

```
○ Compiling / ...
✓ Compiled / in Xs
✓ Ready in 10-30s
○ Local: http://localhost:3000
```

**Si vous voyez ça** : ✅ C'est bon !  
**Si erreur à nouveau** : 🔴 Envoyez-moi le message d'erreur

---

## 💾 Combien de RAM Avez-Vous ?

Pour vérifier :

```powershell
Get-CimInstance Win32_ComputerSystem | Select-Object TotalPhysicalMemory
```

**Minimum recommandé** : 8 GB  
**Optimal** : 16 GB ou plus

Si vous avez moins de 8 GB, le développement avec Next.js 16 sera difficile.

---

## 📋 Checklist de Dépannage

- [ ] Tous les terminaux avec Node/Next sont fermés
- [ ] Dossier `.next` supprimé
- [ ] `package.json` modifié (8192 au lieu de 4096) ✅
- [ ] Commande `npm run dev` exécutée
- [ ] Attendre patiemment 20-30 secondes

---

## 🚨 Si Rien Ne Fonctionne

**Dernier recours** : Désactiver temporairement le chatbot

Dans `app/layout.tsx`, commentez cette ligne :

```typescript
// import ChatbotWrapper from './components/ChatbotWrapper';

// Et dans le body :
// <ChatbotWrapper />
```

Cela permettra au serveur de démarrer. Vous pourrez réactiver le chatbot une fois le serveur stable.

---

## 💡 Pourquoi Ce Problème ?

### Causes

1. **Next.js 16** : Plus gourmand en mémoire que les versions précédentes
2. **Projet volumineux** : Beaucoup de composants, pages, MDX
3. **Windows** : Généralement plus gourmand que Linux/Mac
4. **Cache corrompu** : Le dossier `.next` peut contenir des fichiers problématiques

### Solutions Permanentes

- ✅ RAM : Au moins 16 GB recommandé
- ✅ SSD : Améliore les performances de compilation
- ✅ Nettoyer régulièrement : `Remove-Item .next -Recurse -Force`

---

**Exécutez la commande complète ci-dessus et dites-moi ce qui se passe ! 🚀**


