import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id || session.metadata?.userId;
      const plan = session.metadata?.plan || 'pro'; // Par défaut "pro" si non spécifié

      if (userId) {
        // Récupérer l'abonnement créé pour obtenir le subscription_id
        const subscriptionId = session.subscription as string;
        
        // Ajouter userId dans les métadonnées de l'abonnement Stripe pour les événements futurs
        if (subscriptionId) {
          try {
            await stripe.subscriptions.update(subscriptionId, {
              metadata: {
                userId: userId,
                plan: plan,
              },
            });
          } catch (err) {
            console.error('Erreur lors de la mise à jour des métadonnées de l\'abonnement:', err);
          }
        }
        
        // Récupérer les données utilisateur actuelles
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
        
        if (userData?.user) {
          // Déterminer le price_id depuis le plan
          const priceId = plan === 'premium' 
            ? (process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM || process.env.STRIPE_PRICE_PREMIUM)
            : (process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || process.env.STRIPE_PRICE_PRO);

          // Créer ou mettre à jour l'enregistrement dans la table subscriptions
          await supabaseAdmin
            .from('subscriptions')
            .upsert({
              user_id: userId,
              status: 'active',
              price_id: priceId,
              stripe_subscription_id: subscriptionId,
              stripe_customer_id: session.customer as string,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'user_id',
            });

          // Mettre à jour les métadonnées avec le plan et le statut (pour compatibilité)
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: { 
              ...userData.user.user_metadata,
              subscription_plan: plan, // "pro" ou "premium"
              is_pro: true, // Les deux plans sont "pro"
              is_premium: plan === 'premium',
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscriptionId,
              subscription_status: 'active',
            },
          });

          // Track upgrade completed dans analytics_events
          try {
            await supabaseAdmin
              .from('analytics_events')
              .insert([{
                event_name: 'upgrade_completed',
                user_id: userId,
                metadata: {
                  plan,
                  stripe_subscription_id: subscriptionId,
                  stripe_customer_id: session.customer,
                }
              }]);
            console.log(`📊 Événement upgrade_completed tracké pour ${userId}`);
          } catch (err) {
            console.error('Erreur lors du tracking de l\'événement upgrade_completed:', err);
          }
          
          console.log(`✅ Utilisateur ${userId} mis à jour avec le plan ${plan}`);
        }
      }
    }

    // Gérer les changements d'abonnement (upgrade/downgrade)
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId || subscription.metadata?.client_reference_id;
      
      if (userId) {
        // Déterminer le plan depuis le Price ID
        const priceId = subscription.items.data[0]?.price.id;
        const premiumPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM || process.env.STRIPE_PRICE_PREMIUM;
        const plan = priceId === premiumPriceId ? 'premium' : 'pro';
        
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
        
        if (userData?.user) {
          // Mettre à jour la table subscriptions
          await supabaseAdmin
            .from('subscriptions')
            .upsert({
              user_id: userId,
              status: subscription.status,
              price_id: priceId,
              stripe_subscription_id: subscription.id,
              stripe_customer_id: subscription.customer as string,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'user_id',
            });

          // Mettre à jour les métadonnées (pour compatibilité)
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: { 
              ...userData.user.user_metadata,
              subscription_plan: plan,
              is_pro: subscription.status === 'active' || subscription.status === 'trialing',
              is_premium: plan === 'premium' && (subscription.status === 'active' || subscription.status === 'trialing'),
              stripe_subscription_id: subscription.id,
              subscription_status: subscription.status,
            },
          });
          
          console.log(`✅ Abonnement ${userId} mis à jour vers le plan ${plan} (status: ${subscription.status})`);
        }
      }
    }

    // Gérer l'annulation d'abonnement
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId || subscription.metadata?.client_reference_id;

      if (userId) {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
        
        if (userData?.user) {
          // Mettre à jour la table subscriptions
          await supabaseAdmin
            .from('subscriptions')
            .upsert({
              user_id: userId,
              status: 'canceled',
              stripe_subscription_id: subscription.id,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'user_id',
            });

          // Retirer le statut premium/pro dans les métadonnées
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: { 
              ...userData.user.user_metadata,
              subscription_plan: null,
              is_pro: false,
              is_premium: false,
              subscription_status: 'canceled',
            },
          });
          
          console.log(`❌ Abonnement ${userId} annulé`);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

