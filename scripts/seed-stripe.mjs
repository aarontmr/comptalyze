#!/usr/bin/env node

/**
 * Script pour vérifier et synchroniser les produits/prix Stripe
 * avec la configuration locale de l'app
 * 
 * Usage:
 *   node scripts/seed-stripe.mjs
 *   node scripts/seed-stripe.mjs --create  (pour créer les produits manquants)
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '../.env.local') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

// Configuration attendue des plans
const EXPECTED_PLANS = {
  pro_monthly: {
    name: 'Comptalyze Pro',
    amount: 390, // 3,90€ en centimes
    currency: 'eur',
    interval: 'month',
    env_var: 'STRIPE_PRICE_PRO',
  },
  pro_yearly: {
    name: 'Comptalyze Pro (Annuel)',
    amount: 3790, // 37,90€
    currency: 'eur',
    interval: 'year',
    env_var: 'STRIPE_PRICE_PRO_YEARLY',
  },
  premium_monthly: {
    name: 'Comptalyze Premium',
    amount: 790, // 7,90€
    currency: 'eur',
    interval: 'month',
    env_var: 'STRIPE_PRICE_PREMIUM',
  },
  premium_yearly: {
    name: 'Comptalyze Premium (Annuel)',
    amount: 7590, // 75,90€
    currency: 'eur',
    interval: 'year',
    env_var: 'STRIPE_PRICE_PREMIUM_YEARLY',
  },
};

async function main() {
  const createMode = process.argv.includes('--create');
  
  console.log('🔍 Vérification de la configuration Stripe...\n');
  
  // Récupérer tous les produits Stripe
  const products = await stripe.products.list({ limit: 100 });
  console.log(`📦 ${products.data.length} produits trouvés sur Stripe\n`);
  
  // Récupérer tous les prix
  const prices = await stripe.prices.list({ limit: 100 });
  console.log(`💰 ${prices.data.length} prix trouvés sur Stripe\n`);
  
  const issues = [];
  const checks = [];
  
  // Vérifier chaque plan attendu
  for (const [planKey, expectedPlan] of Object.entries(EXPECTED_PLANS)) {
    const envPriceId = process.env[expectedPlan.env_var];
    
    console.log(`\n📋 Vérification: ${expectedPlan.name} (${expectedPlan.interval})`);
    console.log(`   Variable: ${expectedPlan.env_var}`);
    
    if (!envPriceId) {
      issues.push({
        plan: planKey,
        issue: 'ENV_VAR_MISSING',
        message: `❌ Variable ${expectedPlan.env_var} non définie dans .env.local`,
      });
      console.log(`   ❌ Variable non définie`);
      continue;
    }
    
    console.log(`   ✓ Variable définie: ${envPriceId}`);
    
    // Vérifier que le prix existe sur Stripe
    try {
      const price = await stripe.prices.retrieve(envPriceId);
      
      console.log(`   ✓ Prix trouvé sur Stripe`);
      
      // Vérifier la cohérence
      const issues_found = [];
      
      if (price.unit_amount !== expectedPlan.amount) {
        issues_found.push(`Montant incorrect: ${price.unit_amount / 100}€ au lieu de ${expectedPlan.amount / 100}€`);
      }
      
      if (price.currency !== expectedPlan.currency) {
        issues_found.push(`Devise incorrecte: ${price.currency} au lieu de ${expectedPlan.currency}`);
      }
      
      if (price.recurring?.interval !== expectedPlan.interval) {
        issues_found.push(`Intervalle incorrect: ${price.recurring?.interval} au lieu de ${expectedPlan.interval}`);
      }
      
      if (issues_found.length > 0) {
        issues.push({
          plan: planKey,
          issue: 'MISMATCH',
          message: `⚠️  Configuration incorrecte:\n      ${issues_found.join('\n      ')}`,
        });
        console.log(`   ⚠️  ${issues_found.join('\n      ')}`);
      } else {
        checks.push({
          plan: planKey,
          status: 'OK',
          priceId: envPriceId,
        });
        console.log(`   ✅ Configuration correcte`);
      }
    } catch (error) {
      issues.push({
        plan: planKey,
        issue: 'PRICE_NOT_FOUND',
        message: `❌ Prix ${envPriceId} introuvable sur Stripe`,
      });
      console.log(`   ❌ Prix introuvable sur Stripe`);
    }
  }
  
  // Résumé
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ');
  console.log('='.repeat(60));
  
  if (checks.length > 0) {
    console.log(`\n✅ ${checks.length} plan(s) correctement configuré(s):`);
    checks.forEach(check => {
      console.log(`   - ${check.plan}: ${check.priceId}`);
    });
  }
  
  if (issues.length > 0) {
    console.log(`\n⚠️  ${issues.length} problème(s) détecté(s):\n`);
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.message}`);
    });
    
    if (createMode) {
      console.log('\n🛠️  Mode création activé. Création des produits manquants...');
      // TODO: Implémenter la création automatique
      console.log('⚠️  Fonctionnalité de création automatique à implémenter');
    } else {
      console.log('\n💡 Pour créer automatiquement les produits manquants:');
      console.log('   node scripts/seed-stripe.mjs --create');
      console.log('\n💡 Ou créez-les manuellement sur https://dashboard.stripe.com/products');
    }
    
    process.exit(1);
  } else {
    console.log('\n🎉 Tout est en ordre ! Aucun problème détecté.');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
});

