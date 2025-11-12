# ✨ Système de Démo Hero Comptalyze - Documentation Complète

## 📂 Structure des fichiers créés

```
testcomptalyze/
├── demo/
│   ├── hero-preview.html          # Page de démo autonome avec animations
│   ├── README.md                  # Documentation technique de la démo
│   └── integration-examples.html  # 7 exemples d'intégration copy-paste
│
├── scripts/
│   ├── config.json               # Configuration (durée, taille, couleurs)
│   ├── render-preview.mjs        # Script Puppeteer pour enregistrement
│   ├── trim-and-gif.mjs          # Variante depuis MP4 existant
│   ├── optimize-gif.mjs          # Optimisation GIF avec gifsicle
│   └── check-demo-deps.mjs       # Vérification des dépendances
│
├── public/                       # Fichiers générés (gitignored)
│   ├── hero-demo.mp4            # Vidéo finale (≤ 8 Mo)
│   ├── hero-demo.gif            # GIF animé (≤ 2 Mo)
│   └── palette.png              # (temporaire)
│
├── GUIDE_DEMO_HERO.md           # Guide complet avec troubleshooting
├── QUICKSTART_DEMO.md           # Démarrage rapide 5 minutes
└── package.json                 # Commandes npm ajoutées
```

## 🎯 Timeline de l'animation (15 secondes)

| Temps | Élément | Animation |
|-------|---------|-----------|
| **0-2s** | Champ CA | Cursor blink → auto-typing "3 000 €" |
| **2-3s** | Bouton | Click animation → loader rotatif |
| **3-7s** | Résultats | Fade-in + scale des 3 tuiles avec stagger |
| | | • Cotisations : 660 € |
| | | • Revenu net : 2 340 € |
| | | • Badge "À jour ✅" |
| **7-10s** | Graphique | Barres qui montent (M-1 → M) + "+12%" |
| **10-12s** | URSSAF | Fade-in section "Pré-remplissage en 1 clic" |
| **12-15s** | Boucle | Fade-out progressif → restart |

## 🎨 Design System

### Couleurs

```css
/* Palette Comptalyze */
--accent: #0b5cff;           /* Bleu principal */
--text-title: #0b1220;       /* Titres */
--text-body: #1f2937;        /* Texte normal */
--text-muted: #6b7280;       /* Labels */
--bg-card: #f6f8ff;          /* Fond des cartes */
--border: #e6e9f5;           /* Bordures */
--success: #10b981;          /* Vert de succès */
```

### Typographie

- **Police** : Poppins (Google Fonts)
- **Weights** : 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- **Fallback** : `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

### Espacements

- **Cards padding** : 32px (desktop), 24px (mobile)
- **Grid gap** : 16px
- **Border radius** : 12px (cards), 16px (container)

## 📦 Commandes npm disponibles

| Commande | Description | Durée |
|----------|-------------|-------|
| `npm run check-demo` | Vérifier que tout est prêt | 5s |
| `npm run demo:record` | Enregistrer (sans optimiser) | 2 min |
| `npm run demo:optimize` | Optimiser un GIF existant | 30s |
| `npm run demo:build` | ✨ Tout générer (recommandé) | 2-3 min |
| `npm run demo:fromRaw <file>` | Depuis vidéo existante | 1 min |

## ⚙️ Configuration (scripts/config.json)

```json
{
  "durationSec": 15,              // Durée de la démo
  "fps": 24,                      // Framerate (24 = cinématique)
  "width": 1280,                  // Largeur (16:9)
  "height": 720,                  // Hauteur
  "primaryColor": "#0b5cff",      // Couleur d'accent
  "maxMp4Size": 8388608,          // 8 Mo max
  "maxGifSize": 2097152,          // 2 Mo max
  "gifFallbackWidth": 960,        // Si GIF trop lourd
  "gifFallbackHeight": 540        // Réduit à 960×540
}
```

### Paramètres personnalisables

- **durationSec** : 10-20 (recommandé : 12-15)
- **fps** : 20-30 (recommandé : 24)
- **width/height** : Garder ratio 16:9
- **primaryColor** : Votre couleur de marque

## 🚀 Workflow complet

### 1️⃣ Première utilisation

```bash
# Vérifier les dépendances
npm run check-demo

# Si ffmpeg manque, installer (une seule fois)
# Windows : choco install ffmpeg
# macOS   : brew install ffmpeg
# Linux   : sudo apt install ffmpeg

# Installer les packages npm
npm install
```

### 2️⃣ Personnalisation (optionnel)

```bash
# Prévisualiser la démo
npx serve .
# → http://localhost:3000/demo/hero-preview.html

# Modifier si besoin :
# - demo/hero-preview.html (textes, animations)
# - scripts/config.json (durée, couleurs)
```

### 3️⃣ Génération

```bash
# Option A : Démo simulée (automatique)
npm run demo:build

# Option B : Depuis votre vidéo
npm run demo:fromRaw captures/dashboard.mp4
```

### 4️⃣ Intégration

```tsx
// Copier-coller dans votre hero
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

**Voir `demo/integration-examples.html` pour 7 variantes complètes**

## 📊 Spécifications techniques

### Formats générés

| Format | Poids | Résolution | FPS | Codec | Compatibilité |
|--------|-------|------------|-----|-------|---------------|
| **MP4** | 6-8 Mo | 1280×720 | 24 | H.264 (yuv420p) | 97%+ navigateurs |
| **GIF** | 1.5-2 Mo | 1280×720 ou 960×540 | 20 | GIF89a optimisé | 100% navigateurs |

### Optimisations appliquées

**MP4** :
- CRF 23 (qualité/poids équilibré)
- Preset medium (bon compromis)
- Fast start (streaming web)
- Pas d'audio (économie)

**GIF** :
- Palette de 128 couleurs
- Dithering Bayer (scale 3)
- Lossy 80% si gifsicle installé
- Auto-resize si > 2 Mo

## 🎨 Exemples d'intégration

### Basic (Tailwind)

```tsx
<video
  className="w-full rounded-2xl shadow-2xl"
  autoPlay
  muted
  loop
  playsInline
>
  <source src="/hero-demo.mp4" type="video/mp4" />
</video>
```

### Avec skeleton loader

```tsx
<div className="relative rounded-2xl overflow-hidden">
  {!isLoaded && (
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 animate-pulse" />
  )}
  <video
    onLoadedData={() => setIsLoaded(true)}
    className="w-full"
    autoPlay
    muted
    loop
    playsInline
  >
    <source src="/hero-demo.mp4" type="video/mp4" />
  </video>
</div>
```

### Avec badge overlay

```tsx
<div className="relative rounded-2xl overflow-hidden">
  <video className="w-full" autoPlay muted loop playsInline>
    <source src="/hero-demo.mp4" type="video/mp4" />
  </video>
  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold text-[#0b5cff]">
    ▶️ Démo interactive
  </div>
</div>
```

**+4 autres exemples dans `demo/integration-examples.html`**

## 🐛 Troubleshooting

### Problème : "ffmpeg n'est pas reconnu"

```bash
# Vérifier l'installation
ffmpeg -version

# Si non trouvé, installer ou ajouter au PATH
# Windows : vérifier C:\Program Files\ffmpeg\bin
```

### Problème : "MP4 trop lourd (> 8 Mo)"

**Solution 1** : Augmenter la compression

```js
// Dans scripts/render-preview.mjs, ligne ~109
'-crf', '26',  // Au lieu de '23' (26 = plus compressé)
```

**Solution 2** : Réduire la durée

```json
// Dans scripts/config.json
{ "durationSec": 12 }  // Au lieu de 15
```

**Solution 3** : Réduire les FPS

```json
// Dans scripts/config.json
{ "fps": 20 }  // Au lieu de 24
```

### Problème : "GIF trop lourd (> 2 Mo)"

Le script réduit automatiquement à 960×540. Si encore trop lourd :

```json
// Dans scripts/config.json
{
  "durationSec": 10,     // Réduire la durée
  "gifFallbackWidth": 800,
  "gifFallbackHeight": 450
}
```

### Problème : "Puppeteer plante"

```bash
# Réinstaller avec dépendances Chrome
npm install puppeteer --force

# Ou utiliser la variante "fromRaw" depuis une capture d'écran
```

### Problème : "Animation trop rapide/lente"

Éditez `demo/hero-preview.html`, section `<script>` → objet `timeline` :

```js
// Ralentir : multiplier les durées
setTimeout(() => {
  this.typeNumber();
}, 1200);  // Au lieu de 600

// Accélérer : diviser les durées
setTimeout(() => {
  this.typeNumber();
}, 300);  // Au lieu de 600
```

## 🎯 Checklist de déploiement

Avant de pousser en production :

- [ ] `npm run check-demo` passe au vert
- [ ] MP4 généré et < 8 Mo (`ls -lh public/hero-demo.mp4`)
- [ ] GIF généré et < 2 Mo (`ls -lh public/hero-demo.gif`)
- [ ] Vidéo testée sur Chrome (Windows/Mac)
- [ ] Vidéo testée sur Safari (Mac/iOS)
- [ ] Vidéo testée sur Firefox
- [ ] Attributs `autoPlay`, `muted`, `loop`, `playsInline` présents
- [ ] `aria-label` descriptif ajouté
- [ ] Performance testée (Lighthouse > 90)
- [ ] Responsive testé (mobile/tablette/desktop)

## 📈 Optimisations avancées

### Créer un poster image

```bash
# Extraire une frame à 5s comme poster
ffmpeg -i public/hero-demo.mp4 -ss 00:00:05 -frames:v 1 public/hero-demo-poster.jpg
```

Puis :

```tsx
<video poster="/hero-demo-poster.jpg" ...>
```

### Preload conditionnel

```tsx
// Dans <head> (desktop uniquement)
<link
  rel="preload"
  href="/hero-demo.mp4"
  as="video"
  media="(min-width: 768px)"
/>
```

### Lazy loading

```tsx
<video loading="lazy" ...>
```

### Intersection Observer

```tsx
useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        videoRef.current?.play();
      } else {
        videoRef.current?.pause();
      }
    },
    { threshold: 0.5 }
  );
  
  if (videoRef.current) {
    observer.observe(videoRef.current);
  }
  
  return () => observer.disconnect();
}, []);
```

## 🔧 Personnalisation avancée

### Modifier les données affichées

Dans `demo/hero-preview.html` :

```html
<!-- Changer le CA -->
<input placeholder="Ex. 5 000 €" />

<!-- Changer les résultats (lignes 108-122) -->
<div class="result-value">1 100 €</div>  <!-- Cotisations -->
<div class="result-value">3 900 €</div>  <!-- Net -->

<!-- Changer la croissance (ligne 137) -->
<span class="chart-growth">+18%</span>
```

Et dans le script JS (ligne ~200) :

```js
typeNumber: function() {
  const text = '5 000 €';  // Au lieu de '3 000 €'
  // ...
}
```

### Ajouter un élément

Exemple : ajouter un logo :

```html
<!-- Dans demo/hero-preview.html, après <body> -->
<div class="logo-container" style="position: absolute; top: 20px; right: 20px; z-index: 100;">
  <img src="/logo.png" alt="Comptalyze" style="width: 120px;" />
</div>
```

### Changer la palette de couleurs

Dans `demo/hero-preview.html`, section `<style>` :

```css
/* Remplacer toutes les instances de #0b5cff par votre couleur */
/* Exemple : thème violet */
background: #8b5cf6;  /* Au lieu de #0b5cff */
border-color: #8b5cf6;
color: #8b5cf6;
```

## 📚 Documentation de référence

| Fichier | Contenu |
|---------|---------|
| **QUICKSTART_DEMO.md** | Guide ultra-rapide (5 min) |
| **GUIDE_DEMO_HERO.md** | Documentation complète avec troubleshooting |
| **demo/README.md** | Détails techniques de l'animation |
| **demo/integration-examples.html** | 7 exemples d'intégration copy-paste |
| **scripts/config.json** | Configuration centralisée |

## 🎓 Ressources utiles

### Outils

- **ffmpeg** : https://ffmpeg.org/download.html
- **gifsicle** : https://www.lcdf.org/gifsicle/
- **Puppeteer** : https://pptr.dev/

### Inspiration

- Hero animés : https://www.awwwards.com/websites/animation/
- Micro-interactions : https://lawsofux.com/
- Performance : https://web.dev/vitals/

## 💡 Bonnes pratiques

1. **Toujours inclure `muted`** : requis pour autoplay
2. **Toujours inclure `playsInline`** : évite fullscreen sur iOS
3. **Ajouter un poster** : améliore LCP et UX
4. **Lazy load si below fold** : économise la bande passante
5. **Tester sur mobile** : data-saver et autoplay restrictions
6. **Prévoir un fallback** : image statique ou GIF
7. **Accessibilité** : aria-label descriptif
8. **Analytics** : tracker play/complete events

## 🆘 Support

Si vous êtes bloqué :

1. **Vérifier les dépendances** : `npm run check-demo`
2. **Lire les logs** : erreurs détaillées dans la console
3. **Tester manuellement** : ouvrir `demo/hero-preview.html`
4. **Consulter le guide** : `GUIDE_DEMO_HERO.md`
5. **Variante simple** : utiliser `demo:fromRaw` avec une capture

## 🎉 Vous êtes prêt !

Lancez simplement :

```bash
npm run demo:build
```

Et obtenez vos fichiers MP4 + GIF optimisés en 2-3 minutes ! 🚀

---

**Fait avec ❤️ pour Comptalyze**


















