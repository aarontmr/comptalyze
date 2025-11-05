#!/usr/bin/env node

/**
 * Script pour diagnostiquer et réparer la configuration .env.local
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

console.log('🔧 Réparation de la configuration Stripe\n');
console.log('=' .repeat(60));

const envLocalPath = path.join(process.cwd(), '.env.local');

// Lire le contenu actuel
if (!fs.existsSync(envLocalPath)) {
  console.log('❌ Le fichier .env.local n\'existe pas !');
  console.log('\n📝 Création du fichier .env.local...\n');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('Collez votre clé Stripe PUBLIQUE (pk_live_... ou pk_test_...) : ', (key) => {
    const content = `# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${key.trim()}
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Stripe Price IDs
STRIPE_PRICE_PRO=
STRIPE_PRICE_PREMIUM=
STRIPE_PRICE_PRO_YEARLY=
STRIPE_PRICE_PREMIUM_YEARLY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# URLs
NEXT_PUBLIC_BASE_URL=https://comptalyze.com
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Autres
RESEND_API_KEY=
OPENAI_API_KEY=
CRON_SECRET=
`;
    
    fs.writeFileSync(envLocalPath, content, 'utf8');
    console.log('\n✅ Fichier .env.local créé !');
    console.log('\n🔄 IMPORTANT : Redémarrez le serveur :');
    console.log('   1. Ctrl+C dans le terminal du serveur');
    console.log('   2. npm run dev\n');
    
    rl.close();
  });
  
  return;
}

console.log('📄 Lecture de .env.local...\n');

const content = fs.readFileSync(envLocalPath, 'utf8');
const lines = content.split(/\r?\n/);

console.log('🔍 Analyse ligne par ligne :\n');

let foundKey = false;
let keyLine = -1;
let keyValue = '';
let issues = [];

lines.forEach((line, index) => {
  const trimmed = line.trim();
  
  if (trimmed.includes('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY')) {
    foundKey = true;
    keyLine = index + 1;
    
    console.log(`📍 Ligne ${index + 1}: ${line}`);
    
    // Analyser la ligne en détail
    const bytes = Buffer.from(line, 'utf8');
    console.log(`   Bytes: ${bytes.length}`);
    console.log(`   Hex: ${bytes.toString('hex').substring(0, 100)}...`);
    
    // Vérifier les problèmes
    if (line !== trimmed) {
      issues.push(`⚠️  Ligne ${index + 1}: Espaces au début ou à la fin`);
    }
    
    if (line.includes('"') || line.includes("'")) {
      issues.push(`⚠️  Ligne ${index + 1}: Guillemets détectés`);
    }
    
    if (line.includes(' = ') || line.includes('= ') || line.includes(' =')) {
      issues.push(`⚠️  Ligne ${index + 1}: Espaces autour du =`);
    }
    
    // Extraire la valeur
    const match = line.match(/NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY\s*=\s*(.+)/);
    if (match) {
      keyValue = match[1].trim();
      
      if (!keyValue.startsWith('pk_test_') && !keyValue.startsWith('pk_live_')) {
        issues.push(`❌ Ligne ${index + 1}: La clé ne commence pas par pk_test_ ou pk_live_`);
      }
      
      console.log(`   Valeur détectée: ${keyValue.substring(0, 30)}...`);
    } else {
      issues.push(`❌ Ligne ${index + 1}: Impossible d'extraire la valeur`);
    }
  }
});

console.log('\n' + '='.repeat(60));

if (!foundKey) {
  console.log('❌ PROBLÈME : NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY non trouvée\n');
  console.log('💡 SOLUTION : Ajoutez cette ligne dans .env.local :');
  console.log('   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle\n');
} else {
  console.log(`✅ Variable trouvée à la ligne ${keyLine}\n`);
  
  if (issues.length > 0) {
    console.log('⚠️  PROBLÈMES DÉTECTÉS :\n');
    issues.forEach(issue => console.log('   ' + issue));
    console.log('\n💡 RÉPARATION AUTOMATIQUE ?\n');
    
    // Proposer une réparation
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('Voulez-vous que je répare automatiquement ? (o/n) : ', (answer) => {
      if (answer.toLowerCase() === 'o' || answer.toLowerCase() === 'oui') {
        // Recréer le fichier proprement
        const newLines = [];
        let fixed = false;
        
        lines.forEach((line) => {
          if (line.includes('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY')) {
            // Réécrire la ligne proprement
            newLines.push(`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${keyValue.replace(/["']/g, '').trim()}`);
            fixed = true;
          } else {
            newLines.push(line);
          }
        });
        
        if (fixed) {
          const backup = envLocalPath + '.backup';
          fs.copyFileSync(envLocalPath, backup);
          console.log(`\n📦 Backup créé : ${backup}`);
          
          fs.writeFileSync(envLocalPath, newLines.join('\n'), 'utf8');
          console.log('✅ Fichier .env.local réparé !\n');
          console.log('🔄 REDÉMARREZ LE SERVEUR :');
          console.log('   1. Ctrl+C');
          console.log('   2. npm run dev\n');
        }
      } else {
        console.log('\n💡 Corrigez manuellement le fichier .env.local');
        console.log(`   Ligne ${keyLine} doit être exactement :`);
        console.log(`   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${keyValue.replace(/["']/g, '').trim()}\n`);
      }
      
      rl.close();
    });
  } else {
    console.log('✅ Aucun problème de format détecté\n');
    console.log('💡 Le problème vient du serveur qui n\'a pas rechargé.\n');
    console.log('🔄 SOLUTION : Redémarrez PROPREMENT :');
    console.log('   1. Fermez COMPLÈTEMENT le terminal actuel');
    console.log('   2. Ouvrez un NOUVEAU terminal');
    console.log('   3. cd C:\\Users\\badav\\OneDrive\\Bureau\\testcomptalyze');
    console.log('   4. npm run dev\n');
    console.log('💡 Alternative : Si un processus Node.js est bloqué :');
    console.log('   1. Ouvrez le Gestionnaire des tâches (Ctrl+Shift+Esc)');
    console.log('   2. Recherchez "node.exe"');
    console.log('   3. Terminez TOUS les processus Node.js');
    console.log('   4. Relancez npm run dev\n');
  }
}

console.log('=' .repeat(60));

