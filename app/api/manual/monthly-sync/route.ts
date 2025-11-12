import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { decrypt } from '@/lib/encryption';
import Stripe from 'stripe';
import { sendMonthlyRecapEmail } from '@/lib/email';

/**
 * Route pour déclencher manuellement la synchronisation mensuelle
 * Usage: POST /api/manual/monthly-sync?secret=<CRON_SECRET>&force=true
 * 
 * Paramètres:
 * - secret: CRON_SECRET (requis)
 * - force: true pour forcer même si ce n'est pas le dernier jour du mois (optionnel)
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const providedSecret = request.nextUrl.searchParams.get('secret');
    const force = request.nextUrl.searchParams.get('force') === 'true';

    const secret = authHeader?.replace('Bearer ', '') || providedSecret;

    if (!cronSecret || secret !== cronSecret) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    console.log('🗓️ Démarrage sync mensuel (manuel)...');

    const now = new Date();
    
    // Vérifier si on est le dernier jour du mois (sauf si force=true)
    if (!force) {
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      
      if (tomorrow.getMonth() === now.getMonth()) {
        console.log('⏭️ Pas le dernier jour du mois, utilisez ?force=true pour forcer');
        return NextResponse.json({ 
          message: 'Pas le dernier jour du mois', 
          hint: 'Ajoutez ?force=true pour forcer l\'exécution',
          date: now.toISOString() 
        });
      }
    }

    // Calculer le mois qui vient de se terminer
    const lastMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    const lastMonthEnd = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);

    const monthLabel = lastMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    console.log(`📅 Sync du mois : ${monthLabel}`);

    const { data: integrations, error: integrationsError } = await supabase
      .from('integration_tokens')
      .select('*, users:user_id(email, raw_user_meta_data)')
      .eq('is_active', true);

    if (integrationsError) {
      throw integrationsError;
    }

    if (!integrations || integrations.length === 0) {
      console.log('Aucune intégration active');
      return NextResponse.json({ message: 'Aucune intégration active', synced: 0 });
    }

    const results = [];
    let totalUsers = 0;

    const userIntegrations = integrations.reduce((acc: any, integration: any) => {
      if (!acc[integration.user_id]) {
        acc[integration.user_id] = {
          userId: integration.user_id,
          email: integration.users?.email,
          integrations: []
        };
      }
      acc[integration.user_id].integrations.push(integration);
      return acc;
    }, {});

    for (const userData of Object.values(userIntegrations) as any[]) {
      try {
        let totalCA = 0;
        const details: any[] = [];

        const shopifyIntegration = userData.integrations.find((i: any) => i.provider === 'shopify');
        if (shopifyIntegration) {
          const shopifyCA = await syncShopifyMonth(shopifyIntegration, lastMonthStart, lastMonthEnd);
          totalCA += shopifyCA;
          if (shopifyCA > 0) {
            details.push({ source: 'Shopify', amount: shopifyCA });
          }
        }

        const stripeIntegration = userData.integrations.find((i: any) => i.provider === 'stripe');
        if (stripeIntegration) {
          const stripeCA = await syncStripeMonth(stripeIntegration, lastMonthStart, lastMonthEnd);
          totalCA += stripeCA;
          if (stripeCA > 0) {
            details.push({ source: 'Stripe', amount: stripeCA });
          }
        }

        if (totalCA > 0) {
          const { error: insertError } = await supabase
            .from('ca_records')
            .insert({
              user_id: userData.userId,
              year: lastMonth.getFullYear(),
              month: lastMonth.getMonth() + 1,
              amount_eur: totalCA,
              activity_type: 'services',
              computed_net_eur: 0,
              computed_contrib_eur: 0,
              source: 'auto_sync',
              metadata: {
                sync_type: 'manual',
                details,
                sync_date: new Date().toISOString(),
              }
            });

          if (insertError && insertError.code !== '23505') {
            console.error(`Erreur insertion CA pour user ${userData.userId}:`, insertError);
          } else {
            console.log(`✅ CA enregistré pour user ${userData.userId}: ${totalCA}€`);
          }

          if (userData.email) {
            const { data: preferences } = await supabase
              .from('email_preferences')
              .select('monthly_recap_email')
              .eq('user_id', userData.userId)
              .single();

            const emailEnabled = preferences?.monthly_recap_email ?? true;

            if (emailEnabled) {
              await sendMonthlyRecapEmail({
                email: userData.email,
                month: monthLabel,
                totalCA,
                details,
              });
              console.log(`📧 Email envoyé à ${userData.email}`);
            }
          }

          totalUsers++;
        }

        await supabase.from('sync_logs').insert({
          user_id: userData.userId,
          provider: 'monthly_sync',
          sync_type: 'manual',
          status: 'success',
          records_synced: details.length,
          metadata: { totalCA, month: monthLabel, details },
        });

        results.push({
          userId: userData.userId,
          totalCA,
          details,
        });

      } catch (error: any) {
        console.error(`Erreur sync mensuel pour user ${userData.userId}:`, error);
        
        await supabase.from('sync_logs').insert({
          user_id: userData.userId,
          provider: 'monthly_sync',
          sync_type: 'manual',
          status: 'error',
          records_synced: 0,
          error_message: error.message,
        });
      }
    }

    console.log(`✅ Sync mensuel terminé. ${totalUsers} utilisateurs traités`);

    return NextResponse.json({
      message: 'Sync mensuel terminé',
      month: monthLabel,
      totalUsers,
      results,
    });

  } catch (error: any) {
    console.error('Erreur sync mensuel:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function syncShopifyMonth(integration: any, startDate: Date, endDate: Date) {
  try {
    const accessToken = decrypt(integration.access_token);
    const shopDomain = integration.shop_domain;

    const response = await fetch(
      `https://${shopDomain}/admin/api/2024-01/orders.json?status=any&created_at_min=${startDate.toISOString()}&created_at_max=${endDate.toISOString()}&limit=250`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText}`);
    }

    const data = await response.json();
    const orders = data.orders || [];

    return orders.reduce((sum: number, order: any) => {
      return sum + parseFloat(order.total_price || 0);
    }, 0);
  } catch (error) {
    console.error('Erreur sync Shopify month:', error);
    return 0;
  }
}

async function syncStripeMonth(integration: any, startDate: Date, endDate: Date) {
  try {
    const accessToken = decrypt(integration.access_token);
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY non configurée');
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-10-29.clover' });

    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    const endTimestamp = Math.floor(endDate.getTime() / 1000);

    const charges = await stripe.charges.list(
      {
        created: {
          gte: startTimestamp,
          lte: endTimestamp,
        },
        limit: 100,
      },
      {
        stripeAccount: integration.stripe_account_id,
      }
    );

    return charges.data
      .filter(charge => charge.status === 'succeeded')
      .reduce((sum, charge) => sum + (charge.amount / 100), 0);
  } catch (error) {
    console.error('Erreur sync Stripe month:', error);
    return 0;
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Utilisez POST avec ?secret=<CRON_SECRET>&force=true (optionnel)',
    endpoint: '/api/manual/monthly-sync',
    method: 'POST',
  });
}

