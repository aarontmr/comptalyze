# Démo Hero Comptalyze

Ce dossier contient la page de démo animée pour la section hero de Comptalyze.

## 📁 Contenu

- `hero-preview.html` : Page HTML autonome avec animations CSS/JS
  - Police : Poppins via Google Fonts
  - Couleur principale : #0b5cff
  - Durée : 15 secondes en boucle
  - Viewport : 1280×720 (16:9)

## 🎬 Animation

### Timeline (15 secondes)

| Temps | Action |
|-------|--------|
| 0-2s | Affichage du champ CA + auto-typing "3 000 €" |
| 2-3s | Clic bouton "Calculer" + loader |
| 3-7s | Apparition des résultats (cotisations, net, badge) |
| 7-10s | Animation du graphique de croissance |
| 10-12s | Affichage section "Pré-remplissage URSSAF" |
| 12-15s | Fade-out progressif avant boucle |

## 🖼️ Aperçu local

Pour prévisualiser en local :

```bash
# Option 1 : Avec npx
npx serve .
# Puis ouvrir http://localhost:3000/demo/hero-preview.html

# Option 2 : Avec Python
python -m http.server 8000
# Puis ouvrir http://localhost:8000/demo/hero-preview.html

# Option 3 : Avec Node.js
node -e "require('http').createServer((req, res) => { const fs = require('fs'); const path = require('path'); const file = path.join(__dirname, req.url === '/' ? 'demo/hero-preview.html' : req.url); fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end('Not found'); } else { res.writeHead(200); res.end(data); } }); }).listen(3000);"
# Puis ouvrir http://localhost:3000/demo/hero-preview.html
```

## 🎨 Personnalisation

### Modifier les couleurs

Dans `hero-preview.html`, section `<style>` :

```css
/* Couleur principale */
--accent: #0b5cff;

/* Textes */
--text-dark: #0b1220;
--text-normal: #1f2937;
--text-muted: #6b7280;

/* Fonds */
--bg-card: #f6f8ff;
--bg-border: #e6e9f5;
```

### Modifier les textes

Dans `hero-preview.html`, section HTML :

- Champ : `placeholder="Ex. 3 000 €"`
- Bouton : `<span id="btn-text">Calculer</span>`
- Résultats : dans `.result-card`
- URSSAF : dans `.urssaf-section`

### Modifier la timeline

Dans `hero-preview.html`, objet `timeline` :

```js
// Exemple : ralentir l'animation
setTimeout(() => {
  this.typeNumber();
}, 1000); // Au lieu de 600
```

## 🚀 Générer les vidéos

Voir le fichier `GUIDE_DEMO_HERO.md` à la racine du projet pour :
- Installer ffmpeg et les dépendances
- Lancer l'enregistrement avec Puppeteer
- Générer MP4 et GIF optimisés
- Intégrer dans le site

## 📊 Spécifications techniques

- **Format** : HTML5 + CSS3 + Vanilla JS
- **Police** : Poppins (Google Fonts)
- **Dimensions** : 1280×720 px (16:9)
- **Durée** : 15 secondes
- **Framerate cible** : 24 fps
- **Compatibilité** : Tous navigateurs modernes
- **Accessibilité** : ARIA labels, contrastes AA

## 🔍 Détails d'animation

### Effets utilisés

- **Fade in/out** : `opacity` + `transform: translateY()`
- **Scale pulse** : `transform: scale()` avec cubic-bezier
- **Typing** : Ajout progressif de caractères avec intervalle
- **Loader** : Rotation CSS `@keyframes spin`
- **Barres graphique** : Height animée avec transition
- **Cursor blink** : Opacité alternée `@keyframes blink`

### Easings

- Entrées : `cubic-bezier(0.34, 1.56, 0.64, 1)` (bounce léger)
- Sorties : `ease-out`
- Loops : `step-end` (cursor)
- Hovers : `ease` standard

## 📦 Taille du fichier

- HTML complet : ~11 Ko
- Avec Google Fonts : +20 Ko (première visite)
- Total : ~31 Ko (décompressé)

## 🎯 Usage

Ce fichier est utilisé par :

1. **Scripts d'enregistrement** : `scripts/render-preview.mjs`
   - Puppeteer charge cette page
   - Capture 360 frames (24 fps × 15s)
   - Encode en MP4 et GIF

2. **Prévisualisation** : Ouverture directe dans le navigateur
   - Utile pour développer/ajuster l'animation
   - Pas besoin de regénérer les vidéos à chaque modif

3. **Tests** : Vérification visuelle avant enregistrement final

## 🐛 Debug

Pour debugger l'animation :

1. Ouvrez `hero-preview.html` dans le navigateur
2. Ouvrez la console développeur (F12)
3. La variable `window.__demoReady` devient `true` quand prêt
4. Les timings sont affichés dans les `setTimeout`

Pour ralentir l'animation pendant le dev :

```js
// Multipliez tous les setTimeout par 2
setTimeout(() => {
  this.typeNumber();
}, 600 * 2); // Ralenti 2×
```

## 📝 Notes

- Le fichier est autonome : aucune dépendance externe (sauf Google Fonts)
- Les animations sont pilotées en JavaScript pour un contrôle précis du timing
- Le layout est responsive mais optimisé pour 1280×720
- Pas de son : démo visuelle uniquement
- Conçu pour être enregistré, pas pour être interactif

## 🔗 Ressources

- Guide complet : `/GUIDE_DEMO_HERO.md`
- Configuration : `/scripts/config.json`
- Scripts : `/scripts/render-preview.mjs`, `trim-and-gif.mjs`, `optimize-gif.mjs`






