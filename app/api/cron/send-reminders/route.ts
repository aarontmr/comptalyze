import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const resend = new Resend(process.env.RESEND_API_KEY);

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: NextRequest) {
  try {
    // Vérifier le secret CRON
    const authHeader = req.headers.get('authorization');
    const providedSecret = authHeader?.replace('Bearer ', '') || req.nextUrl.searchParams.get('secret');

    if (!CRON_SECRET || providedSecret !== CRON_SECRET) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que nous sommes le 2 du mois (Europe/Paris)
    const parisTime = toZonedTime(new Date(), 'Europe/Paris');
    const dayOfMonth = parisTime.getDate();

    if (dayOfMonth !== 2) {
      return NextResponse.json({
        message: `Pas le 2 du mois (jour actuel: ${dayOfMonth}). Pas de rappels à envoyer.`,
      });
    }

    // Récupérer tous les utilisateurs Premium avec monthly_reminder activé
    const { data: preferences, error: prefError } = await supabaseAdmin
      .from('email_preferences')
      .select('user_id')
      .eq('monthly_reminder', true);

    if (prefError) {
      console.error('Erreur lors de la récupération des préférences:', prefError);
      return NextResponse.json({ error: 'Erreur lors de la récupération des préférences' }, { status: 500 });
    }

    if (!preferences || preferences.length === 0) {
      return NextResponse.json({ message: 'Aucun utilisateur avec rappels activés' });
    }

    // Pour chaque utilisateur, vérifier qu'il est Premium et récupérer son email
    const { getUserPlanServer } = await import('@/lib/plan');
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://comptalyze.com';
    const fromEmail = process.env.COMPANY_FROM_EMAIL || 'Comptalyze <no-reply@comptalyze.com>';

    let sentCount = 0;
    let errorCount = 0;

    for (const pref of preferences) {
      try {
        // Récupérer les données utilisateur
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(pref.user_id);

        if (userError || !userData?.user) {
          console.error(`Erreur pour l'utilisateur ${pref.user_id}:`, userError);
          errorCount++;
          continue;
        }

        const user = userData.user;

        // Vérifier le plan
        const plan = await getUserPlanServer(pref.user_id, user.user_metadata);

        if (plan !== 'premium') {
          // L'utilisateur n'est plus Premium, on peut désactiver le rappel
          await supabaseAdmin
            .from('email_preferences')
            .update({ monthly_reminder: false })
            .eq('user_id', pref.user_id);
          continue;
        }

        if (!user.email) {
          console.warn(`Pas d'email pour l'utilisateur ${pref.user_id}`);
          continue;
        }

        // Envoyer l'email de rappel
        await resend.emails.send({
          from: fromEmail,
          to: user.email,
          subject: 'Rappel Comptalyze – Enregistrez votre CA',
          html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; background-color: #0e0f12; padding: 30px; border-radius: 10px;">
              <div style="background: linear-gradient(135deg, #00D084 0%, #2E6CF6 100%); padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <h2 style="color: white; margin: 0; font-size: 24px;">Rappel Comptalyze</h2>
              </div>
              
              <div style="color: #e0e0e0;">
                <p style="font-size: 16px; line-height: 1.6;">Bonjour,</p>
                
                <p style="font-size: 16px; line-height: 1.6;">
                  N'oubliez pas d'enregistrer votre chiffre d'affaires du mois dernier dans Comptalyze.
                </p>
                
                <p style="font-size: 16px; line-height: 1.6;">
                  Enregistrer régulièrement vos revenus vous permet de :
                </p>
                
                <ul style="font-size: 16px; line-height: 1.8; padding-left: 20px;">
                  <li>Suivre l'évolution de vos cotisations URSSAF</li>
                  <li>Recevoir des conseils personnalisés basés sur votre activité</li>
                  <li>Générer des rapports PDF pour votre comptabilité</li>
                </ul>
                
                <div style="margin: 30px 0; text-align: center;">
                  <a href="${baseUrl}/dashboard" 
                     style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #00D084 0%, #2E6CF6 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    Accéder à mon tableau de bord
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
      } catch (error: any) {
        console.error(`Erreur lors de l'envoi pour l'utilisateur ${pref.user_id}:`, error);
        errorCount++;
      }
    }

    return NextResponse.json({
      message: `Rappels envoyés : ${sentCount} succès, ${errorCount} erreurs`,
      sent: sentCount,
      errors: errorCount,
    });
  } catch (error: any) {
    console.error('Erreur lors de l\'envoi des rappels:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de l\'envoi des rappels' }, { status: 500 });
  }
}


