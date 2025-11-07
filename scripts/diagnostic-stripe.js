#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNOSTIC STRIPE - Comptalyze\n');
console.log('='.repeat(50));

// Chemin du fichier .env.local
const envPath = path.join(process.cwd(), '.env.local');

console.log('\n📁 Fichier .env.local');
console.log(`   Chemin: ${envPath}`);

if (!fs.existsSync(envPath)) {
  console.log('   ❌ Le fichier n\'existe PAS !');
  console.log('\n💡 SOLUTION :');
  console.log('   1. Créez un fichier .env.local à la racine du projet');
  console.log('   2. Ajoutez-y vos clés Stripe');
  process.exit(1);
}

console.log('   ✅ Le fichier existe');

// Lire le contenu
const content = fs.readFileSync(envPath, 'utf-8');
const lines = content.split('\n');

console.log('\n🔑 VARIABLES STRIPE DÉTECTÉES :\n');

let hasPublicKey = false;
let hasSecretKey = false;
let hasWebhook = false;
let hasPrices = false;

let publicKeyValue = null;
let secretKeyValue = null;

lines.forEach((line, index) => {
  const trimmed = line.trim();
  
  // Ignorer lignes vides et commentaires
  if (!trimmed || trimmed.startsWith('#')) return;
  
  // NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  if (trimmed.includes('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY')) {
    hasPublicKey = true;
    const match = trimmed.match(/NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY\s*=\s*(.+)/);
    if (match) {
      publicKeyValue = match[1].trim();
      
      if (!publicKeyValue || publicKeyValue === '') {
        console.log(`❌ Ligne ${index + 1}: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY est VIDE`);
      } else if (publicKeyValue.includes('"') || publicKeyValue.includes("'")) {
        console.log(`⚠️  Ligne ${index + 1}: Guillemets détectés (À RETIRER !)`);
        console.log(`   Valeur: ${publicKeyValue}`);
      } else if (publicKeyValue.startsWith('pk_test_')) {
        console.log(`✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (Test)`);
        console.log(`   ${publicKeyValue.substring(0, 40)}...`);
      } else if (publicKeyValue.startsWith('pk_live_')) {
        console.log(`✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (Production)`);
        console.log(`   ${publicKeyValue.substring(0, 40)}...`);
      } else {
        console.log(`⚠️  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (Format inconnu)`);
        console.log(`   ${publicKeyValue.substring(0, 30)}...`);
      }
    }
  }
  
  // STRIPE_SECRET_KEY
  if (trimmed.includes('STRIPE_SECRET_KEY=')) {
    hasSecretKey = true;
    const match = trimmed.match(/STRIPE_SECRET_KEY\s*=\s*(.+)/);
    if (match) {
      secretKeyValue = match[1].trim();
      if (secretKeyValue.startsWith('sk_test_') || secretKeyValue.startsWith('sk_live_')) {
        console.log(`✅ STRIPE_SECRET_KEY détectée`);
      }
    }
  }
  
  // STRIPE_WEBHOOK_SECRET
  if (trimmed.includes('STRIPE_WEBHOOK_SECRET')) {
    hasWebhook = true;
    console.log(`✅ STRIPE_WEBHOOK_SECRET détectée`);
  }
  
  // Price IDs
  if (trimmed.includes('STRIPE_PRICE_')) {
    hasPrices = true;
  }
  
  // ERREUR COMMUNE : Oubli du NEXT_PUBLIC_
  if (trimmed.includes('STRIPE_PUBLISHABLE_KEY=') && !trimmed.includes('NEXT_PUBLIC_')) {
    console.log(`\n❌ ERREUR Ligne ${index + 1}:`);
    console.log(`   Vous avez écrit: STRIPE_PUBLISHABLE_KEY`);
    console.log(`   Il faut écrire: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`);
  }
});

console.log('\n' + '='.repeat(50));
console.log('\n📊 RÉSUMÉ :');
console.log(`   ${hasPublicKey ? '✅' : '❌'} Clé Publique (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)`);
console.log(`   ${hasSecretKey ? '✅' : '❌'} Clé Secrète (STRIPE_SECRET_KEY)`);
console.log(`   ${hasWebhook ? '✅' : '⚠️ '} Webhook Secret (STRIPE_WEBHOOK_SECRET)`);
console.log(`   ${hasPrices ? '✅' : '⚠️ '} Price IDs configurés`);

// DIAGNOSTIC PRINCIPAL
console.log('\n' + '='.repeat(50));

if (!hasPublicKey) {
  console.log('\n❌ PROBLÈME IDENTIFIÉ : Clé publique manquante\n');
  console.log('💡 SOLUTION :');
  console.log('   1. Ouvrez le fichier .env.local');
  console.log('   2. Ajoutez cette ligne :');
  console.log('      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle');
  console.log('   3. Obtenez votre clé sur : https://dashboard.stripe.com/test/apikeys');
  console.log('   4. Redémarrez le serveur : Ctrl+C puis npm run dev\n');
} else if (publicKeyValue && (publicKeyValue.includes('"') || publicKeyValue.includes("'"))) {
  console.log('\n⚠️  PROBLÈME : Guillemets dans la clé\n');
  console.log('💡 SOLUTION :');
  console.log('   Retirez les guillemets autour de la valeur');
  console.log('\n   ❌ Mauvais :');
  console.log(`   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="${publicKeyValue.replace(/["']/g, '')}"`);
  console.log('\n   ✅ Correct :');
  console.log(`   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${publicKeyValue.replace(/["']/g, '')}`);
  console.log('\n   Puis redémarrez : Ctrl+C puis npm run dev\n');
} else {
  console.log('\n✅ Configuration .env.local semble correcte !\n');
  console.log('🔄 PROCHAINES ÉTAPES :');
  console.log('   1. Arrêtez le serveur : Ctrl+C');
  console.log('   2. Redémarrez : npm run dev');
  console.log('   3. Videz le cache du navigateur : Ctrl+Shift+R');
  console.log('   4. Testez à nouveau\n');
}

console.log('='.repeat(50));

