#!/usr/bin/env node

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🔍 Vérification des dépendances pour la génération de démo...\n');

const checks = {
  ffmpeg: false,
  ffprobe: false,
  gifsicle: false,
  node: false,
  npm: false,
  demoHtml: false,
  config: false
};

// Fonction pour vérifier une commande
function checkCommand(command) {
  return new Promise((resolve) => {
    // Sur Windows, utiliser 'where' pour trouver la commande
    const isWindows = process.platform === 'win32';
    const checkCmd = isWindows ? 'where' : 'which';
    const args = isWindows ? [command] : [command];
    
    const proc = spawn(checkCmd, args, { 
      shell: true,
      windowsHide: true 
    });
    
    let found = false;
    
    proc.stdout.on('data', () => {
      found = true;
    });
    
    proc.on('close', (code) => {
      resolve(found || code === 0);
    });
    
    proc.on('error', () => {
      resolve(false);
    });
  });
}

// Vérifier Node.js
async function checkNode() {
  checks.node = await checkCommand('node');
  console.log(`${checks.node ? '✅' : '❌'} Node.js : ${checks.node ? 'installé' : 'NON TROUVÉ'}`);
}

// Vérifier npm
async function checkNpm() {
  checks.npm = await checkCommand('npm');
  console.log(`${checks.npm ? '✅' : '❌'} npm : ${checks.npm ? 'installé' : 'NON TROUVÉ'}`);
}

// Vérifier ffmpeg (OBLIGATOIRE)
async function checkFfmpeg() {
  checks.ffmpeg = await checkCommand('ffmpeg');
  console.log(`${checks.ffmpeg ? '✅' : '⚠️ '} ffmpeg : ${checks.ffmpeg ? 'installé' : 'NON TROUVÉ (OBLIGATOIRE)'}`);
  
  if (!checks.ffmpeg) {
    console.log('   💡 Installation :');
    console.log('      Windows : choco install ffmpeg');
    console.log('      macOS   : brew install ffmpeg');
    console.log('      Linux   : sudo apt install ffmpeg\n');
  }
}

// Vérifier ffprobe (OBLIGATOIRE)
async function checkFfprobe() {
  checks.ffprobe = await checkCommand('ffprobe');
  console.log(`${checks.ffprobe ? '✅' : '⚠️ '} ffprobe : ${checks.ffprobe ? 'installé' : 'NON TROUVÉ (inclus avec ffmpeg)'}`);
}

// Vérifier gifsicle (OPTIONNEL)
async function checkGifsicle() {
  checks.gifsicle = await checkCommand('gifsicle');
  console.log(`${checks.gifsicle ? '✅' : 'ℹ️ '} gifsicle : ${checks.gifsicle ? 'installé' : 'non installé (optionnel)'}`);
  
  if (!checks.gifsicle) {
    console.log('   💡 Installation (optionnel, pour optimisation avancée) :');
    console.log('      Windows : choco install gifsicle');
    console.log('      macOS   : brew install gifsicle');
    console.log('      Linux   : sudo apt install gifsicle\n');
  }
}

// Vérifier les fichiers
function checkFiles() {
  checks.demoHtml = existsSync(join(projectRoot, 'demo', 'hero-preview.html'));
  checks.config = existsSync(join(projectRoot, 'scripts', 'config.json'));
  
  console.log(`${checks.demoHtml ? '✅' : '❌'} demo/hero-preview.html : ${checks.demoHtml ? 'présent' : 'MANQUANT'}`);
  console.log(`${checks.config ? '✅' : '❌'} scripts/config.json : ${checks.config ? 'présent' : 'MANQUANT'}`);
}

// Vérifier les packages npm
function checkNpmPackages() {
  const packageJsonPath = join(projectRoot, 'package.json');
  const nodeModulesPath = join(projectRoot, 'node_modules');
  
  if (!existsSync(packageJsonPath)) {
    console.log('❌ package.json non trouvé');
    return;
  }
  
  if (!existsSync(nodeModulesPath)) {
    console.log('⚠️  node_modules non trouvé - exécutez "npm install"');
    return;
  }
  
  const requiredPackages = ['puppeteer', 'mime-types'];
  let allInstalled = true;
  
  console.log('\n📦 Packages npm :');
  requiredPackages.forEach(pkg => {
    const pkgPath = join(nodeModulesPath, pkg);
    const installed = existsSync(pkgPath);
    allInstalled = allInstalled && installed;
    console.log(`${installed ? '✅' : '❌'} ${pkg} : ${installed ? 'installé' : 'MANQUANT'}`);
  });
  
  if (!allInstalled) {
    console.log('\n💡 Installez les dépendances manquantes : npm install');
  }
}

// Résumé final
function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ\n');
  
  const canGenerate = checks.ffmpeg && checks.ffprobe && checks.demoHtml && checks.config;
  const canOptimize = checks.gifsicle;
  
  if (canGenerate) {
    console.log('✅ Vous pouvez générer la démo !');
    console.log('   Commandes disponibles :');
    console.log('   • npm run demo:record      - Enregistrer la démo');
    console.log('   • npm run demo:build       - Générer + optimiser');
    console.log('   • npm run demo:fromRaw     - Depuis vidéo existante\n');
    
    if (canOptimize) {
      console.log('✅ Optimisation avancée disponible avec gifsicle');
    } else {
      console.log('ℹ️  Optimisation basique seulement (gifsicle non installé)');
    }
  } else {
    console.log('❌ Impossible de générer la démo pour le moment.\n');
    console.log('   Dépendances manquantes :');
    if (!checks.ffmpeg) console.log('   • ffmpeg (OBLIGATOIRE)');
    if (!checks.ffprobe) console.log('   • ffprobe (OBLIGATOIRE)');
    if (!checks.demoHtml) console.log('   • demo/hero-preview.html');
    if (!checks.config) console.log('   • scripts/config.json');
    console.log('\n   Installez les dépendances manquantes et réessayez.');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📖 Documentation complète : GUIDE_DEMO_HERO.md');
  console.log('='.repeat(60) + '\n');
}

// Exécution principale
async function main() {
  await checkNode();
  await checkNpm();
  await checkFfmpeg();
  await checkFfprobe();
  await checkGifsicle();
  console.log('');
  checkFiles();
  checkNpmPackages();
  printSummary();
}

main();

