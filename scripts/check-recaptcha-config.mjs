#!/usr/bin/env node

/**
 * Script de vérification de la configuration reCAPTCHA
 * Usage: node scripts/check-recaptcha-config.mjs
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Charger les variables d'environnement
config({ path: resolve(process.cwd(), '.env.local') });

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

console.log(`\n${colors.cyan}╔════════════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.cyan}║   Vérification configuration reCAPTCHA        ║${colors.reset}`);
console.log(`${colors.cyan}╚════════════════════════════════════════════════╝${colors.reset}\n`);

let allGood = true;

// Vérifier NEXT_PUBLIC_RECAPTCHA_SITE_KEY
const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
if (siteKey && siteKey !== 'your_recaptcha_site_key_here') {
  console.log(`${colors.green}✓${colors.reset} NEXT_PUBLIC_RECAPTCHA_SITE_KEY configurée`);
  console.log(`  ${colors.cyan}→${colors.reset} ${siteKey.substring(0, 20)}...`);
} else {
  console.log(`${colors.red}✗${colors.reset} NEXT_PUBLIC_RECAPTCHA_SITE_KEY manquante ou invalide`);
  console.log(`  ${colors.yellow}→${colors.reset} Obtenez votre clé sur: https://www.google.com/recaptcha/admin`);
  allGood = false;
}

// Vérifier RECAPTCHA_SECRET_KEY
const secretKey = process.env.RECAPTCHA_SECRET_KEY;
if (secretKey && secretKey !== 'your_recaptcha_secret_key_here') {
  console.log(`${colors.green}✓${colors.reset} RECAPTCHA_SECRET_KEY configurée`);
  console.log(`  ${colors.cyan}→${colors.reset} ${secretKey.substring(0, 20)}...`);
} else {
  console.log(`${colors.red}✗${colors.reset} RECAPTCHA_SECRET_KEY manquante ou invalide`);
  console.log(`  ${colors.yellow}→${colors.reset} Obtenez votre clé sur: https://www.google.com/recaptcha/admin`);
  allGood = false;
}

console.log('\n' + '─'.repeat(50) + '\n');

if (allGood) {
  console.log(`${colors.green}✓ Configuration reCAPTCHA OK !${colors.reset}`);
  console.log(`${colors.cyan}→${colors.reset} Votre formulaire d'inscription est sécurisé.\n`);
  console.log(`${colors.blue}Étapes suivantes :${colors.reset}`);
  console.log(`  1. Redémarrez votre serveur : npm run dev`);
  console.log(`  2. Testez l'inscription sur /signup`);
  console.log(`  3. Vérifiez le badge reCAPTCHA en bas à droite\n`);
} else {
  console.log(`${colors.yellow}⚠ Configuration incomplète${colors.reset}`);
  console.log(`${colors.cyan}→${colors.reset} L'inscription fonctionnera en mode développement`);
  console.log(`${colors.yellow}→${colors.reset} Mais NE PAS déployer en production sans reCAPTCHA !\n`);
  console.log(`${colors.blue}Pour configurer reCAPTCHA :${colors.reset}`);
  console.log(`  1. Créez un compte sur: https://www.google.com/recaptcha/admin`);
  console.log(`  2. Créez un nouveau site (reCAPTCHA v3)`);
  console.log(`  3. Ajoutez les domaines (localhost + votre domaine)`);
  console.log(`  4. Copiez les clés dans .env.local`);
  console.log(`  5. Relancez ce script pour vérifier\n`);
  console.log(`${colors.cyan}Documentation complète :${colors.reset} CONFIGURATION_RECAPTCHA.md\n`);
}

// Vérifier les autres configurations importantes
console.log(`${colors.cyan}Autres vérifications :${colors.reset}\n`);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl) {
  console.log(`${colors.green}✓${colors.reset} NEXT_PUBLIC_SUPABASE_URL configurée`);
} else {
  console.log(`${colors.red}✗${colors.reset} NEXT_PUBLIC_SUPABASE_URL manquante`);
}

const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (supabaseKey) {
  console.log(`${colors.green}✓${colors.reset} NEXT_PUBLIC_SUPABASE_ANON_KEY configurée`);
} else {
  console.log(`${colors.red}✗${colors.reset} NEXT_PUBLIC_SUPABASE_ANON_KEY manquante`);
}

console.log('');

