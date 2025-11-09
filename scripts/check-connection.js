#!/usr/bin/env node

/**
 * Script de diagnostic pour vérifier la configuration Supabase
 * Usage: node scripts/check-connection.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la configuration Supabase...\n');

// Charger les variables d'environnement
const envPath = path.join(__dirname, '..', '.env.local');

if (!fs.existsSync(envPath)) {
  console.error('❌ ERREUR : Le fichier .env.local n\'existe pas !');
  console.log('\n📝 Solution :');
  console.log('   1. Créez un fichier .env.local à la racine du projet');
  console.log('   2. Copiez le contenu de env.example');
  console.log('   3. Remplissez vos clés Supabase');
  process.exit(1);
}

console.log('✅ Fichier .env.local trouvé\n');

// Lire le fichier
const envContent = fs.readFileSync(envPath, 'utf-8');
const lines = envContent.split('\n');

let supabaseUrl = null;
let supabaseAnonKey = null;

lines.forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    supabaseUrl = line.split('=')[1]?.trim();
  }
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
    supabaseAnonKey = line.split('=')[1]?.trim();
  }
});

// Vérifier NEXT_PUBLIC_SUPABASE_URL
console.log('📌 NEXT_PUBLIC_SUPABASE_URL :');
if (!supabaseUrl || supabaseUrl === '') {
  console.error('   ❌ VIDE ou MANQUANTE');
  console.log('\n📝 Solution :');
  console.log('   1. Allez sur https://supabase.com');
  console.log('   2. Ouvrez votre projet');
  console.log('   3. Settings → API');
  console.log('   4. Copiez "Project URL"');
  console.log('   5. Collez-la dans .env.local après le "="');
  console.log('   Exemple : NEXT_PUBLIC_SUPABASE_URL=https://abcdef.supabase.co\n');
  process.exit(1);
} else if (supabaseUrl.includes('votre-projet') || supabaseUrl.includes('example')) {
  console.error('   ⚠️  URL factice détectée : ' + supabaseUrl);
  console.log('\n📝 Solution :');
  console.log('   Remplacez par votre VRAIE URL Supabase');
  console.log('   Trouvable sur : https://supabase.com → Settings → API\n');
  process.exit(1);
} else if (!supabaseUrl.includes('supabase.co')) {
  console.error('   ⚠️  URL suspecte : ' + supabaseUrl);
  console.log('   Les URLs Supabase devraient contenir ".supabase.co"\n');
} else {
  console.log('   ✅ ' + supabaseUrl);
}

// Vérifier NEXT_PUBLIC_SUPABASE_ANON_KEY
console.log('\n📌 NEXT_PUBLIC_SUPABASE_ANON_KEY :');
if (!supabaseAnonKey || supabaseAnonKey === '') {
  console.error('   ❌ VIDE ou MANQUANTE');
  console.log('\n📝 Solution :');
  console.log('   1. Allez sur https://supabase.com');
  console.log('   2. Ouvrez votre projet');
  console.log('   3. Settings → API');
  console.log('   4. Copiez "anon public" key');
  console.log('   5. Collez-la dans .env.local après le "="');
  console.log('   Exemple : NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\n');
  process.exit(1);
} else if (supabaseAnonKey.length < 100) {
  console.error('   ⚠️  Clé trop courte : ' + supabaseAnonKey.substring(0, 50) + '...');
  console.log('   Les clés Supabase font généralement plus de 100 caractères\n');
  process.exit(1);
} else if (!supabaseAnonKey.startsWith('eyJ')) {
  console.error('   ⚠️  Format suspect : ' + supabaseAnonKey.substring(0, 20) + '...');
  console.log('   Les clés Supabase JWT commencent généralement par "eyJ"\n');
} else {
  console.log('   ✅ ' + supabaseAnonKey.substring(0, 30) + '... (' + supabaseAnonKey.length + ' caractères)');
}

// Test de connexion
console.log('\n🌐 Test de connexion à Supabase...');

const https = require('https');
const http = require('http');

const urlObj = new URL(supabaseUrl);
const client = urlObj.protocol === 'https:' ? https : http;

const options = {
  hostname: urlObj.hostname,
  port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
  path: '/rest/v1/',
  method: 'GET',
  headers: {
    'apikey': supabaseAnonKey
  },
  timeout: 5000
};

const req = client.request(options, (res) => {
  if (res.statusCode === 200 || res.statusCode === 400 || res.statusCode === 401) {
    console.log('   ✅ Supabase est accessible (status: ' + res.statusCode + ')');
    console.log('\n🎉 Configuration OK !');
    console.log('\n📝 Prochaines étapes :');
    console.log('   1. Redémarrez votre serveur (Ctrl+C puis npm run dev)');
    console.log('   2. Réessayez de vous connecter');
  } else {
    console.log('   ⚠️  Réponse inattendue (status: ' + res.statusCode + ')');
    console.log('   Mais le serveur est accessible, donc la config est probablement OK.');
  }
});

req.on('error', (error) => {
  console.error('   ❌ Impossible de se connecter à Supabase');
  console.error('   Erreur : ' + error.message);
  console.log('\n📝 Solutions possibles :');
  console.log('   1. Vérifiez que l\'URL est correcte');
  console.log('   2. Vérifiez votre connexion internet');
  console.log('   3. Vérifiez que votre projet Supabase est actif');
  process.exit(1);
});

req.on('timeout', () => {
  console.error('   ❌ Timeout - Le serveur ne répond pas');
  console.log('\n📝 Solutions possibles :');
  console.log('   1. Vérifiez votre connexion internet');
  console.log('   2. Vérifiez que l\'URL Supabase est correcte');
  console.log('   3. Réessayez dans quelques instants');
  req.destroy();
  process.exit(1);
});

req.end();

