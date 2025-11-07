// Script pour vérifier les variables d'environnement
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');

console.log('\n🔍 Vérification des variables d\'environnement...\n');

if (!fs.existsSync(envPath)) {
  console.error('❌ Le fichier .env.local n\'existe pas !');
  console.error('   Créez-le à la racine du projet avec vos clés Supabase.\n');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');

let hasUrl = false;
let hasKey = false;
let urlValue = '';
let keyValue = '';

lines.forEach((line, index) => {
  const trimmed = line.trim();
  
  if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    hasUrl = true;
    const parts = trimmed.split('=');
    urlValue = parts.slice(1).join('=').trim();
    console.log(`📄 Ligne ${index + 1}: NEXT_PUBLIC_SUPABASE_URL`);
    console.log(`   Valeur: ${urlValue ? urlValue.substring(0, 40) + '...' : '⚠️  VIDE !'}`);
  }
  
  if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
    hasKey = true;
    const parts = trimmed.split('=');
    keyValue = parts.slice(1).join('=').trim();
    console.log(`📄 Ligne ${index + 1}: NEXT_PUBLIC_SUPABASE_ANON_KEY`);
    console.log(`   Valeur: ${keyValue ? keyValue.substring(0, 40) + '...' : '⚠️  VIDE !'}`);
  }
});

console.log('\n📊 Résumé :\n');

if (!hasUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL non trouvée dans .env.local');
} else if (!urlValue) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL est vide');
  console.error('   Ajoutez votre URL après le signe =');
} else {
  console.log('✅ NEXT_PUBLIC_SUPABASE_URL est définie');
}

if (!hasKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY non trouvée dans .env.local');
} else if (!keyValue) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY est vide');
  console.error('   Ajoutez votre clé après le signe =');
} else {
  console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY est définie');
}

if ((hasUrl && urlValue) && (hasKey && keyValue)) {
  console.log('\n✅ Toutes les variables sont correctement configurées !');
  console.log('⚠️  Assurez-vous d\'avoir REDÉMARRÉ le serveur après modification.\n');
} else {
  console.log('\n❌ Problèmes détectés. Corrigez .env.local et redémarrez le serveur.\n');
  process.exit(1);
}









