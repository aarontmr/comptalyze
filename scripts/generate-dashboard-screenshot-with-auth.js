/**
 * Script pour générer un screenshot du dashboard avec authentification
 * 
 * Installation: npm install puppeteer
 * Usage: 
 *   DASHBOARD_URL=http://localhost:3000/dashboard \
 *   EMAIL=votre@email.com \
 *   PASSWORD=votre_mot_de_passe \
 *   node scripts/generate-dashboard-screenshot-with-auth.js
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Configuration depuis les variables d'environnement
const DASHBOARD_URL = process.env.DASHBOARD_URL || 'http://localhost:3000/dashboard';
const LOGIN_URL = process.env.LOGIN_URL || 'http://localhost:3000/login';
const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;
const OUTPUT_DIR = path.join(__dirname, '../public/mockups');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'dashboard-screenshot.png');

// Créer le dossier de sortie
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function login(page) {
  if (!EMAIL || !PASSWORD) {
    console.log('⚠️ EMAIL et PASSWORD non fournis, tentative d\'accès direct...');
    return false;
  }

  console.log('🔐 Connexion...');
  await page.goto(LOGIN_URL, { waitUntil: 'networkidle2' });
  
  // Remplir le formulaire de connexion
  await page.waitForSelector('input[type="email"]', { timeout: 5000 });
  await page.type('input[type="email"]', EMAIL);
  await page.type('input[type="password"]', PASSWORD);
  
  // Cliquer sur le bouton de connexion
  await page.click('button[type="submit"]');
  
  // Attendre la redirection vers le dashboard
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
  
  console.log('✅ Connexion réussie');
  return true;
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
      deviceScaleFactor: 2,
    });

    // Se connecter si nécessaire
    const loggedIn = await login(page);
    
    if (!loggedIn) {
      console.log('📸 Navigation directe vers le dashboard...');
      await page.goto(DASHBOARD_URL, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });
    } else {
      // S'assurer qu'on est sur le dashboard
      if (!page.url().includes('/dashboard')) {
        await page.goto(DASHBOARD_URL, { waitUntil: 'networkidle2' });
      }
    }

    // Attendre que le contenu soit chargé
    console.log('⏳ Attente du chargement du contenu...');
    await page.waitForTimeout(5000); // Attendre 5 secondes

    // Prendre le screenshot
    console.log('📷 Capture du screenshot...');
    await page.screenshot({
      path: OUTPUT_FILE,
      fullPage: false,
      type: 'png',
    });

    console.log(`✅ Screenshot généré: ${OUTPUT_FILE}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

generateScreenshot()
  .then(() => {
    console.log('✨ Terminé !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });



