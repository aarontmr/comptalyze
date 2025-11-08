#!/usr/bin/env node

/**
 * Script pour activer Premium pour yorad35712@nyfhk.com
 * 
 * Usage :
 * 1. node activate-premium-yorad35712.js
 * OU
 * 2. Visitez : https://comptalyze.com/api/admin/set-premium avec le body JSON
 */

const EMAIL = 'yorad35712@nyfhk.com';
const API_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://comptalyze.com';

async function activatePremium() {
  console.log('🚀 Activation Premium pour:', EMAIL);
  console.log('🌐 API URL:', `${API_URL}/api/admin/set-premium`);
  
  try {
    const response = await fetch(`${API_URL}/api/admin/set-premium`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: EMAIL }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Erreur:', data.error);
      console.error('Status:', response.status);
      return;
    }

    console.log('✅ Premium activé avec succès !');
    console.log('\n📋 Détails:');
    console.log('- Email:', data.user?.email);
    console.log('- User ID:', data.user?.id);
    console.log('- Plan:', data.user?.metadata?.subscription_plan);
    console.log('- Is Premium:', data.user?.metadata?.is_premium);
    console.log('- Status:', data.user?.metadata?.subscription_status);
    
    console.log('\n📝 Instructions:');
    data.instructions?.forEach((instruction, i) => {
      console.log(`${i + 1}. ${instruction}`);
    });

  } catch (error) {
    console.error('❌ Erreur réseau:', error);
  }
}

// Si exécuté directement (pas importé)
if (require.main === module) {
  activatePremium();
}

module.exports = { activatePremium };

