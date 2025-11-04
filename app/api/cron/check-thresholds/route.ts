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
  services: 77700, // Services et activités libérales
  ventes: 188700,  // Ventes et prestations d'hébergement
};

/**
 * Route pour vérifier les dépassements de seuils et envoyer des alertes
 * Peut être appelée via cron ou après chaque enregistrement de CA
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const providedSecret = req.nextUrl.searchParams.get('secret');

    // Si c'est un appel cron avec secret, vérifier tous les utilisateurs
    const isCronCall = CRON_SECRET && providedSecret === CRON_SECRET;

    // Récupérer les utilisateurs à vérifier
    let usersToCheck: Array<{ id: string; email: string | undefined }> = [];

    if (isCronCall) {
      // Mode cron : vérifier tous les utilisateurs
      const { data, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

      if (usersError || !data || !data.users) {
        return NextResponse.json({ error: 'Erreur lors de la récupération des utilisateurs' }, { status: 500 });
      }
      usersToCheck = data.users.map((u) => ({ id: u.id, email: u.email }));
    } else if (token) {
      // Mode utilisateur : vérifier seulement cet utilisateur
      const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
      if (userError || !user) {
        return NextResponse.json({ error: 'Token invalide ou utilisateur non trouvé' }, { status: 401 });
      }
      usersToCheck = [{ id: user.id, email: user.email }];
    } else {
      return NextResponse.json({ error: 'Non autorisé - Token ou secret CRON requis' }, { status: 401 });
    }

    const currentYear = new Date().getFullYear();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://comptalyze.com';
    const fromEmail = process.env.COMPANY_FROM_EMAIL || 'Comptalyze <no-reply@comptalyze.com>';

    let sentCount = 0;
    let errorCount = 0;

    // Pour chaque utilisateur, vérifier son CA cumulé de l'année
    for (const user of usersToCheck) {
      try {
        if (!user.email) {
          continue;
        }

        // Récupérer tous les enregistrements CA de l'année en cours
        const { data: caRecords, error: caError } = await supabaseAdmin
          .from('ca_records')
          .select('amount_eur, activity_type')
          .eq('user_id', user.id)
          .eq('year', currentYear);

        if (caError) {
          console.error(`Erreur pour l'utilisateur ${user.id}:`, caError);
          errorCount++;
          continue;
        }

        if (!caRecords || caRecords.length === 0) {
          continue;
        }

        // Calculer le CA total par type d'activité
        const caByActivity: Record<string, number> = {};
        caRecords.forEach((record) => {
          const activityType = record.activity_type;
          const amount = Number(record.amount_eur);
          caByActivity[activityType] = (caByActivity[activityType] || 0) + amount;
        });

        // Vérifier les seuils
        const alerts: Array<{ activity: string; ca: number; threshold: number }> = [];

        // Activités de services (12,3% ou 21,1% ou 21,2%)
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

        // Activités de ventes
        if (caByActivity['Vente de marchandises'] && caByActivity['Vente de marchandises'] > THRESHOLDS.ventes) {
          alerts.push({
            activity: 'Ventes',
            ca: caByActivity['Vente de marchandises'],
            threshold: THRESHOLDS.ventes,
          });
        }

        // Si des alertes sont détectées, envoyer un email
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
                  
                  <p style="font-size: 14px; color: #999; margin-top: 30px;">
                    <strong>Important :</strong> Cette information est indicative. Consultez un professionnel pour une analyse personnalisée de votre situation.
                  </p>
                  
                  <div style="margin: 30px 0; text-align: center;">
                    <a href="${baseUrl}/dashboard/statistiques" 
                       style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #00D084 0%, #2E6CF6 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      Voir mes statistiques
                    </a>
                  </div>
                  
                  <p style="font-size: 14px; color: #999; margin-top: 30px;">
                    Cordialement,<br>
                    L'équipe Comptalyze
                  </p>
                </div>
              </div>
            `,
          });

          sentCount++;
        }
      } catch (error: any) {
        console.error(`Erreur lors de la vérification pour l'utilisateur ${user.id}:`, error);
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

/**
 * Route GET pour déclencher manuellement la vérification (utile pour les tests)
 */
export async function GET(req: NextRequest) {
  return POST(req);
}

