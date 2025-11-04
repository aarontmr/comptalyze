/**
 * Script pour générer favicon.ico et og-image.png
 * 
 * Installation requise: npm install canvas --save-dev
 * 
 * Usage: node scripts/generate-assets.js
 */

const fs = require('fs');
const path = require('path');

// Vérifier si canvas est disponible
let Canvas;
try {
  Canvas = require('canvas');
} catch (error) {
  console.error('❌ Le package "canvas" n\'est pas installé.');
  console.error('📦 Installez-le avec: npm install canvas --save-dev');
  console.error('💡 Alternative: Utilisez un outil en ligne pour créer les images manuellement.');
  process.exit(1);
}

const publicDir = path.join(__dirname, '..', 'public');
const appDir = path.join(__dirname, '..', 'app');

// Couleurs de la marque
const COLORS = {
  background: '#0E0F12',
  gradientStart: '#00D084',
  gradientEnd: '#2E6CF6',
  text: '#FFFFFF',
  textLight: '#E5E7EB',
};

/**
 * Génère le favicon.ico (64x64)
 */
function generateFavicon() {
  const size = 64;
  const canvas = Canvas.createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Fond transparent
  ctx.clearRect(0, 0, size, size);

  // Créer un gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, COLORS.gradientStart);
  gradient.addColorStop(1, COLORS.gradientEnd);

  // Dessiner un "C" stylisé avec un fond circulaire
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.35;

  // Cercle de fond avec gradient
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Dessiner la lettre "C"
  ctx.fillStyle = COLORS.background;
  ctx.font = `bold ${size * 0.6}px 'Poppins', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('C', centerX, centerY);

  // Convertir en buffer PNG
  const buffer = canvas.toBuffer('image/png');
  
  // Sauvegarder dans app/ (prioritaire pour Next.js App Router)
  // Next.js détecte automatiquement favicon.ico et icon.png dans app/
  const appIcoPath = path.join(appDir, 'favicon.ico');
  fs.writeFileSync(appIcoPath, buffer);
  console.log('✅ Favicon généré: app/favicon.ico');
  
  // Créer aussi icon.png dans app/ (format recommandé par Next.js)
  const appIconPath = path.join(appDir, 'icon.png');
  fs.writeFileSync(appIconPath, buffer);
  console.log('✅ Icon généré: app/icon.png');
  
  // Sauvegarder aussi dans public/ (pour compatibilité)
  const publicIcoPath = path.join(publicDir, 'favicon.ico');
  fs.writeFileSync(publicIcoPath, buffer);
  console.log('✅ Favicon généré: public/favicon.ico');
}

/**
 * Génère l'image Open Graph (1200x630)
 */
function generateOGImage() {
  const width = 1200;
  const height = 630;
  const canvas = Canvas.createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fond sombre
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, width, height);

  // Gradient en arrière-plan (subtile)
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, COLORS.gradientStart + '20');
  bgGradient.addColorStop(1, COLORS.gradientEnd + '20');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Gradient accent pour le logo/text
  const textGradient = ctx.createLinearGradient(width / 2 - 200, height / 2 - 100, width / 2 + 200, height / 2 + 100);
  textGradient.addColorStop(0, COLORS.gradientStart);
  textGradient.addColorStop(1, COLORS.gradientEnd);

  // Titre principal "Comptalyze"
  ctx.font = 'bold 72px "Poppins", sans-serif';
  ctx.fillStyle = textGradient;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Comptalyze', width / 2, height / 2 - 30);

  // Sous-titre
  ctx.font = '400 28px "Poppins", sans-serif';
  ctx.fillStyle = COLORS.textLight;
  ctx.fillText('URSSAF Simulator for Micro-Entrepreneurs', width / 2, height / 2 + 50);

  // Petits éléments décoratifs (cercles avec gradient)
  const decorSize = 150;
  const decorGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, decorSize);
  decorGradient.addColorStop(0, COLORS.gradientStart + '40');
  decorGradient.addColorStop(1, COLORS.gradientStart + '00');
  
  // Cercle décoratif en haut à droite
  ctx.save();
  ctx.translate(width - 100, 100);
  ctx.beginPath();
  ctx.arc(0, 0, decorSize, 0, Math.PI * 2);
  ctx.fillStyle = decorGradient;
  ctx.fill();
  ctx.restore();

  // Cercle décoratif en bas à gauche
  ctx.save();
  ctx.translate(100, height - 100);
  const decorGradient2 = ctx.createRadialGradient(0, 0, 0, 0, 0, decorSize);
  decorGradient2.addColorStop(0, COLORS.gradientEnd + '40');
  decorGradient2.addColorStop(1, COLORS.gradientEnd + '00');
  ctx.beginPath();
  ctx.arc(0, 0, decorSize, 0, Math.PI * 2);
  ctx.fillStyle = decorGradient2;
  ctx.fill();
  ctx.restore();

  // Sauvegarder
  const buffer = canvas.toBuffer('image/png');
  const ogPath = path.join(publicDir, 'og-image.png');
  fs.writeFileSync(ogPath, buffer);
  console.log('✅ Image Open Graph générée: public/og-image.png');
}

// Exécution
console.log('🎨 Génération des assets visuels...\n');

try {
  generateFavicon();
  generateOGImage();
  console.log('\n✨ Tous les assets ont été générés avec succès!');
} catch (error) {
  console.error('❌ Erreur lors de la génération:', error);
  process.exit(1);
}

