#!/usr/bin/env node

import { existsSync, statSync, copyFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const gifPath = join(projectRoot, 'public', 'hero-demo.gif');

console.log('🎨 Optimisation du GIF avec gifsicle...\n');

if (!existsSync(gifPath)) {
  console.error(`❌ Fichier introuvable : ${gifPath}`);
  console.log('💡 Exécutez d\'abord : npm run demo:record');
  process.exit(1);
}

const originalStats = statSync(gifPath);
const originalSize = (originalStats.size / 1024 / 1024).toFixed(2);
console.log(`📁 Taille originale : ${originalSize} Mo`);

// Fonction pour optimiser avec gifsicle
function optimizeGif() {
  return new Promise((resolve, reject) => {
    // Sauvegarder l'original
    const backupPath = gifPath + '.backup';
    copyFileSync(gifPath, backupPath);
    console.log('💾 Sauvegarde créée');

    const gifsicle = spawn('gifsicle', [
      '--optimize=3',
      '--lossy=80',
      '--colors', '128',
      '-o', gifPath,
      backupPath
    ]);

    let stderr = '';
    gifsicle.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    gifsicle.on('close', (code) => {
      if (code === 0) {
        const optimizedStats = statSync(gifPath);
        const optimizedSize = (optimizedStats.size / 1024 / 1024).toFixed(2);
        const reduction = (((originalStats.size - optimizedStats.size) / originalStats.size) * 100).toFixed(1);
        
        console.log(`✅ GIF optimisé : ${optimizedSize} Mo (-${reduction}%)`);
        resolve();
      } else {
        console.error('❌ Erreur gifsicle:', stderr);
        console.log('💡 gifsicle n\'est peut-être pas installé.');
        console.log('   Installation : https://www.lcdf.org/gifsicle/');
        reject(new Error(`gifsicle exited with code ${code}`));
      }
    });

    gifsicle.on('error', (err) => {
      console.error('❌ gifsicle non trouvé');
      console.log('💡 Installation requise : https://www.lcdf.org/gifsicle/');
      console.log('   Windows : choco install gifsicle');
      console.log('   Mac : brew install gifsicle');
      console.log('   Linux : apt install gifsicle');
      reject(err);
    });
  });
}

// Fonction principale
async function main() {
  try {
    await optimizeGif();
    
    const finalStats = statSync(gifPath);
    const finalSize = (finalStats.size / 1024 / 1024).toFixed(2);
    
    console.log(`\n✨ Optimisation terminée !`);
    console.log(`📦 Taille finale : ${finalSize} Mo`);
    
  } catch (error) {
    console.error('\n❌ Erreur :', error.message);
    process.exit(1);
  }
}

main();















