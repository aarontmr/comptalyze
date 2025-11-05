#!/usr/bin/env node

/**
 * Script de diagnostic pour vérifier la configuration Stripe
 * Usage: node scripts/check-stripe.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnostic de configuration Stripe\n');
console.log('=' .repeat(50));

// Vérifier si .env.local existe
const envLocalPath = path.join(process.cwd(), '.env.local');
const envPath = path.join(process.cwd(), '.env');

console.log('\n📁 Vérification des fichiers...');

if (fs.existsSync(envLocalPath)) {
  console.log('✅ .env.local existe');
} else {
  console.log('❌ .env.local n\'existe pas');
  console.log('   → Créez ce fichier à la racine du projet');
}

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env existe (mais Next.js utilise .env.local)');
} else {
  console.log('ℹ️  .env n\'existe pas (c\'est normal)');
}

// Lire .env.local si il existe
if (fs.existsSync(envLocalPath)) {
  console.log('\n🔑 Analyse de .env.local...');
  
  const content = fs.readFileSync(envLocalPath, 'utf-8');
  const lines = content.split('\n');
  
  let hasPublishableKey = false;
  let hasSecretKey = false;
  let hasPrices = false;
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Ignorer les commentaires et lignes vides
    if (trimmed === '' || trimmed.startsWith('#')) return;
    
    // Vérifier NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (trimmed.includes('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY')) {
      hasPublishableKey = true;
      
      const match = trimmed.match(/NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY\s*=\s*(.+)/);
      if (match) {
        const value = match[1].trim();
        
        // Vérifier les erreurs courantes
        if (value === '') {
          console.log(`❌ Ligne ${index + 1}: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY est vide`);
        } else if (value.startsWith('"') || value.startsWith("'")) {
          console.log(`⚠️  Ligne ${index + 1}: Guillemets détectés (à retirer)`);
          console.log(`   Valeur: ${value}`);
        } else if (!value.startsWith('pk_test_') && !value.startsWith('pk_live_')) {
          console.log(`❌ Ligne ${index + 1}: La clé ne commence pas par pk_test_ ou pk_live_`);
          console.log(`   Valeur: ${value.substring(0, 20)}...`);
        } else if (value.startsWith('pk_test_')) {
          console.log(`✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: Clé de test détectée`);
          console.log(`   Début: ${value.substring(0, 30)}...`);
        } else if (value.startsWith('pk_live_')) {
          console.log(`✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: Clé de production détectée`);
          console.log(`   Début: ${value.substring(0, 30)}...`);
        }
      } else {
        console.log(`❌ Ligne ${index + 1}: Format invalide`);
      }
    }
    
    // Vérifier STRIPE_SECRET_KEY
    if (trimmed.includes('STRIPE_SECRET_KEY=')) {
      hasSecretKey = true;
      const match = trimmed.match(/STRIPE_SECRET_KEY\s*=\s*(.+)/);
      if (match) {
        const value = match[1].trim();
        if (value.startsWith('sk_test_') || value.startsWith('sk_live_')) {
          console.log(`✅ STRIPE_SECRET_KEY: Configurée`);
        } else {
          console.log(`⚠️  STRIPE_SECRET_KEY: Format potentiellement invalide`);
        }
      }
    }
    
    // Vérifier STRIPE_PRICE_*
    if (trimmed.includes('STRIPE_PRICE_')) {
      hasPrices = true;
    }
    
    // Détecter les erreurs courantes
    if (trimmed.includes('STRIPE_PUBLISHABLE_KEY=') && !trimmed.includes('NEXT_PUBLIC_')) {
      console.log(`❌ Ligne ${index + 1}: Manque le préfixe NEXT_PUBLIC_`);
      console.log(`   → Renommez en: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`);
    }
  });
  
  console.log('\n📊 Résumé:');
  console.log(`   ${hasPublishableKey ? '✅' : '❌'} Clé publique Stripe (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)`);
  console.log(`   ${hasSecretKey ? '✅' : '❌'} Clé secrète Stripe (STRIPE_SECRET_KEY)`);
  console.log(`   ${hasPrices ? '✅' : '⚠️ '} Prix Stripe configurés`);
  
  if (!hasPublishableKey) {
    console.log('\n❌ PROBLÈME IDENTIFIÉ:');
    console.log('   La variable NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY est manquante');
    console.log('\n💡 SOLUTION:');
    console.log('   1. Ajoutez cette ligne dans .env.local:');
    console.log('      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_ici');
    console.log('   2. Remplacez "pk_test_votre_cle_ici" par votre vraie clé Stripe');
    console.log('   3. Redémarrez le serveur (Ctrl+C puis npm run dev)');
  }
}

// Vérifier les variables d'environnement chargées
console.log('\n🌍 Variables d\'environnement chargées par Next.js:');

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (publishableKey) {
  console.log('✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY est accessible');
  console.log(`   Début: ${publishableKey.substring(0, 30)}...`);
  
  if (!publishableKey.startsWith('pk_test_') && !publishableKey.startsWith('pk_live_')) {
    console.log('⚠️  La clé ne commence pas par pk_test_ ou pk_live_');
  }
} else {
  console.log('❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY n\'est PAS accessible');
  console.log('\n💡 Cela signifie:');
  console.log('   1. La variable n\'est pas dans .env.local');
  console.log('   2. OU le serveur n\'a pas été redémarré');
  console.log('   3. OU le nom de la variable est incorrect');
}

console.log('\n' + '='.repeat(50));
console.log('\n📝 Actions recommandées:\n');

if (!publishableKey) {
  console.log('1️⃣  Vérifiez que .env.local contient:');
  console.log('   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle');
  console.log('');
  console.log('2️⃣  Obtenez votre clé sur:');
  console.log('   https://dashboard.stripe.com/test/apikeys');
  console.log('');
  console.log('3️⃣  Redémarrez le serveur:');
  console.log('   Ctrl+C puis npm run dev');
  console.log('');
} else {
  console.log('✅ Configuration Stripe semble correcte!');
  console.log('');
  console.log('Si le problème persiste:');
  console.log('1. Supprimez le cache: rm -rf .next');
  console.log('2. Redémarrez: npm run dev');
  console.log('3. Testez: http://localhost:3000/checkout/pro');
}

console.log('\n💡 Consultez FIX_STRIPE_CONFIG.md pour plus d\'aide\n');

