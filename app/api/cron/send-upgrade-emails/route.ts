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

export async function GET(req: NextRequest) {
  try {
    // Vérifier le secret CRON
    const authHeader = req.headers.get('authorization');
    const providedSecret = authHeader?.replace('Bearer ', '') || req.nextUrl.searchParams.get('secret');

    if (!CRON_SECRET || providedSecret !== CRON_SECRET) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://comptalyze.com';
    const fromEmail = process.env.COMPANY_FROM_EMAIL || 'Comptalyze <no-reply@comptalyze.com>';

    // Calculer la date d'il y a 3 jours (à minuit pour précision)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    threeDaysAgo.setHours(0, 0, 0, 0);

    const fourDaysAgo = new Date();
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
    fourDaysAgo.setHours(0, 0, 0, 0);

    // Récupérer tous les utilisateurs créés il y a exactement 3 jours
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
      console.error('Erreur lors de la récupération des utilisateurs:', usersError);
      return NextResponse.json({ error: 'Erreur lors de la récupération des utilisateurs' }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ message: 'Aucun utilisateur trouvé' });
    }

    // Filtrer les utilisateurs créés il y a 3 jours et qui sont toujours gratuits
    const targetUsers = users.filter(user => {
      const createdAt = new Date(user.created_at);
      // Utilisateur créé il y a 3 jours (entre 3 et 4 jours)
      const isThreeDaysOld = createdAt >= fourDaysAgo && createdAt < threeDaysAgo;
      // Utilisateur gratuit (pas de plan payant)
      const isFree = !user.user_metadata?.stripe_customer_id && 
                     !user.user_metadata?.is_pro && 
                     !user.user_metadata?.is_premium &&
                     !user.user_metadata?.premium_trial_started_at;
      
      return isThreeDaysOld && isFree && user.email;
    });

    if (targetUsers.length === 0) {
      return NextResponse.json({ message: 'Aucun utilisateur éligible pour l\'email de 3 jours' });
    }

    let sentCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Vérifier si la table marketing_emails existe, sinon créer en mémoire
    const sentEmails = new Set<string>();

    // Essayer de récupérer les emails déjà envoyés (si table existe)
    try {
      const { data: existingEmails } = await supabaseAdmin
        .from('marketing_emails')
        .select('user_id')
        .eq('email_type', 'upgrade_day3');

      if (existingEmails) {
        existingEmails.forEach(e => sentEmails.add(e.user_id));
      }
    } catch (e) {
      // Table n'existe pas encore, pas grave
      console.log('Table marketing_emails pas encore créée, sera créée plus tard');
    }

    for (const user of targetUsers) {
      try {
        // Vérifier si email déjà envoyé
        if (sentEmails.has(user.id)) {
          continue;
        }

        const firstName = user.user_metadata?.first_name || user.email?.split('@')[0] || 'utilisateur';

        // Envoyer l'email marketing
        await resend.emails.send({
          from: fromEmail,
          to: user.email!,
          subject: '🎁 Votre code exclusif -5% vous attend !',
          html: generateUpgradeEmailHTML(firstName, baseUrl),
        });

        // Marquer comme envoyé (si table existe)
        try {
          await supabaseAdmin
            .from('marketing_emails')
            .insert({
              user_id: user.id,
              email_type: 'upgrade_day3',
              sent_at: new Date().toISOString(),
              email_content: 'upgrade_day3_promo'
            });
        } catch (e) {
          // Ignorer si table n'existe pas
        }

        sentCount++;
      } catch (error: any) {
        console.error(`Erreur pour l'utilisateur ${user.id}:`, error);
        errorCount++;
        errors.push(`${user.email}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      sentCount,
      errorCount,
      targetUsersCount: targetUsers.length,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error: any) {
    console.error('Erreur dans le cron send-upgrade-emails:', error);
    return NextResponse.json({ error: error.message || 'Erreur interne' }, { status: 500 });
  }
}

function generateUpgradeEmailHTML(firstName: string, baseUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offre exclusive Comptalyze</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header avec gradient -->
    <div style="background: linear-gradient(135deg, #00D084 0%, #2E6CF6 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Comptalyze</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Votre assistant comptable intelligent</p>
    </div>

    <!-- Contenu principal -->
    <div style="padding: 40px 30px;">
      <!-- Salutation -->
      <h2 style="color: #0e0f12; font-size: 24px; margin: 0 0 20px 0; font-weight: 600;">
        Bonjour ${firstName} 👋
      </h2>

      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
        Vous avez créé votre compte Comptalyze il y a 3 jours. Comment se passent vos premiers pas avec notre outil ?
      </p>

      <!-- Badge exclusif -->
      <div style="background: linear-gradient(135deg, rgba(0,208,132,0.1) 0%, rgba(46,108,246,0.1) 100%); border: 2px solid #00D084; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
        <div style="display: inline-block; background-color: #00D084; color: #0e0f12; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 15px;">
          🎁 Offre Exclusive
        </div>
        <h3 style="color: #0e0f12; font-size: 22px; margin: 0 0 10px 0; font-weight: 700;">
          -5% supplémentaire avec le code
        </h3>
        <div style="background-color: #0e0f12; color: #00D084; padding: 15px 25px; border-radius: 8px; display: inline-block; margin: 15px 0; font-size: 24px; font-weight: 700; letter-spacing: 2px;">
          LAUNCH5
        </div>
        <p style="color: #666; font-size: 14px; margin: 10px 0 0 0;">
          Valable jusqu'au 31 janvier 2025
        </p>
      </div>

      <!-- Bénéfices du plan Pro -->
      <div style="margin: 35px 0;">
        <h3 style="color: #0e0f12; font-size: 20px; margin: 0 0 20px 0; font-weight: 600;">
          🚀 Avec le plan Pro, gagnez un temps précieux :
        </h3>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
              <div style="display: flex; align-items: flex-start;">
                <span style="color: #00D084; font-size: 20px; margin-right: 12px;">✓</span>
                <div>
                  <strong style="color: #0e0f12; font-size: 15px;">Simulations illimitées</strong>
                  <p style="color: #666; font-size: 13px; margin: 4px 0 0 0;">Testez autant de scénarios que vous voulez</p>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
              <div style="display: flex; align-items: flex-start;">
                <span style="color: #00D084; font-size: 20px; margin-right: 12px;">✓</span>
                <div>
                  <strong style="color: #0e0f12; font-size: 15px;">Factures PDF professionnelles</strong>
                  <p style="color: #666; font-size: 13px; margin: 4px 0 0 0;">Conformes aux normes légales</p>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
              <div style="display: flex; align-items: flex-start;">
                <span style="color: #00D084; font-size: 20px; margin-right: 12px;">✓</span>
                <div>
                  <strong style="color: #0e0f12; font-size: 15px;">Gestion TVA automatique</strong>
                  <p style="color: #666; font-size: 13px; margin: 4px 0 0 0;">Calculs précis et déclarations simplifiées</p>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0;">
              <div style="display: flex; align-items: flex-start;">
                <span style="color: #00D084; font-size: 20px; margin-right: 12px;">✓</span>
                <div>
                  <strong style="color: #0e0f12; font-size: 15px;">Exports comptables</strong>
                  <p style="color: #666; font-size: 13px; margin: 4px 0 0 0;">CSV/Excel pour votre expert-comptable</p>
                </div>
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Prix avec promo -->
      <div style="background-color: #f8f9fa; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
        <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">Plan Pro - Offre de lancement</p>
        <div style="margin: 15px 0;">
          <span style="color: #999; font-size: 24px; text-decoration: line-through; margin-right: 10px;">3,90 €</span>
          <span style="color: #00D084; font-size: 36px; font-weight: 700;">3,71 €</span>
          <span style="color: #666; font-size: 18px;">/mois</span>
        </div>
        <p style="color: #00D084; font-size: 14px; font-weight: 600; margin: 5px 0 0 0;">
          Avec le code LAUNCH5 : -5% soit 2,28€ d'économie supplémentaire !
        </p>
      </div>

      <!-- Bénéfices du plan Premium -->
      <div style="background: linear-gradient(135deg, rgba(0,208,132,0.05) 0%, rgba(46,108,246,0.05) 100%); border: 1px solid rgba(46,108,246,0.2); border-radius: 12px; padding: 25px; margin: 30px 0;">
        <h3 style="color: #0e0f12; font-size: 20px; margin: 0 0 20px 0; font-weight: 600;">
          ⚡ Passez au Premium pour encore plus :
        </h3>
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li style="padding: 10px 0; color: #333; font-size: 15px;">
            <span style="color: #2E6CF6; margin-right: 10px;">🤖</span>
            <strong>Assistant IA ComptaBot</strong> - Conseils personnalisés 24/7
          </li>
          <li style="padding: 10px 0; color: #333; font-size: 15px;">
            <span style="color: #2E6CF6; margin-right: 10px;">📅</span>
            <strong>Calendrier fiscal intelligent</strong> - Ne ratez plus aucune échéance
          </li>
          <li style="padding: 10px 0; color: #333; font-size: 15px;">
            <span style="color: #2E6CF6; margin-right: 10px;">🔔</span>
            <strong>Rappels automatiques URSSAF</strong> - Déclarations pré-remplies
          </li>
          <li style="padding: 10px 0; color: #333; font-size: 15px;">
            <span style="color: #2E6CF6; margin-right: 10px;">📊</span>
            <strong>Analytics avancés</strong> - Alertes seuils en temps réel
          </li>
        </ul>
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">Plan Premium - Offre de lancement</p>
          <div>
            <span style="color: #999; font-size: 20px; text-decoration: line-through; margin-right: 8px;">7,90 €</span>
            <span style="color: #2E6CF6; font-size: 32px; font-weight: 700;">7,51 €</span>
            <span style="color: #666; font-size: 16px;">/mois</span>
          </div>
          <p style="color: #2E6CF6; font-size: 13px; font-weight: 600; margin: 5px 0 0 0;">
            Avec LAUNCH5 : -5% supplémentaire
          </p>
        </div>
      </div>

      <!-- Témoignage rapide -->
      <div style="background-color: #f8f9fa; border-left: 4px solid #00D084; border-radius: 8px; padding: 20px; margin: 30px 0;">
        <p style="color: #333; font-size: 15px; line-height: 1.6; margin: 0 0 15px 0; font-style: italic;">
          "Avant Comptalyze, je passais 3h par mois sur ma compta. Maintenant, tout est automatisé et ça me prend 10 minutes chrono. J'ai enfin l'esprit tranquille !"
        </p>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #00D084 0%, #2E6CF6 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px;">
            S
          </div>
          <div>
            <div style="color: #0e0f12; font-weight: 600; font-size: 14px;">Sophie M.</div>
            <div style="color: #666; font-size: 13px;">Graphiste freelance • Lyon</div>
          </div>
        </div>
      </div>

      <!-- CTA Principal -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="${baseUrl}/pricing" style="display: inline-block; background: linear-gradient(135deg, #00D084 0%, #2E6CF6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-size: 18px; font-weight: 600; box-shadow: 0 4px 15px rgba(46,108,246,0.3);">
          Découvrir les plans
        </a>
        <p style="color: #999; font-size: 13px; margin: 15px 0 0 0;">
          Sans engagement • Annulable à tout moment
        </p>
      </div>

      <!-- Rappel du code -->
      <div style="background-color: #fffbeb; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; text-align: center; margin: 30px 0;">
        <p style="color: #92400e; font-size: 14px; margin: 0;">
          💡 <strong>N'oubliez pas !</strong> Utilisez le code <strong style="background-color: #fef3c7; padding: 4px 8px; border-radius: 4px;">LAUNCH5</strong> lors du paiement pour -5% supplémentaire
        </p>
      </div>

      <!-- Section pourquoi upgrader -->
      <div style="margin: 35px 0;">
        <h3 style="color: #0e0f12; font-size: 18px; margin: 0 0 20px 0; font-weight: 600;">
          Pourquoi passer à un plan payant dès maintenant ?
        </h3>
        
        <div style="margin: 15px 0;">
          <div style="display: flex; gap: 12px; margin-bottom: 15px;">
            <span style="color: #00D084; font-size: 24px;">⏱️</span>
            <div>
              <strong style="color: #0e0f12; font-size: 15px;">Gagnez 2h30 par mois</strong>
              <p style="color: #666; font-size: 14px; margin: 5px 0 0 0;">Plus de calculs manuels, tout est automatisé</p>
            </div>
          </div>
          
          <div style="display: flex; gap: 12px; margin-bottom: 15px;">
            <span style="color: #2E6CF6; font-size: 24px;">💰</span>
            <div>
              <strong style="color: #0e0f12; font-size: 15px;">Économisez jusqu'à 380€/trimestre</strong>
              <p style="color: #666; font-size: 14px; margin: 5px 0 0 0;">Optimisez vos charges déductibles avec l'IA</p>
            </div>
          </div>
          
          <div style="display: flex; gap: 12px;">
            <span style="color: #8B5CF6; font-size: 24px;">✅</span>
            <div>
              <strong style="color: #0e0f12; font-size: 15px;">0 erreur, 0 stress</strong>
              <p style="color: #666; font-size: 14px; margin: 5px 0 0 0;">Déclarations pré-remplies et vérifiées</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats rapides -->
      <div style="background-color: #f8f9fa; border-radius: 10px; padding: 25px; margin: 30px 0;">
        <div style="text-align: center;">
          <p style="color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px 0; font-weight: 600;">
            Ils nous font déjà confiance
          </p>
          <div style="display: flex; justify-content: center; gap: 30px; flex-wrap: wrap;">
            <div>
              <div style="color: #00D084; font-size: 28px; font-weight: 700;">847+</div>
              <div style="color: #666; font-size: 13px;">utilisateurs</div>
            </div>
            <div>
              <div style="color: #2E6CF6; font-size: 28px; font-weight: 700;">4.9/5</div>
              <div style="color: #666; font-size: 13px;">note moyenne</div>
            </div>
            <div>
              <div style="color: #8B5CF6; font-size: 28px; font-weight: 700;">2547h</div>
              <div style="color: #666; font-size: 13px;">économisées</div>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA Secondaire -->
      <div style="text-align: center; margin: 35px 0 20px 0;">
        <p style="color: #666; font-size: 15px; margin: 0 0 20px 0;">
          Des questions ? Notre équipe est là pour vous aider
        </p>
        <a href="mailto:support@comptalyze.com" style="color: #2E6CF6; text-decoration: none; font-size: 15px; font-weight: 600;">
          support@comptalyze.com
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
      <p style="color: #999; font-size: 13px; margin: 0 0 10px 0;">
        Cet email vous a été envoyé car vous avez créé un compte sur Comptalyze
      </p>
      <p style="color: #999; font-size: 12px; margin: 0;">
        <a href="${baseUrl}/legal/politique-de-confidentialite" style="color: #999; text-decoration: underline;">Politique de confidentialité</a> • 
        <a href="${baseUrl}/dashboard/compte" style="color: #999; text-decoration: underline;">Gérer mes préférences</a>
      </p>
      <p style="color: #ccc; font-size: 11px; margin: 15px 0 0 0;">
        © 2025 Comptalyze. Tous droits réservés.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

