import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Route pour forcer la synchronisation de l'abonnement Stripe
 * Utilisée quand le webhook ne fonctionne pas
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    console.log('🔄 Synchronisation manuelle demandée pour userId:', userId);

    if (!userId) {
      return NextResponse.json({ error: "UserId requis" }, { status: 400 });
    }

    // Récupérer l'utilisateur
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (userError || !userData?.user) {
      console.error('❌ Utilisateur non trouvé:', userError);
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    console.log('👤 Utilisateur trouvé:', userData.user.email);
    console.log('📋 Métadonnées actuelles:', userData.user.user_metadata);

    // Chercher les abonnements Stripe pour cet utilisateur
    const email = userData.user.email;
    
    console.log('🔍 Recherche des abonnements Stripe pour:', email);

    // Chercher les clients Stripe avec cet email
    const customers = await stripe.customers.list({
      email: email,
      limit: 10,
    });

    console.log(`📊 ${customers.data.length} client(s) Stripe trouvé(s)`);

    if (customers.data.length === 0) {
      return NextResponse.json({ 
        error: "Aucun client Stripe trouvé avec cet email. Le paiement n'a peut-être pas encore été traité." 
      }, { status: 404 });
    }

    // Récupérer les abonnements du client le plus récent
    const customer = customers.data[0];
    console.log('👥 Client Stripe:', customer.id);

    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      limit: 10,
    });

    console.log(`📊 ${subscriptions.data.length} abonnement(s) trouvé(s)`);

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ 
        error: "Aucun abonnement actif trouvé. Le paiement n'a peut-être pas encore été traité." 
      }, { status: 404 });
    }

    // Prendre l'abonnement le plus récent qui est actif ou en trial
    const activeSubscription = subscriptions.data.find(
      sub => sub.status === 'active' || sub.status === 'trialing'
    );

    if (!activeSubscription) {
      return NextResponse.json({ 
        error: "Aucun abonnement actif trouvé" 
      }, { status: 404 });
    }

    console.log('✅ Abonnement actif trouvé:', activeSubscription.id);
    console.log('📋 Status:', activeSubscription.status);
    console.log('💰 Price ID:', activeSubscription.items.data[0]?.price.id);

    // Déterminer le plan depuis le Price ID
    const priceId = activeSubscription.items.data[0]?.price.id;
    const premiumPriceId = process.env.STRIPE_PRICE_PREMIUM || process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM;
    const premiumYearlyPriceId = process.env.STRIPE_PRICE_PREMIUM_YEARLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY;
    
    const plan = (priceId === premiumPriceId || priceId === premiumYearlyPriceId) ? 'premium' : 'pro';
    
    console.log('🎯 Plan détecté:', plan);

    // Nettoyer les métadonnées d'essai
    const cleanedMetadata = { ...userData.user.user_metadata };
    delete cleanedMetadata.premium_trial_started_at;
    delete cleanedMetadata.premium_trial_ends_at;
    delete cleanedMetadata.premium_trial_active;

    // Mettre à jour la table subscriptions
    console.log('💾 Mise à jour de la table subscriptions...');
    const { error: subError } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        user_id: userId,
        status: activeSubscription.status,
        price_id: priceId,
        stripe_subscription_id: activeSubscription.id,
        stripe_customer_id: customer.id,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (subError) {
      console.error('❌ Erreur mise à jour subscriptions:', subError);
    } else {
      console.log('✅ Table subscriptions mise à jour');
    }

    // Mettre à jour les métadonnées utilisateur
    const metadataUpdate = {
      user_metadata: {
        ...cleanedMetadata,
        subscription_plan: plan,
        is_pro: true,
        is_premium: plan === 'premium',
        stripe_customer_id: customer.id,
        stripe_subscription_id: activeSubscription.id,
        subscription_status: activeSubscription.status,
      },
    };

    console.log('💾 Mise à jour des métadonnées:', metadataUpdate);
    const { error: metaError } = await supabaseAdmin.auth.admin.updateUserById(userId, metadataUpdate);

    if (metaError) {
      console.error('❌ Erreur mise à jour métadonnées:', metaError);
      return NextResponse.json({ error: "Erreur lors de la mise à jour des métadonnées" }, { status: 500 });
    }

    console.log('✅✅✅ SYNCHRONISATION RÉUSSIE');

    return NextResponse.json({
      success: true,
      message: 'Abonnement synchronisé avec succès !',
      subscription: {
        plan,
        status: activeSubscription.status,
        stripe_subscription_id: activeSubscription.id,
      },
    });

  } catch (error: any) {
    console.error('❌ Erreur lors de la synchronisation:', error);
    return NextResponse.json({ 
      error: error.message || "Une erreur est survenue" 
    }, { status: 500 });
  }
}

