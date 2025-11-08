// Système d'envoi d'emails pour Comptalyze
// Utilise Resend (https://resend.com) - Simple et efficace

interface MonthlyRecapEmailData {
  email: string;
  month: string;
  totalCA: number;
  details: Array<{ source: string; amount: number }>;
}

export async function sendMonthlyRecapEmail(data: MonthlyRecapEmailData) {
  const { email, month, totalCA, details } = data;

  // Si Resend est configuré, l'utiliser
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'Comptalyze <noreply@comptalyze.fr>',
          to: email,
          subject: `✅ Votre CA de ${month} a été importé`,
          html: generateEmailHTML(month, totalCA, details),
        }),
      });

      if (!response.ok) {
        throw new Error(`Resend API error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`📧 Email envoyé à ${email}:`, result.id);
      return true;
    } catch (error) {
      console.error('Erreur envoi email Resend:', error);
      return false;
    }
  } else {
    // Mode fallback : logger dans la console (développement)
    console.log(`📧 [EMAIL SIMULÉ] À: ${email}`);
    console.log(`   Sujet: ✅ Votre CA de ${month} a été importé`);
    console.log(`   CA Total: ${totalCA.toFixed(2)}€`);
    console.log(`   Détails:`, details);
    return true;
  }
}

function generateEmailHTML(month: string, totalCA: number, details: Array<{ source: string; amount: number }>) {
  const detailsHTML = details.map(d => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; align-items: center;">
          ${d.source === 'Shopify' 
            ? '<span style="color: #95D05A; font-weight: bold;">🛒 Shopify</span>' 
            : '<span style="color: #635BFF; font-weight: bold;">💳 Stripe</span>'}
        </div>
      </td>
      <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600;">
        ${d.amount.toFixed(2)} €
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CA importé - ${month}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header avec gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #00D084 0%, #2E6CF6 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                ✅ CA Importé !
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                ${month}
              </p>
            </td>
          </tr>

          <!-- Contenu -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                Bonjour ! 👋
              </p>
              <p style="margin: 0 0 30px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                Votre chiffre d'affaires du mois de <strong>${month}</strong> a été importé automatiquement dans Comptalyze.
              </p>

              <!-- CA Total -->
              <div style="background: linear-gradient(135deg, rgba(0, 208, 132, 0.1), rgba(46, 108, 246, 0.1)); border-radius: 12px; padding: 24px; margin-bottom: 30px; text-align: center;">
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                  CA Total
                </p>
                <p style="margin: 0; font-size: 42px; font-weight: bold; background: linear-gradient(135deg, #00D084, #2E6CF6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                  ${totalCA.toFixed(2)} €
                </p>
              </div>

              <!-- Détails -->
              ${details.length > 1 ? `
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #111827; font-weight: 600;">
                  Détails par source
                </h2>
                <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                  ${detailsHTML}
                </table>
              </div>
              ` : ''}

              <!-- CTA -->
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://comptalyze.fr'}/dashboard" 
                   style="display: inline-block; background: linear-gradient(135deg, #00D084 0%, #2E6CF6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(46, 108, 246, 0.3);">
                  Voir mon dashboard
                </a>
              </div>

              <!-- Info -->
              <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                  💡 <strong>Astuce :</strong> Ces données sont déjà pré-remplies dans votre simulateur URSSAF. Vous gagnerez du temps sur votre déclaration !
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">
                <strong>Comptalyze</strong> - La compta simplifiée pour auto-entrepreneurs
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                Vous recevez cet email car vous avez connecté Shopify ou Stripe à votre compte.<br>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://comptalyze.fr'}/dashboard/compte" style="color: #2E6CF6; text-decoration: none;">Gérer mes préférences</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

