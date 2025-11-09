# Guide : Démo Animée Hero Comptalyze

## 📋 Vue d'ensemble

Ce guide explique comment générer et intégrer la démo animée pour la section hero de Comptalyze.

La démo montre en 12-15 secondes le parcours utilisateur :
- ✅ Saisie du chiffre d'affaires
- ✅ Calcul des cotisations et du net
- ✅ Visualisation graphique
- ✅ Pré-remplissage URSSAF

## 🎯 Sorties générées

- `public/hero-demo.mp4` : Vidéo optimisée (1280×720, ≤ 8 Mo)
- `public/hero-demo.gif` : GIF animé en boucle (≤ 2 Mo)

## 🚀 Installation

### Prérequis

1. **ffmpeg** (obligatoire pour l'encodage)
   ```bash
   # Windows (avec Chocolatey)
   choco install ffmpeg

   # macOS
   brew install ffmpeg

   # Linux
   sudo apt install ffmpeg
   ```

2. **gifsicle** (optionnel, pour optimisation avancée)
   ```bash
   # Windows
   choco install gifsicle

   # macOS
   brew install gifsicle

   # Linux
   sudo apt install gifsicle
   ```

3. **Dépendances npm**
   ```bash
   npm install
   ```

   Les packages suivants seront installés :
   - `puppeteer` : pour capturer la démo
   - `mime-types` : pour le serveur local

## 📦 Commandes disponibles

### 1. Génération complète (recommandé)

```bash
npm run demo:build
```

Cette commande :
- Lance le serveur local
- Enregistre la démo avec Puppeteer
- Génère le MP4 optimisé
- Crée le GIF optimisé
- Optimise le GIF avec gifsicle (si installé)

### 2. Enregistrement seul

```bash
npm run demo:record
```

Génère uniquement le MP4 et le GIF sans optimisation supplémentaire.

### 3. Optimisation du GIF

```bash
npm run demo:optimize
```

Optimise un GIF existant avec gifsicle (réduit la taille de 20-40%).

### 4. Depuis une vidéo existante

Si vous avez une capture d'écran de votre dashboard :

```bash
npm run demo:fromRaw path/to/votre-video.mp4
```

Cette variante :
- Détecte automatiquement la meilleure portion de 12-15s
- Ajoute un overlay "Comptalyze" pendant 1s
- Redimensionne en 1280×720
- Génère MP4 et GIF optimisés

## ⚙️ Configuration

Éditez `scripts/config.json` pour personnaliser :

```json
{
  "durationSec": 15,           // Durée de la démo
  "fps": 24,                   // Framerate
  "width": 1280,               // Largeur
  "height": 720,               // Hauteur
  "primaryColor": "#0b5cff",   // Couleur d'accent
  "maxMp4Size": 8388608,       // Taille max MP4 (8 Mo)
  "maxGifSize": 2097152        // Taille max GIF (2 Mo)
}
```

## 🎨 Prévisualiser la démo

Pour voir la démo en action avant d'enregistrer :

1. Lancez un serveur local :
   ```bash
   npx serve .
   ```

2. Ouvrez dans votre navigateur :
   ```
   http://localhost:3000/demo/hero-preview.html
   ```

## 🔧 Intégration dans le site

### Option 1 : Vidéo MP4 (recommandé)

Intégrez dans votre section hero avec ce code :

```tsx
<video
  className="w-full rounded-2xl shadow-2xl"
  autoPlay
  muted
  loop
  playsInline
  poster="/hero-demo-poster.jpg"
  aria-label="Démo de Comptalyze : calculez vos cotisations en un clic"
>
  <source src="/hero-demo.mp4" type="video/mp4" />
  Votre navigateur ne supporte pas la vidéo HTML5.
</video>
```

**Avantages :**
- ✅ Meilleure qualité
- ✅ Taille optimisée
- ✅ Bon support navigateurs

### Option 2 : GIF animé

Pour un fallback ou si vous préférez :

```tsx
<img
  src="/hero-demo.gif"
  alt="Démo Comptalyze : calculez vos cotisations en un clic"
  className="w-full rounded-2xl shadow-2xl"
  loading="lazy"
/>
```

**Avantages :**
- ✅ Fonctionne partout (même anciens navigateurs)
- ✅ Pas besoin de bouton play
- ✅ Boucle automatique garantie

### Option 3 : Hybrid avec fallback

```tsx
<video
  className="w-full rounded-2xl shadow-2xl"
  autoPlay
  muted
  loop
  playsInline
  onError={(e) => {
    // Fallback vers GIF si la vidéo échoue
    e.currentTarget.style.display = 'none';
    document.getElementById('demo-fallback').style.display = 'block';
  }}
>
  <source src="/hero-demo.mp4" type="video/mp4" />
</video>
<img
  id="demo-fallback"
  src="/hero-demo.gif"
  alt="Démo Comptalyze"
  className="w-full rounded-2xl shadow-2xl hidden"
/>
```

## 📊 Exemple d'intégration complète

Voici un composant React Next.js complet pour votre hero :

```tsx
// app/components/HeroDemo.tsx
'use client';

import { useState } from 'react';

export default function HeroDemo() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-2xl">
      {/* Skeleton pendant le chargement */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 animate-pulse" />
      )}

      {/* Vidéo */}
      <video
        className="w-full"
        autoPlay
        muted
        loop
        playsInline
        onLoadedData={() => setIsLoaded(true)}
        aria-label="Démo de Comptalyze : calculez vos cotisations en un clic"
      >
        <source src="/hero-demo.mp4" type="video/mp4" />
        {/* Fallback GIF pour anciens navigateurs */}
        <img
          src="/hero-demo.gif"
          alt="Démo Comptalyze"
          className="w-full"
        />
      </video>

      {/* Badge "Démo interactive" */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold text-[#0b5cff] shadow-lg">
        ▶️ Démo interactive
      </div>
    </div>
  );
}
```

Puis dans votre page hero :

```tsx
// app/page.tsx
import HeroDemo from './components/HeroDemo';

export default function HomePage() {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Colonne texte */}
        <div>
          <h1 className="text-5xl font-bold mb-6">
            Gérez votre micro-entreprise en toute simplicité
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Calculez vos cotisations, suivez votre CA et pré-remplissez l'URSSAF en un clic.
          </p>
          <button className="bg-[#0b5cff] text-white px-8 py-4 rounded-xl font-semibold">
            Commencer gratuitement
          </button>
        </div>

        {/* Colonne démo */}
        <div>
          <HeroDemo />
        </div>
      </div>
    </section>
  );
}
```

## 🎯 Optimisations de performance

### 1. Lazy loading

Pour améliorer le LCP (Largest Contentful Paint) :

```tsx
<video
  loading="lazy"
  // ... autres props
/>
```

### 2. Preload conditionnel

Sur desktop uniquement (pour économiser la bande passante mobile) :

```tsx
<link
  rel="preload"
  href="/hero-demo.mp4"
  as="video"
  media="(min-width: 768px)"
/>
```

### 3. Créer un poster

Extrayez une frame comme poster :

```bash
ffmpeg -i public/hero-demo.mp4 -ss 00:00:05 -frames:v 1 public/hero-demo-poster.jpg
```

Puis utilisez-le :

```tsx
<video poster="/hero-demo-poster.jpg" ... />
```

## 🐛 Dépannage

### Le MP4 est trop lourd (> 8 Mo)

Modifiez le CRF dans `scripts/render-preview.mjs` :

```js
'-crf', '26', // Au lieu de '23' (valeurs plus élevées = plus petit)
```

### Le GIF est trop lourd (> 2 Mo)

Le script réduit automatiquement à 960×540. Si encore trop lourd :

1. Réduisez la durée dans `config.json` :
   ```json
   "durationSec": 12
   ```

2. Ou réduisez les FPS :
   ```json
   "fps": 20
   ```

### Puppeteer plante sur Windows

Si vous obtenez des erreurs de sandbox :

```bash
# Installez les dépendances Chrome
npm install puppeteer --force
```

### ffmpeg non reconnu

Vérifiez l'installation :

```bash
ffmpeg -version
```

Si non trouvé, ajoutez-le à votre PATH ou spécifiez le chemin complet dans les scripts.

## 📈 Checklist avant déploiement

- [ ] MP4 généré (1280×720, ≤ 8 Mo)
- [ ] GIF généré (≤ 2 Mo)
- [ ] Vidéo testée sur Chrome, Firefox, Safari
- [ ] Attributs `autoplay`, `muted`, `loop`, `playsInline` présents
- [ ] `aria-label` descriptif ajouté
- [ ] Poster image créé (optionnel mais recommandé)
- [ ] Performance testée (Lighthouse score)

## 🎨 Personnalisation avancée

### Modifier le parcours de la démo

Éditez `demo/hero-preview.html` :

- **Timeline** : section `<script>` → objet `timeline`
- **Textes** : directement dans le HTML
- **Couleurs** : section `<style>` ou `config.json`
- **Durées** : ajustez les `setTimeout` dans le script

### Ajouter des éléments

Exemple : ajouter un logo

```html
<!-- Dans demo/hero-preview.html -->
<div class="logo">
  <img src="/logo.png" alt="Comptalyze" />
</div>
```

## 🆘 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs dans la console
2. Assurez-vous que ffmpeg et les dépendances npm sont installés
3. Testez d'abord la page HTML manuellement
4. Consultez les issues GitHub du projet

## 📝 Licence

Ce système de génération de démo fait partie du projet Comptalyze.








