/**
 * ============================================================================
 * CRON: Réconciliation des trials expirés
 * ============================================================================
 * 
 * Tâche planifiée pour gérer les cas edge :
 * - Trials expirés sans mise à jour webhook
 * - Divergences entre Stripe et DB
 * 
 * À exécuter quotidiennement (ex: 03:00 UTC)
 * 
 * Sécurisé avec CRON_SECRET
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

export async function GET(req: NextRequest) {
  console.log('🕐 Cron: Réconciliation des trials');
  
  // Vérifier le secret CRON
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error('❌ Unauthorized: Invalid CRON_SECRET');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const now = new Date();
    let expiredCount = 0;
    let reconciledCount = 0;
    const errors: string[] = [];
    
    // 1) Récupérer tous les trials expirés (trial_ends_at < now)
    const { data: expiredTrials, error: queryError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, trial_plan, trial_ends_at, stripe_subscription_id, plan, plan_status')
      .eq('plan_status', 'trialing')
      .lt('trial_ends_at', now.toISOString());
    
    if (queryError) {
      console.error('❌ Erreur récupération trials expirés:', queryError);
      return NextResponse.json({ error: queryError.message }, { status: 500 });
    }
    
    if (!expiredTrials || expiredTrials.length === 0) {
      console.log('✅ Aucun trial expiré trouvé');
      return NextResponse.json({ 
        success: true, 
        expiredCount: 0, 
        reconciledCount: 0,
        message: 'Aucun trial expiré' 
      });
    }
    
    console.log(`🔍 ${expiredTrials.length} trial(s) expiré(s) trouvé(s)`);
    
    // 2) Pour chaque trial expiré, vérifier l'état réel dans Stripe
    for (const profile of expiredTrials) {
      try {
        let shouldDowngrade = true;
        
        // Si on a un stripe_subscription_id, vérifier l'état réel
        if (profile.stripe_subscription_id) {
          try {
            const subscription = await stripe.subscriptions.retrieve(profile.stripe_subscription_id);
            
            console.log(`📋 Subscription ${profile.stripe_subscription_id} status:`, subscription.status);
            
            // Si le subscription est actif (paiement réussi), ne pas downgrade
            if (subscription.status === 'active') {
              shouldDowngrade = false;
              reconciledCount++;
              
              // Mettre à jour vers active (normalement fait par webhook, mais safety net)
              const plan = profile.trial_plan || 'pro';
              await supabaseAdmin
                .from('user_profiles')
                .update({
                  plan: plan,
                  plan_status: 'active',
                  trial_plan: null,
                  trial_ends_at: null,
                  updated_at: now.toISOString(),
                })
                .eq('id', profile.id);
              
              console.log(`✅ User ${profile.id}: Trial → Active (${plan})`);
            }
          } catch (stripeErr: any) {
            console.error(`⚠️ Erreur Stripe pour ${profile.stripe_subscription_id}:`, stripeErr.message);
            // Si erreur Stripe, on downgrade quand même par sécurité
          }
        }
        
        // Si pas de subscription actif, downgrade vers free
        if (shouldDowngrade) {
          await supabaseAdmin
            .from('user_profiles')
            .update({
              plan: 'free',
              plan_status: 'canceled',
              trial_plan: null,
              trial_ends_at: null,
              updated_at: now.toISOString(),
            })
            .eq('id', profile.id);
          
          expiredCount++;
          console.log(`✅ User ${profile.id}: Trial expiré → Free`);
        }
      } catch (err: any) {
        console.error(`❌ Erreur traitement user ${profile.id}:`, err.message);
        errors.push(`User ${profile.id}: ${err.message}`);
      }
    }
    
    console.log(`✅ Réconciliation terminée: ${expiredCount} expirés, ${reconciledCount} réconciliés`);
    
    return NextResponse.json({
      success: true,
      expiredCount,
      reconciledCount,
      totalProcessed: expiredTrials.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `${expiredCount} trial(s) expiré(s), ${reconciledCount} réconcilié(s)`,
    });
  } catch (error: any) {
    console.error('❌ Erreur réconciliation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const runtime = 'nodejs';


