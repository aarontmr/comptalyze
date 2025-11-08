# 🚀 Démarrage Rapide - Démo Hero

Guide ultra-rapide pour générer votre démo animée Comptalyze en 5 minutes.

## ⚡ En bref

```bash
# 1. Vérifier les dépendances
npm run check-demo

# 2. Installer les packages (si nécessaire)
npm install

# 3. Générer la démo complète
npm run demo:build

# 4. Résultat : public/hero-demo.mp4 + public/hero-demo.gif
```

## 📋 Prérequis (une seule fois)

### Windows

```powershell
# Installer ffmpeg (avec Chocolatey)
choco install ffmpeg

# Optionnel : gifsicle pour optimisation
choco install gifsicle
```

### macOS

```bash
# Installer ffmpeg
brew install ffmpeg

# Optionnel : gifsicle
brew install gifsicle
```

### Linux

```bash
# Installer ffmpeg
sudo apt install ffmpeg

# Optionnel : gifsicle
sudo apt install gifsicle
```

## 🎬 Génération

### Option 1 : Démo simulée (automatique)

```bash
npm run demo:build
```

**Résultat :**
- ✅ `public/hero-demo.mp4` (~6-8 Mo)
- ✅ `public/hero-demo.gif` (~1.5-2 Mo)

**Durée :** ~2-3 minutes

### Option 2 : Depuis votre vidéo

Si vous avez déjà capturé votre dashboard :

```bash
npm run demo:fromRaw chemin/vers/votre-video.mp4
```

Le script va automatiquement :
- Extraire le meilleur segment de 12-15s
- Ajouter l'overlay "Comptalyze"
- Générer MP4 + GIF optimisés

## 🎨 Prévisualisation

Avant de générer, testez l'animation :

```bash
# Lancer un serveur local
npx serve .

# Ouvrir dans le navigateur
# http://localhost:3000/demo/hero-preview.html
```

Vous verrez l'animation en temps réel. Modifiez `demo/hero-preview.html` si besoin.

## 🔧 Personnalisation rapide

### Modifier les couleurs

Éditez `scripts/config.json` :

```json
{
  "primaryColor": "#0b5cff"  // Votre couleur d'accent
}
```

### Modifier la durée

```json
{
  "durationSec": 12  // Au lieu de 15
}
```

### Modifier les textes

Éditez `demo/hero-preview.html` :
- Ligne ~93 : `placeholder="Ex. 3 000 €"`
- Ligne ~100 : `<span id="btn-text">Calculer</span>`
- Lignes 108-122 : Valeurs des résultats

## 📦 Intégration (copier-coller)

### Vidéo (recommandé)

```tsx
<video
  className="w-full rounded-2xl shadow-2xl"
  autoPlay
  muted
  loop
  playsInline
  aria-label="Démo de Comptalyze"
>
  <source src="/hero-demo.mp4" type="video/mp4" />
</video>
```

### GIF (fallback)

```tsx
<img
  src="/hero-demo.gif"
  alt="Démo Comptalyze"
  className="w-full rounded-2xl shadow-2xl"
/>
```

**Plus d'exemples :** Voir `demo/integration-examples.html`

## ✅ Checklist

Avant de déployer, vérifiez :

- [ ] `npm run check-demo` passe au vert
- [ ] `public/hero-demo.mp4` existe (≤ 8 Mo)
- [ ] `public/hero-demo.gif` existe (≤ 2 Mo)
- [ ] Vidéo testée sur Chrome, Firefox, Safari
- [ ] Attributs `autoPlay`, `muted`, `loop`, `playsInline` présents

## 🐛 Problèmes courants

### "ffmpeg n'est pas reconnu"

```bash
# Vérifiez l'installation
ffmpeg -version

# Si non trouvé, ajoutez au PATH ou réinstallez
```

### "MP4 trop lourd (> 8 Mo)"

Modifiez `scripts/render-preview.mjs` ligne ~109 :

```js
'-crf', '26',  // Au lieu de '23' (plus petit)
```

### "GIF trop lourd (> 2 Mo)"

Le script réduit automatiquement à 960×540. Si encore trop lourd :

```json
// Dans scripts/config.json
{
  "durationSec": 12  // Réduire la durée
}
```

### "Puppeteer plante"

```bash
# Réinstaller
npm install puppeteer --force
```

## 📚 Documentation complète

Pour aller plus loin :
- **Guide complet :** `GUIDE_DEMO_HERO.md`
- **Exemples d'intégration :** `demo/integration-examples.html`
- **README technique :** `demo/README.md`

## 🎯 Commandes de référence

| Commande | Description |
|----------|-------------|
| `npm run check-demo` | Vérifier les dépendances |
| `npm run demo:record` | Enregistrer sans optimiser |
| `npm run demo:optimize` | Optimiser un GIF existant |
| `npm run demo:build` | Tout générer (record + optimize) |
| `npm run demo:fromRaw <file>` | Depuis vidéo existante |

## ⏱️ Temps estimés

- **Première génération :** 2-3 minutes
- **Régénérations :** 1-2 minutes
- **Depuis vidéo existante :** 30-60 secondes

## 💡 Conseils

1. **Testez d'abord** : Ouvrez `demo/hero-preview.html` pour vérifier l'animation
2. **Personnalisez** : Modifiez couleurs/textes avant de générer
3. **Optimisez** : Installez gifsicle pour des GIF 20-40% plus légers
4. **Prévisualisez** : Générez avec `demo:record`, vérifiez, puis `demo:optimize`

## 🆘 Besoin d'aide ?

```bash
# Vérifier le système
npm run check-demo

# Lire les logs détaillés
npm run demo:build 2>&1 | tee demo-log.txt
```

Les logs vous indiqueront exactement où ça coince.

---

**Prêt ?** Lancez `npm run demo:build` et obtenez vos fichiers en 2 minutes ! 🚀







