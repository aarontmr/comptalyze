import { NextRequest, NextResponse } from 'next/server';
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

// Seuils de micro-entreprise (en euros)
const THRESHOLDS = {
  services: 77700,
  ventes: 188700,
};

/**
 * Route pour déclencher manuellement la vérification des seuils URSSAF
 * Usage: POST /api/manual/check-thresholds?secret=<CRON_SECRET>
 */
export async function POST(req: NextRequest) {
  try {
    const providedSecret = req.nextUrl.searchParams.get('secret');

    if (!CRON_SECRET || providedSecret !== CRON_SECRET) {
      return NextResponse.json({ error: 'Non autorisé - Secret requis' }, { status: 401 });
    }

    const currentYear = new Date().getFullYear();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://comptalyze.com';
    const fromEmail = process.env.COMPANY_FROM_EMAIL || 'Comptalyze <no-reply@comptalyze.com>';

    // Récupérer tous les utilisateurs
    const { data, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError || !data || !data.users) {
      return NextResponse.json({ error: 'Erreur lors de la récupération des utilisateurs' }, { status: 500 });
    }

    let sentCount = 0;
    let errorCount = 0;

    for (const user of data.users) {
      try {
        if (!user.email) continue;

        const { data: caRecords, error: caError } = await supabaseAdmin
          .from('ca_records')
          .select('amount_eur, activity_type')
          .eq('user_id', user.id)
          .eq('year', currentYear);

        if (caError || !caRecords || caRecords.length === 0) continue;

        const caByActivity: Record<string, number> = {};
        caRecords.forEach((record) => {
          const activityType = record.activity_type;
          const amount = Number(record.amount_eur);
          caByActivity[activityType] = (caByActivity[activityType] || 0) + amount;
        });

        const alerts: Array<{ activity: string; ca: number; threshold: number }> = [];
        const servicesActivities = ['Vente de marchandises', 'Prestation de services', 'Activité libérale'];
        let servicesCA = 0;
        servicesActivities.forEach((activity) => {
          if (caByActivity[activity]) {
            servicesCA += caByActivity[activity];
          }
        });

        if (servicesCA > THRESHOLDS.services) {
          alerts.push({
            activity: 'Services/Activités libérales',
            ca: servicesCA,
            threshold: THRESHOLDS.services,
          });
        }

        if (caByActivity['Vente de marchandises'] && caByActivity['Vente de marchandises'] > THRESHOLDS.ventes) {
          alerts.push({
            activity: 'Ventes',
            ca: caByActivity['Vente de marchandises'],
            threshold: THRESHOLDS.ventes,
          });
        }

        if (alerts.length > 0) {
          const alertsHtml = alerts
            .map(
              (alert) => `
            <div style="background-color: #1a1d24; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #ff6b6b;">
              <strong>${alert.activity}</strong><br>
              CA actuel : <strong style="color: #ff6b6b;">${alert.ca.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</strong><br>
              Seuil autorisé : ${alert.threshold.toLocaleString('fr-FR')} €
            </div>
          `
            )
            .join('');

          await resend.emails.send({
            from: fromEmail,
            to: user.email,
            subject: '⚠️ Alerte Comptalyze – Dépassement des seuils de micro-entreprise',
            html: `
              <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; background-color: #0e0f12; padding: 30px; border-radius: 10px;">
                <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                  <h2 style="color: white; margin: 0; font-size: 24px;">⚠️ Alerte Comptalyze</h2>
                </div>
                <div style="color: #e0e0e0;">
                  <p style="font-size: 16px; line-height: 1.6;">Bonjour,</p>
                  <p style="font-size: 16px; line-height: 1.6;">
                    Nous avons détecté que votre chiffre d'affaires cumulé pour l'année ${currentYear} dépasse les seuils autorisés pour le statut de micro-entreprise.
                  </p>
                  <div style="margin: 30px 0;">
                    ${alertsHtml}
                  </div>
                  <p style="font-size: 16px; line-height: 1.6;">
                    <strong>Que faire maintenant ?</strong>
                  </p>
                  <ul style="font-size: 16px; line-height: 1.8; padding-left: 20px;">
                    <li>Vous devez basculer vers le <strong>régime réel simplifié</strong> ou le <strong>régime réel normal</strong></li>
                    <li>Contactez votre expert-comptable ou l'URSSAF pour effectuer ce changement</li>
                    <li>Ce changement doit être effectué avant la fin de l'année</li>
                    <li>Conservez bien tous vos justificatifs et documents comptables</li>
                  </ul>
                  <div style="margin: 30px 0; text-align: center;">
                    <a href="${baseUrl}/dashboard/statistiques" 
                       style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #00D084 0%, #2E6CF6 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      Voir mes statistiques
                    </a>
                  </div>
                </div>
              </div>
            `,
          });

          sentCount++;
        }
      } catch (error: any) {
        console.error(`Erreur pour l'utilisateur ${user.id}:`, error);
        errorCount++;
      }
    }

    return NextResponse.json({
      message: `Vérification terminée : ${sentCount} alertes envoyées, ${errorCount} erreurs`,
      sent: sentCount,
      errors: errorCount,
    });
  } catch (error: any) {
    console.error('Erreur lors de la vérification des seuils:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de la vérification des seuils' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: 'Utilisez POST avec ?secret=<CRON_SECRET>',
    endpoint: '/api/manual/check-thresholds',
    method: 'POST',
  });
}

