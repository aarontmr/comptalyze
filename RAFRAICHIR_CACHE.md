# 🔄 Rafraîchir le cache pour voir les changements

Le bouton IA est bien configuré pour être **en bas à droite**, mais vous devez rafraîchir :

## Solution rapide

1. **Arrêtez le serveur** (Ctrl + C dans le terminal)
2. **Supprimez le cache Next.js** :
   ```bash
   rmdir /s /q .next
   ```
3. **Redémarrez** :
   ```bash
   npm run dev
   ```
4. **Dans votre navigateur** : Ctrl + F5 (hard refresh)

## Vérification

Le bouton IA devrait maintenant être :
- ✅ En **bas** à droite (pas en haut)
- ✅ À 24px du bord inférieur
- ✅ Rond (56px × 56px)

## Si ça ne fonctionne toujours pas

Ouvrez la console du navigateur (F12) et tapez :
```javascript
document.querySelector('button[aria-label*="assistant"]').style.bottom
```

Ça devrait afficher `"24px"` (ou `"1.5rem"`).


