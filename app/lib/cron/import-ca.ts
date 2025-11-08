/**
 * Job d'import automatique du CA depuis Stripe/Shopify
 * Exécuté mensuellement via Vercel Cron
 */

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { decrypt } from '@/lib/encryption';
import { sendMonthlyRecapEmail } from '@/lib/email';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export interface ImportResult {
  userId: string;
  provider: 'stripe' | 'shopify';
  success: boolean;
  recordsImported: number;
  totalCA: number;
  error?: string;
  dryRun: boolean;
}

export interface ImportJobResult {
  totalUsers: number;
  successCount: number;
  errorCount: number;
  results: ImportResult[];
  dryRun: boolean;
}

/**
 * Exécute l'import automatique du CA pour tous les utilisateurs Premium
 * avec intégrations actives
 */
export async function runMonthlyImportJob(dryRun = false): Promise<ImportJobResult> {
  console.log(`🚀 Démarrage import CA automatique (dryRun: ${dryRun})...`);
  
  const results: ImportResult[] = [];
  let successCount = 0;
  let errorCount = 0;
  
  try {
    // Récupérer tous les utilisateurs Premium avec intégrations actives
    const { data: integrations, error: intError } = await supabaseAdmin
      .from('integration_tokens')
      .select('*')
      .eq('is_active', true);
    
    if (intError) {
      console.error('Erreur récupération intégrations:', intError);
      throw intError;
    }
    
    if (!integrations || integrations.length === 0) {
      console.log('Aucune intégration active trouvée');
      return {
        totalUsers: 0,
        successCount: 0,
        errorCount: 0,
        results: [],
        dryRun,
      };
    }
    
    console.log(`Trouvé ${integrations.length} intégrations actives`);
    
    // Traiter chaque intégration
    for (const integration of integrations) {
      try {
        // Vérifier que l'utilisateur est Premium
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(integration.user_id);
        
        if (!userData?.user) {
          console.log(`Utilisateur ${integration.user_id} non trouvé, skip`);
          continue;
        }
        
        const isPremium = userData.user.user_metadata?.is_premium === true;
        if (!isPremium) {
          console.log(`Utilisateur ${integration.user_id} n'est pas Premium, skip`);
          continue;
        }
        
        // Exécuter l'import selon le provider
        let result: ImportResult;
        if (integration.provider === 'shopify') {
          result = await importFromShopify(integration, dryRun);
        } else if (integration.provider === 'stripe') {
          result = await importFromStripe(integration, dryRun);
        } else {
          console.log(`Provider inconnu: ${integration.provider}`);
          continue;
        }
        
        results.push(result);
        
        if (result.success) {
          successCount++;
          
          // Envoyer l'email de récap (seulement si pas dry run et si CA > 0)
          if (!dryRun && result.totalCA > 0 && userData.user.email) {
            const now = new Date();
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const monthName = lastMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
            
            await sendMonthlyRecapEmail({
              email: userData.user.email,
              month: monthName,
              totalCA: result.totalCA,
              details: [{
                source: result.provider === 'stripe' ? 'Stripe' : 'Shopify',
                amount: result.totalCA,
              }],
            });
          }
        } else {
          errorCount++;
        }
      } catch (error: any) {
        console.error(`Erreur import pour ${integration.user_id}:`, error);
        results.push({
          userId: integration.user_id,
          provider: integration.provider as 'stripe' | 'shopify',
          success: false,
          recordsImported: 0,
          totalCA: 0,
          error: error.message,
          dryRun,
        });
        errorCount++;
      }
    }
    
    console.log(`✅ Import terminé: ${successCount} succès, ${errorCount} erreurs`);
    
    return {
      totalUsers: integrations.length,
      successCount,
      errorCount,
      results,
      dryRun,
    };
  } catch (error: any) {
    console.error('Erreur job import:', error);
    throw error;
  }
}

/**
 * Importe le CA depuis Shopify pour un utilisateur
 */
async function importFromShopify(integration: any, dryRun: boolean): Promise<ImportResult> {
  const userId = integration.user_id;
  const shopDomain = integration.shop_domain;
  
  console.log(`📦 Import Shopify pour user ${userId}, shop: ${shopDomain}`);
  
  try {
    const accessToken = decrypt(integration.access_token);
    
    // Récupérer les commandes du mois dernier
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const year = lastMonth.getFullYear();
    const month = lastMonth.getMonth() + 1;
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
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
    
    console.log(`Trouvé ${orders.length} commandes Shopify pour ${month}/${year}`);
    
    // Calculer le CA total
    let totalCA = 0;
    const recordsToInsert: any[] = [];
    
    for (const order of orders) {
      if (order.financial_status === 'paid' || order.financial_status === 'partially_paid') {
        const amount = parseFloat(order.total_price);
        totalCA += amount;
        
        recordsToInsert.push({
          user_id: userId,
          year,
          month,
          amount_eur: amount,
          source: 'shopify',
          external_id: `shopify_${order.id}`,
          metadata: {
            order_number: order.order_number,
            currency: order.currency,
          },
        });
      }
    }
    
    console.log(`CA total Shopify: ${totalCA.toFixed(2)}€ (${recordsToInsert.length} commandes)`);
    
    // Si dry run, ne pas insérer
    if (dryRun) {
      console.log('[DRY RUN] Aucune insertion effectuée');
      return {
        userId,
        provider: 'shopify',
        success: true,
        recordsImported: recordsToInsert.length,
        totalCA,
        dryRun: true,
      };
    }
    
    // Vérifier si des records existent déjà pour ce mois
    const { data: existingRecords } = await supabaseAdmin
      .from('urssaf_records')
      .select('id, external_id')
      .eq('user_id', userId)
      .eq('year', year)
      .eq('month', month)
      .eq('source', 'shopify');
    
    // Filtrer pour éviter les doublons
    const existingIds = new Set((existingRecords || []).map(r => r.external_id));
    const newRecords = recordsToInsert.filter(r => !existingIds.has(r.external_id));
    
    console.log(`${newRecords.length} nouveaux records à insérer (${recordsToInsert.length - newRecords.length} doublons évités)`);
    
    // Insérer les nouveaux records
    if (newRecords.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('urssaf_records')
        .insert(newRecords);
      
      if (insertError) {
        throw insertError;
      }
    }
    
    // Logger le succès
    await supabaseAdmin.from('import_logs').insert({
      user_id: userId,
      provider: 'shopify',
      status: 'success',
      records_imported: newRecords.length,
      total_ca: totalCA,
      month,
      year,
    });
    
    return {
      userId,
      provider: 'shopify',
      success: true,
      recordsImported: newRecords.length,
      totalCA,
      dryRun: false,
    };
  } catch (error: any) {
    console.error(`Erreur import Shopify pour ${userId}:`, error);
    
    // Logger l'erreur
    await supabaseAdmin.from('import_logs').insert({
      user_id: userId,
      provider: 'shopify',
      status: 'error',
      records_imported: 0,
      total_ca: 0,
      error_message: error.message,
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
    });
    
    return {
      userId,
      provider: 'shopify',
      success: false,
      recordsImported: 0,
      totalCA: 0,
      error: error.message,
      dryRun,
    };
  }
}

/**
 * Importe le CA depuis Stripe pour un utilisateur
 */
async function importFromStripe(integration: any, dryRun: boolean): Promise<ImportResult> {
  const userId = integration.user_id;
  
  console.log(`💳 Import Stripe pour user ${userId}`);
  
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY non configurée');
    }
    
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-10-29.clover' });
    const stripeAccountId = integration.stripe_account_id;
    
    // Récupérer les paiements du mois dernier
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const year = lastMonth.getFullYear();
    const month = lastMonth.getMonth() + 1;
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
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
      stripeAccountId ? { stripeAccount: stripeAccountId } : undefined
    );
    
    console.log(`Trouvé ${charges.data.length} charges Stripe pour ${month}/${year}`);
    
    // Calculer le CA total
    let totalCA = 0;
    const recordsToInsert: any[] = [];
    
    for (const charge of charges.data) {
      if (charge.status === 'succeeded') {
        const amount = charge.amount / 100; // Stripe en centimes
        totalCA += amount;
        
        recordsToInsert.push({
          user_id: userId,
          year,
          month,
          amount_eur: amount,
          source: 'stripe',
          external_id: `stripe_${charge.id}`,
          metadata: {
            currency: charge.currency,
            description: charge.description,
          },
        });
      }
    }
    
    console.log(`CA total Stripe: ${totalCA.toFixed(2)}€ (${recordsToInsert.length} paiements)`);
    
    // Si dry run, ne pas insérer
    if (dryRun) {
      console.log('[DRY RUN] Aucune insertion effectuée');
      return {
        userId,
        provider: 'stripe',
        success: true,
        recordsImported: recordsToInsert.length,
        totalCA,
        dryRun: true,
      };
    }
    
    // Vérifier si des records existent déjà pour ce mois
    const { data: existingRecords } = await supabaseAdmin
      .from('urssaf_records')
      .select('id, external_id')
      .eq('user_id', userId)
      .eq('year', year)
      .eq('month', month)
      .eq('source', 'stripe');
    
    // Filtrer pour éviter les doublons
    const existingIds = new Set((existingRecords || []).map(r => r.external_id));
    const newRecords = recordsToInsert.filter(r => !existingIds.has(r.external_id));
    
    console.log(`${newRecords.length} nouveaux records à insérer (${recordsToInsert.length - newRecords.length} doublons évités)`);
    
    // Insérer les nouveaux records
    if (newRecords.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('urssaf_records')
        .insert(newRecords);
      
      if (insertError) {
        throw insertError;
      }
    }
    
    // Logger le succès
    await supabaseAdmin.from('import_logs').insert({
      user_id: userId,
      provider: 'stripe',
      status: 'success',
      records_imported: newRecords.length,
      total_ca: totalCA,
      month,
      year,
    });
    
    return {
      userId,
      provider: 'stripe',
      success: true,
      recordsImported: newRecords.length,
      totalCA,
      dryRun: false,
    };
  } catch (error: any) {
    console.error(`Erreur import Stripe pour ${userId}:`, error);
    
    // Logger l'erreur
    await supabaseAdmin.from('import_logs').insert({
      user_id: userId,
      provider: 'stripe',
      status: 'error',
      records_imported: 0,
      total_ca: 0,
      error_message: error.message,
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
    });
    
    return {
      userId,
      provider: 'stripe',
      success: false,
      recordsImported: 0,
      totalCA: 0,
      error: error.message,
      dryRun,
    };
  }
}

