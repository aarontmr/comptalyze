# 📸 Guide de Génération de Mockup Dashboard

Ce guide vous explique comment générer un screenshot du dashboard et l'intégrer dans un mockup d'ordinateur portable.

## Méthode 1 : Script Automatique (Recommandé)

### Prérequis

```bash
npm install puppeteer
```

### Option A : Sans authentification (si le dashboard est public)

```bash
node scripts/generate-dashboard-screenshot.js
```

### Option B : Avec authentification

```bash
DASHBOARD_URL=http://localhost:3000/dashboard \
EMAIL=votre@email.com \
PASSWORD=votre_mot_de_passe \
node scripts/generate-dashboard-screenshot-with-auth.js
```

Le screenshot sera généré dans `public/mockups/dashboard-screenshot.png`

## Méthode 2 : Screenshot Manuel

### Étape 1 : Prendre le screenshot

1. Ouvrez votre dashboard dans le navigateur
2. Ajustez la taille de la fenêtre à 1920x1080px (ou utilisez les outils développeur)
3. Prendre un screenshot :
   - **Windows** : `Win + Shift + S` ou `Alt + Print Screen`
   - **Mac** : `Cmd + Shift + 4` puis sélectionnez la zone
   - **Linux** : `Print Screen` ou `Shift + Print Screen`

### Étape 2 : Utiliser un outil de mockup

#### Option A : Smartmockups (Gratuit avec compte)

1. Allez sur https://smartmockups.com/
2. Recherchez "laptop mockup"
3. Téléchargez votre screenshot
4. L'outil l'intègre automatiquement dans le mockup

#### Option B : Screely (Gratuit)

1. Allez sur https://www.screely.com/
2. Téléchargez votre screenshot
3. Choisissez un template d'ordinateur portable
4. Téléchargez le résultat

#### Option C : Placeit (Payant mais professionnel)

1. Allez sur https://placeit.net/
2. Recherchez "laptop mockup"
3. Téléchargez votre screenshot
4. Personnalisez l'angle, l'éclairage, etc.

#### Option D : Figma (Gratuit)

1. Créez un compte Figma (gratuit)
2. Importez votre screenshot
3. Utilisez un plugin de mockup (ex: "Mockup" ou "Device Frames")
4. Exportez le résultat

## Méthode 3 : CSS/HTML Mockup (Pour le site web)

Si vous voulez intégrer le mockup directement sur votre site :

### Template HTML simple

```html
<div class="laptop-mockup">
  <div class="laptop-screen">
    <img src="/mockups/dashboard-screenshot.png" alt="Dashboard Comptalyze" />
  </div>
  <div class="laptop-base"></div>
</div>
```

### CSS pour le mockup

```css
.laptop-mockup {
  position: relative;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.laptop-screen {
  position: relative;
  padding: 2.5% 2.5% 0 2.5%;
  background: #1a1a1a;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.laptop-screen img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 8px;
}

.laptop-base {
  height: 20px;
  background: linear-gradient(to bottom, #2a2a2a, #1a1a1a);
  border-radius: 0 0 8px 8px;
  margin: 0 8%;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.laptop-base::after {
  content: '';
  display: block;
  width: 200px;
  height: 4px;
  background: #0a0a0a;
  margin: 8px auto;
  border-radius: 2px;
}
```

## Méthode 4 : Utiliser un service en ligne

### Screenshot.rocks
1. Allez sur https://screenshot.rocks/
2. Collez l'URL de votre dashboard
3. Choisissez un device (MacBook, etc.)
4. Téléchargez le mockup

### Mockup World
1. Allez sur https://www.mockupworld.co/
2. Téléchargez un template PSD gratuit
3. Ouvrez-le dans Photoshop/GIMP
4. Remplacez l'image placeholder par votre screenshot

## Recommandations

### Dimensions optimales
- **Largeur** : 1920px (Full HD)
- **Hauteur** : 1080px ou plus (selon le contenu)
- **Résolution** : 2x pour les écrans Retina (3840x2160)

### Qualité de l'image
- Format PNG pour les captures d'écran
- Compression optimale pour le web (utilisez TinyPNG)
- Poids recommandé : < 500KB pour le web

### Angles de vue
- **Vue de face** : Pour les landing pages
- **Vue 3/4** : Pour un effet plus dynamique
- **Vue latérale** : Pour les portfolios

## Intégration dans le site

Une fois le mockup généré, vous pouvez l'utiliser dans :

1. **Page d'accueil** : Section "Aperçu du dashboard"
2. **Page de pricing** : Montrer l'interface
3. **Page de démo** : Présentation visuelle
4. **Blog** : Articles sur les fonctionnalités

## Exemple d'utilisation dans Next.js

```tsx
import Image from 'next/image';

export default function DashboardPreview() {
  return (
    <div className="laptop-mockup">
      <div className="laptop-screen">
        <Image
          src="/mockups/dashboard-screenshot.png"
          alt="Dashboard Comptalyze"
          width={1920}
          height={1080}
          priority
        />
      </div>
      <div className="laptop-base"></div>
    </div>
  );
}
```

## Outils supplémentaires

- **TinyPNG** : Compression d'images (https://tinypng.com/)
- **Remove.bg** : Supprimer le fond si nécessaire
- **Canva** : Créer des mockups avec des templates
- **Adobe Express** : Alternative gratuite à Photoshop

