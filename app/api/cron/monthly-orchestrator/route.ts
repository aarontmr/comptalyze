import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { supabase } from '@/lib/supabaseClient';
import { decrypt } from '@/lib/encryption';
import Stripe from 'stripe';
import { sendMonthlyRecapEmail } from '@/lib/email';

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
 * Orchestrator mensuel : Exécute plusieurs tâches mensuelles
 * - Envoi rappels mensuels (le 2 du mois)
 * - Synchronisation mensuelle CA (dernier jour du mois)
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const providedSecret = authHeader?.replace('Bearer ', '') || req.nextUrl.searchParams.get('secret');

    if (!CRON_SECRET || providedSecret !== CRON_SECRET) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const parisTime = toZonedTime(new Date(), 'Europe/Paris');
    const dayOfMonth = parisTime.getDate();
    const isLastDayOfMonth = new Date(parisTime.getFullYear(), parisTime.getMonth() + 1, 0).getDate() === dayOfMonth;

    const results: any = {
      reminders: { sent: 0, skipped: false },
      monthlySync: { synced: 0, skipped: false },
    };

    // ==============================================
    // TÂCHE 1 : Envoyer rappels mensuels (le 2 du mois)
    // ==============================================
    if (dayOfMonth === 2) {
      try {
        const { data: preferences, error: prefError } = await supabaseAdmin
          .from('email_preferences')
          .select('user_id')
          .eq('monthly_reminder', true);

        if (prefError) {
          throw prefError;
        }

        if (preferences && preferences.length > 0) {
          const userIds = preferences.map((p) => p.user_id);

          const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

          if (usersError) {
            throw usersError;
          }

          const premiumUsers = users.users.filter((u) => userIds.includes(u.id));

          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://comptalyze.com';
          const fromEmail = process.env.COMPANY_FROM_EMAIL || 'Comptalyze <no-reply@comptalyze.com>';

          for (const user of premiumUsers) {
            if (!user.email) continue;

            try {
              await resend.emails.send({
                from: fromEmail,
                to: user.email,
                subject: '📅 Rappel Comptalyze : Enregistrez votre CA du mois dernier',
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0e0f12; padding: 30px; border-radius: 10px;">
                    <div style="background: linear-gradient(135deg, #00D084 0%, #2E6CF6 100%); padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
                      <h1 style="color: white; margin: 0; font-size: 24px;">📅 Rappel Mensuel</h1>
                    </div>
                    <div style="color: #e0e0e0;">
                      <p style="font-size: 16px; line-height: 1.6;">Bonjour,</p>
                      <p style="font-size: 16px; line-height: 1.6;">
                        N'oubliez pas d'enregistrer votre chiffre d'affaires du mois dernier dans Comptalyze pour un suivi précis de vos cotisations URSSAF.
                      </p>
                      <div style="margin: 30px 0; text-align: center;">
                        <a href="${baseUrl}/dashboard" 
                           style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #00D084 0%, #2E6CF6 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                          Enregistrer mon CA
                        </a>
                      </div>
                    </div>
                  </div>
                `,
              });
              results.reminders.sent++;
            } catch (emailError: any) {
              console.error(`Erreur envoi rappel pour ${user.email}:`, emailError);
            }
          }
        }
      } catch (error: any) {
        console.error('Erreur tâche rappels mensuels:', error);
      }
    } else {
      results.reminders.skipped = true;
      results.reminders.note = `Rappels envoyés seulement le 2 du mois (jour actuel: ${dayOfMonth})`;
    }

    // ==============================================
    // TÂCHE 2 : Synchronisation mensuelle (dernier jour du mois)
    // ==============================================
    if (isLastDayOfMonth) {
      try {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
        const lastMonthEnd = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
        const monthLabel = lastMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

        const { data: integrations, error: integrationsError } = await supabase
          .from('integration_tokens')
          .select('*, users:user_id(email, raw_user_meta_data)')
          .eq('is_active', true);

        if (integrationsError) {
          throw integrationsError;
        }

        if (integrations && integrations.length > 0) {
          const userIntegrations = integrations.reduce((acc: any, integration: any) => {
            if (!acc[integration.user_id]) {
              acc[integration.user_id] = {
                userId: integration.user_id,
                email: integration.users?.email,
                integrations: [],
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
                const { error: insertError } = await supabase.from('ca_records').insert({
                  user_id: userData.userId,
                  year: lastMonth.getFullYear(),
                  month: lastMonth.getMonth() + 1,
                  amount_eur: totalCA,
                  activity_type: 'services',
                  computed_net_eur: 0,
                  computed_contrib_eur: 0,
                  source: 'auto_sync',
                  metadata: {
                    sync_type: 'monthly_cron',
                    details,
                    sync_date: new Date().toISOString(),
                  },
                });

                if (!insertError || insertError.code === '23505') {
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
                    }
                  }
                  results.monthlySync.synced++;
                }
              }
            } catch (error: any) {
              console.error(`Erreur sync mensuel pour user ${userData.userId}:`, error);
            }
          }
        }
      } catch (error: any) {
        console.error('Erreur tâche sync mensuel:', error);
      }
    } else {
      results.monthlySync.skipped = true;
      results.monthlySync.note = `Sync mensuel exécuté seulement le dernier jour du mois (jour actuel: ${dayOfMonth})`;
    }

    return NextResponse.json({
      message: 'Orchestrator mensuel terminé',
      timestamp: new Date().toISOString(),
      dayOfMonth,
      isLastDayOfMonth,
      results,
    });
  } catch (error: any) {
    console.error('Erreur orchestrator mensuel:', error);
    return NextResponse.json({ error: error.message || 'Erreur orchestrator mensuel' }, { status: 500 });
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
      .filter((charge) => charge.status === 'succeeded')
      .reduce((sum, charge) => sum + charge.amount / 100, 0);
  } catch (error) {
    console.error('Erreur sync Stripe month:', error);
    return 0;
  }
}

