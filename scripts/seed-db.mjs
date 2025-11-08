#!/usr/bin/env node

/**
 * Script pour seed la base de données avec des données de demo
 * 
 * Usage:
 *   node scripts/seed-db.mjs           (seed des données)
 *   node scripts/seed-db.mjs --clean   (nettoyer les données de demo)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables Supabase manquantes (NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Données de demo
const DEMO_USERS = [
  {
    email: 'demo-free@comptalyze.com',
    password: 'DemoPassword123!',
    metadata: {
      full_name: 'Demo Gratuit',
      subscription_plan: 'free',
      is_pro: false,
      is_premium: false,
    },
  },
  {
    email: 'demo-pro@comptalyze.com',
    password: 'DemoPassword123!',
    metadata: {
      full_name: 'Demo Pro',
      subscription_plan: 'pro',
      is_pro: true,
      is_premium: false,
    },
  },
  {
    email: 'demo-premium@comptalyze.com',
    password: 'DemoPassword123!',
    metadata: {
      full_name: 'Demo Premium',
      subscription_plan: 'premium',
      is_pro: true,
      is_premium: true,
    },
  },
];

async function seedUsers() {
  console.log('👥 Création des utilisateurs de demo...\n');
  
  const createdUsers = [];
  
  for (const demoUser of DEMO_USERS) {
    try {
      // Vérifier si l'utilisateur existe déjà
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const exists = existingUsers?.users?.some(u => u.email === demoUser.email);
      
      if (exists) {
        console.log(`⏭️  ${demoUser.email} existe déjà, skip`);
        const existingUser = existingUsers.users.find(u => u.email === demoUser.email);
        createdUsers.push(existingUser);
        continue;
      }
      
      // Créer l'utilisateur
      const { data, error } = await supabase.auth.admin.createUser({
        email: demoUser.email,
        password: demoUser.password,
        email_confirm: true,
        user_metadata: demoUser.metadata,
      });
      
      if (error) {
        console.error(`❌ Erreur création ${demoUser.email}:`, error.message);
        continue;
      }
      
      console.log(`✅ ${demoUser.email} créé (plan: ${demoUser.metadata.subscription_plan})`);
      createdUsers.push(data.user);
    } catch (error) {
      console.error(`❌ Erreur:`, error.message);
    }
  }
  
  return createdUsers;
}

async function seedCARecords(users) {
  console.log('\n📊 Création des enregistrements CA de demo...\n');
  
  // Créer des enregistrements pour les 6 derniers mois
  const now = new Date();
  const records = [];
  
  for (const user of users) {
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      
      // CA aléatoire entre 1000 et 5000€
      const ca = Math.floor(Math.random() * 4000) + 1000;
      const cotisations = ca * 0.22; // 22% environ
      const net = ca - cotisations;
      
      records.push({
        user_id: user.id,
        month,
        year,
        amount_eur: ca,
        computed_contrib_eur: cotisations,
        computed_net_eur: net,
        activity_type: 'services',
        has_acre: false,
      });
    }
  }
  
  // Insérer les enregistrements
  const { error } = await supabase
    .from('urssaf_records')
    .upsert(records, { onConflict: 'user_id,year,month' });
  
  if (error) {
    console.error('❌ Erreur insertion CA records:', error.message);
  } else {
    console.log(`✅ ${records.length} enregistrements CA créés`);
  }
}

async function cleanDemoData() {
  console.log('🧹 Nettoyage des données de demo...\n');
  
  // Supprimer les utilisateurs de demo
  for (const demoUser of DEMO_USERS) {
    try {
      const { data: users } = await supabase.auth.admin.listUsers();
      const user = users?.users?.find(u => u.email === demoUser.email);
      
      if (user) {
        // Supprimer les enregistrements CA
        await supabase
          .from('urssaf_records')
          .delete()
          .eq('user_id', user.id);
        
        // Supprimer l'utilisateur
        await supabase.auth.admin.deleteUser(user.id);
        
        console.log(`✅ ${demoUser.email} supprimé`);
      } else {
        console.log(`⏭️  ${demoUser.email} n'existe pas`);
      }
    } catch (error) {
      console.error(`❌ Erreur suppression ${demoUser.email}:`, error.message);
    }
  }
  
  console.log('\n✅ Nettoyage terminé');
}

async function main() {
  const cleanMode = process.argv.includes('--clean');
  
  console.log('🌱 Seed de la base de données Comptalyze\n');
  console.log('='.repeat(60));
  
  if (cleanMode) {
    await cleanDemoData();
  } else {
    const users = await seedUsers();
    
    if (users.length > 0) {
      await seedCARecords(users);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Seed terminé!\n');
    console.log('📝 Comptes de demo créés:');
    DEMO_USERS.forEach(u => {
      console.log(`   - ${u.email} / ${u.password} (${u.metadata.subscription_plan})`);
    });
    console.log('\n💡 Pour nettoyer: node scripts/seed-db.mjs --clean');
  }
}

main().catch(error => {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
});

