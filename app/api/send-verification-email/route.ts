import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.COMPANY_FROM_EMAIL || 'Comptalyze <onboarding@resend.dev>';
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://comptalyze.com';

export async function POST(req: NextRequest) {
  try {
    const { email, tokenHash, type } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY non configuré');
      return NextResponse.json({ error: 'Service d\'email non configuré' }, { status: 500 });
    }

    // Générer un token de vérification via Supabase
    let verificationUrl = '';
    if (tokenHash) {
      // Si on a un token hash, construire l'URL avec celui-ci
      verificationUrl = `${baseUrl}/auth/confirm?token_hash=${tokenHash}&type=${type || 'signup'}`;
    } else {
      // Sinon, demander à Supabase de générer un nouveau lien
      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'signup',
        email: email,
      });
      
      if (error || !data?.properties?.action_link) {
        return NextResponse.json({ error: 'Impossible de générer le lien de vérification' }, { status: 500 });
      }
      
      verificationUrl = data.properties.action_link;
    }

    // Envoyer l'email de vérification personnalisé
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Vérifiez votre adresse email – Comptalyze',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #0e0f12; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #00D084 0%, #2E6CF6 100%); padding: 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Bienvenue sur Comptalyze</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px; color: #e5e7eb;">
                      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #e5e7eb;">
                        Bonjour,
                      </p>
                      
                      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #e5e7eb;">
                        Merci de vous être inscrit sur <strong>Comptalyze</strong>, votre simulateur URSSAF pour micro-entrepreneurs.
                      </p>
                      
                      <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #e5e7eb;">
                        Pour finaliser votre inscription et accéder à toutes les fonctionnalités, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :
                      </p>
                      
                      <!-- CTA Button -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                        <tr>
                          <td align="center" style="padding: 0;">
                            <a href="${verificationUrl}" 
                               style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #00D084 0%, #2E6CF6 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(46, 108, 246, 0.3);">
                              Vérifier mon email
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 30px 0 0 0; font-size: 14px; line-height: 1.6; color: #9ca3af;">
                        Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :
                      </p>
                      <p style="margin: 10px 0 0 0; font-size: 12px; line-height: 1.6; color: #6b7280; word-break: break-all;">
                        ${verificationUrl}
                      </p>
                      
                      <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #1f232b;">
                        <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 1.6; color: #9ca3af;">
                          <strong>Vous ne vous êtes pas inscrit ?</strong>
                        </p>
                        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #9ca3af;">
                          Vous pouvez ignorer cet email en toute sécurité.
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px; background-color: #14161b; border-top: 1px solid #1f232b; text-align: center;">
                      <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
                        Cordialement,<br>
                        <strong style="color: #e5e7eb;">L'équipe Comptalyze</strong>
                      </p>
                      <p style="margin: 20px 0 0 0; font-size: 12px; color: #4b5563;">
                        Basé sur les données officielles de l'URSSAF
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ success: true, message: 'Email de vérification envoyé' });
  } catch (error: any) {
    console.error('Erreur lors de l\'envoi de l\'email de vérification:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de l\'envoi de l\'email' }, { status: 500 });
  }
}

