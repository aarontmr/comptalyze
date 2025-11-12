import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { decrypt } from '@/lib/encryption';
import Stripe from 'stripe';

/**
 * Route pour déclencher manuellement la synchronisation des intégrations
 * Usage: POST /api/manual/sync-integrations?secret=<CRON_SECRET>
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const providedSecret = request.nextUrl.searchParams.get('secret');

    const secret = authHeader?.replace('Bearer ', '') || providedSecret;

    if (!cronSecret || secret !== cronSecret) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    console.log('🔄 Démarrage sync automatique (manuel)...');

    const { data: integrations, error: integrationsError } = await supabase
      .from('integration_tokens')
      .select('*')
      .eq('is_active', true);

    if (integrationsError) {
      throw integrationsError;
    }

    if (!integrations || integrations.length === 0) {
      console.log('Aucune intégration active à synchroniser');
      return NextResponse.json({ message: 'Aucune intégration active', synced: 0 });
    }

    let totalSynced = 0;
    const results = [];

    for (const integration of integrations) {
      try {
        if (integration.provider === 'shopify') {
          const result = await syncShopify(integration);
          results.push(result);
          totalSynced += result.records;
        } else if (integration.provider === 'stripe') {
          const result = await syncStripe(integration);
          results.push(result);
          totalSynced += result.records;
        }
      } catch (error: any) {
        console.error(`Erreur sync ${integration.provider} pour user ${integration.user_id}:`, error);
        
        await supabase.from('sync_logs').insert({
          user_id: integration.user_id,
          provider: integration.provider,
          sync_type: 'manual',
          status: 'error',
          records_synced: 0,
          error_message: error.message,
        });
      }
    }

    console.log(`✅ Sync terminé. ${totalSynced} records synchronisés`);

    return NextResponse.json({
      message: 'Synchronisation terminée',
      totalSynced,
      results,
    });
  } catch (error: any) {
    console.error('Erreur cron sync:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function syncShopify(integration: any) {
  const accessToken = decrypt(integration.access_token);
  const shopDomain = integration.shop_domain;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const response = await fetch(
    `https://${shopDomain}/admin/api/2024-01/orders.json?status=any&created_at_min=${thirtyDaysAgo.toISOString()}`,
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

  let syncedCount = 0;
  for (const order of orders) {
    const orderDate = new Date(order.created_at);
    const amount = parseFloat(order.total_price);

    const { data: existing } = await supabase
      .from('ca_records')
      .select('id')
      .eq('user_id', integration.user_id)
      .eq('external_id', `shopify_${order.id}`)
      .single();

    if (!existing) {
      await supabase.from('ca_records').insert({
        user_id: integration.user_id,
        date: orderDate.toISOString().split('T')[0],
        amount: amount,
        source: 'shopify',
        external_id: `shopify_${order.id}`,
        metadata: {
          order_number: order.order_number,
          currency: order.currency,
        },
      });
      syncedCount++;
    }
  }

  await supabase.from('sync_logs').insert({
    user_id: integration.user_id,
    provider: 'shopify',
    sync_type: 'manual',
    status: 'success',
    records_synced: syncedCount,
    metadata: { total_orders: orders.length },
  });

  await supabase
    .from('integration_tokens')
    .update({ last_sync_at: new Date().toISOString() })
    .eq('id', integration.id);

  return { user_id: integration.user_id, provider: 'shopify', records: syncedCount };
}

async function syncStripe(integration: any) {
  const accessToken = decrypt(integration.access_token);
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY non configurée');
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-10-29.clover' });

  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);

  const charges = await stripe.charges.list(
    {
      created: { gte: thirtyDaysAgo },
      limit: 100,
    },
    {
      stripeAccount: integration.stripe_account_id,
    }
  );

  let syncedCount = 0;
  for (const charge of charges.data) {
    if (charge.status !== 'succeeded') continue;

    const chargeDate = new Date(charge.created * 1000);
    const amount = charge.amount / 100;

    const { data: existing } = await supabase
      .from('ca_records')
      .select('id')
      .eq('user_id', integration.user_id)
      .eq('external_id', `stripe_${charge.id}`)
      .single();

    if (!existing) {
      await supabase.from('ca_records').insert({
        user_id: integration.user_id,
        date: chargeDate.toISOString().split('T')[0],
        amount: amount,
        source: 'stripe',
        external_id: `stripe_${charge.id}`,
        metadata: {
          currency: charge.currency,
          description: charge.description,
        },
      });
      syncedCount++;
    }
  }

  await supabase.from('sync_logs').insert({
    user_id: integration.user_id,
    provider: 'stripe',
    sync_type: 'manual',
    status: 'success',
    records_synced: syncedCount,
    metadata: { total_charges: charges.data.length },
  });

  await supabase
    .from('integration_tokens')
    .update({ last_sync_at: new Date().toISOString() })
    .eq('id', integration.id);

  return { user_id: integration.user_id, provider: 'stripe', records: syncedCount };
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Utilisez POST avec ?secret=<CRON_SECRET>',
    endpoint: '/api/manual/sync-integrations',
    method: 'POST',
  });
}

