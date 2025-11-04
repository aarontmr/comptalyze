// Script pour activer l'abonnement Pro pour un utilisateur
const email = process.argv[2] || 'aaronetfilou@gmail.com';

async function setProSubscription() {
  try {
    const response = await fetch('http://localhost:3000/api/admin/set-pro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Erreur:', data.error);
      process.exit(1);
    }

    console.log('✅', data.message);
    console.log('\n📧 Email:', data.user.email);
    console.log('🆔 ID:', data.user.id);
    console.log('\n📋 Instructions:');
    data.instructions.forEach((instruction, index) => {
      console.log(`${index + 1}. ${instruction}`);
    });
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('\n💡 Assurez-vous que le serveur Next.js est en cours d\'exécution (npm run dev)');
    process.exit(1);
  }
}

setProSubscription();

