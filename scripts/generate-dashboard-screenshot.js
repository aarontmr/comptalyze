/**
 * Script pour générer un screenshot du dashboard
 * Utilise Puppeteer pour capturer une image du dashboard
 * 
 * Installation: npm install puppeteer
 * Usage: node scripts/generate-dashboard-screenshot.js
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Configuration
const DASHBOARD_URL = process.env.DASHBOARD_URL || 'http://localhost:3000/dashboard';
const OUTPUT_DIR = path.join(__dirname, '../public/mockups');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'dashboard-screenshot.png');

// Créer le dossier de sortie s'il n'existe pas
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateScreenshot() {
  console.log('🚀 Démarrage de la génération du screenshot...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    
    // Définir la taille de la fenêtre (dimensions d'un écran d'ordinateur portable)
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 2, // Haute résolution pour un meilleur rendu
    });

    console.log(`📸 Navigation vers ${DASHBOARD_URL}...`);
    
    // Aller sur la page du dashboard
    // Note: Vous devrez peut-être vous connecter d'abord
    await page.goto(DASHBOARD_URL, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Attendre que le contenu soit chargé
    console.log('⏳ Attente du chargement du contenu...');
    await page.waitForTimeout(3000); // Attendre 3 secondes pour que tout se charge

    // Optionnel: Attendre un élément spécifique
    try {
      await page.waitForSelector('[data-dashboard-content]', { timeout: 5000 });
    } catch (e) {
      console.log('⚠️ Élément spécifique non trouvé, continuation...');
    }

    // Prendre le screenshot
    console.log('📷 Capture du screenshot...');
    await page.screenshot({
      path: OUTPUT_FILE,
      fullPage: false, // Prendre seulement la zone visible
      type: 'png',
    });

    console.log(`✅ Screenshot généré avec succès: ${OUTPUT_FILE}`);
    console.log(`📏 Dimensions: 1920x1080px`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Exécuter le script
generateScreenshot()
  .then(() => {
    console.log('✨ Terminé !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });



