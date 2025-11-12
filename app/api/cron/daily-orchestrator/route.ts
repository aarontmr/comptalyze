import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { decrypt } from '@/lib/encryption';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(process.env.RESEND_API_KEY);
const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Orchestrator quotidien : Exécute plusieurs tâches quotidiennes
 * - Envoi emails marketing J+3
 * - Synchronisation des intégrations (toutes les 6h)
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const providedSecret = authHeader?.replace('Bearer ', '') || req.nextUrl.searchParams.get('secret');

    if (!CRON_SECRET || providedSecret !== CRON_SECRET) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const results: any = {
      marketingEmails: { sent: 0, errors: 0 },
      syncIntegrations: { synced: 0, errors: 0 },
    };

    // ==============================================
    // TÂCHE 1 : Envoyer emails marketing J+3
    // ==============================================
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://comptalyze.com';
      const fromEmail = process.env.COMPANY_FROM_EMAIL || 'Comptalyze <no-reply@comptalyze.com>';

      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      threeDaysAgo.setHours(0, 0, 0, 0);

      const fourDaysAgo = new Date();
      fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
      fourDaysAgo.setHours(0, 0, 0, 0);

      const { data: users, error: usersError } = await supabaseAdmin
        .from('user_profiles')
        .select('id, email, created_at')
        .gte('created_at', fourDaysAgo.toISOString())
        .lt('created_at', threeDaysAgo.toISOString());

      if (usersError) {
        throw usersError;
      }

      if (users && users.length > 0) {
        for (const user of users) {
          if (!user.email) continue;

          try {
            const promoCode = `WELCOME${user.id.slice(0, 8).toUpperCase()}`;
            await resend.emails.send({
              from: fromEmail,
              to: user.email,
              subject: '🎁 Code promo Comptalyze : -20% sur votre abonnement Premium',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0e0f12; padding: 30px; border-radius: 10px;">
                  <div style="background: linear-gradient(135deg, #00D084 0%, #2E6CF6 100%); padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🎁 Offre Spéciale</h1>
                  </div>
                  <div style="color: #e0e0e0;">
                    <p style="font-size: 16px; line-height: 1.6;">Bonjour,</p>
                    <p style="font-size: 16px; line-height: 1.6;">
                      Merci d'avoir rejoint Comptalyze ! Pour vous remercier, nous vous offrons <strong style="color: #00D084;">-20% sur votre premier mois Premium</strong>.
                    </p>
                    <div style="background-color: #1a1d24; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px dashed #00D084;">
                      <p style="margin: 0; font-size: 14px; color: #999;">Votre code promo :</p>
                      <p style="margin: 10px 0; font-size: 32px; font-weight: bold; color: #00D084; letter-spacing: 2px;">${promoCode}</p>
                    </div>
                    <div style="margin: 30px 0; text-align: center;">
                      <a href="${baseUrl}/pricing?promo=${promoCode}" 
                         style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #00D084 0%, #2E6CF6 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                        Profiter de l'offre
                      </a>
                    </div>
                    <p style="font-size: 14px; color: #999; margin-top: 30px;">
                      Cette offre est valable pendant 7 jours. Ne la manquez pas !
                    </p>
                  </div>
                </div>
              `,
            });
            results.marketingEmails.sent++;
          } catch (emailError: any) {
            console.error(`Erreur envoi email pour ${user.email}:`, emailError);
            results.marketingEmails.errors++;
          }
        }
      }
    } catch (error: any) {
      console.error('Erreur tâche marketing emails:', error);
      results.marketingEmails.errors++;
    }

    // ==============================================
    // TÂCHE 2 : Synchronisation des intégrations (une fois par jour)
    // ==============================================
    try {
      // Exécuter la sync une fois par jour (limite Hobby plan)
        const { data: integrations, error: integrationsError } = await supabase
          .from('integration_tokens')
          .select('*')
          .eq('is_active', true);

        if (integrationsError) {
          throw integrationsError;
        }

        if (integrations && integrations.length > 0) {
          for (const integration of integrations) {
            try {
              if (integration.provider === 'shopify') {
                await syncShopify(integration);
                results.syncIntegrations.synced++;
              } else if (integration.provider === 'stripe') {
                await syncStripe(integration);
                results.syncIntegrations.synced++;
              }
            } catch (error: any) {
              console.error(`Erreur sync ${integration.provider} pour user ${integration.user_id}:`, error);
              results.syncIntegrations.errors++;
            }
          }
        }
    } catch (error: any) {
      console.error('Erreur tâche sync intégrations:', error);
      results.syncIntegrations.errors++;
    }

    return NextResponse.json({
      message: 'Orchestrator quotidien terminé',
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error: any) {
    console.error('Erreur orchestrator quotidien:', error);
    return NextResponse.json({ error: error.message || 'Erreur orchestrator quotidien' }, { status: 500 });
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
    sync_type: 'cron',
    status: 'success',
    records_synced: syncedCount,
    metadata: { total_orders: orders.length },
  });

  await supabase
    .from('integration_tokens')
    .update({ last_sync_at: new Date().toISOString() })
    .eq('id', integration.id);
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
    sync_type: 'cron',
    status: 'success',
    records_synced: syncedCount,
    metadata: { total_charges: charges.data.length },
  });

  await supabase
    .from('integration_tokens')
    .update({ last_sync_at: new Date().toISOString() })
    .eq('id', integration.id);
}

