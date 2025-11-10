import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { generateRecordsPDF } from '@/lib/pdf-generator';

export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Initialiser Resend seulement si la clé est présente
let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

export async function POST(req: NextRequest) {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Token d\'authentification manquant' }, { status: 401 });
    }

    // Vérifier le token avec Supabase
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 401 });
    }

    const userId = user.id;
    const userEmail = user.email;
    const userMetadata = user.user_metadata;

    // Vérifier le plan (Pro ou Premium)
    const { getUserPlanServer } = await import('@/lib/plan');
    const plan = await getUserPlanServer(userId, userMetadata);

    if (plan !== 'pro' && plan !== 'premium') {
      return NextResponse.json({ error: 'Fonctionnalité réservée aux plans Pro et Premium' }, { status: 403 });
    }

    // Récupérer les paramètres
    const body = await req.json().catch(() => ({}));
    const { year } = body;
    const filterYear = year || new Date().getFullYear();

    // Récupérer les enregistrements
    const { data: records, error } = await supabaseAdmin
      .from('ca_records')
      .select('*')
      .eq('user_id', userId)
      .eq('year', filterYear)
      .order('month', { ascending: true });

    if (error) {
      console.error('Erreur lors de la récupération des enregistrements:', error);
      return NextResponse.json({ error: 'Erreur lors de la récupération des données' }, { status: 500 });
    }

    if (!records || records.length === 0) {
      return NextResponse.json({ error: 'Aucun enregistrement trouvé pour cette année' }, { status: 404 });
    }

    // Vérifier que Resend est configuré
    if (!resend || !process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY non configuré');
      return NextResponse.json({ error: 'Service d\'envoi d\'email non configuré. Contactez le support.' }, { status: 500 });
    }

    // Générer le PDF
    const pdfBuffer = await generateRecordsPDF(records, filterYear);

    // Envoyer l'email avec le PDF
    const fromEmail = process.env.COMPANY_FROM_EMAIL || 'Comptalyze <no-reply@comptalyze.com>';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://comptalyze.com';

    if (!userEmail) {
      return NextResponse.json({ error: 'Email utilisateur non trouvé' }, { status: 400 });
    }

    try {
      const emailResult = await resend.emails.send({
        from: fromEmail,
        to: userEmail,
        subject: '[Comptalyze] Votre export PDF',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #00D084;">Export PDF Comptalyze</h2>
            <p>Bonjour,</p>
            <p>Vous trouverez ci-joint votre relevé Comptalyze pour l'année ${filterYear}.</p>
            <p>Ce document contient tous vos enregistrements de chiffre d'affaires avec les cotisations URSSAF calculées.</p>
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              Cordialement,<br>
              L'équipe Comptalyze
            </p>
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
              <a href="${baseUrl}/dashboard" style="color: #2E6CF6;">Accéder à mon tableau de bord</a>
            </p>
          </div>
        `,
        attachments: [
          {
            filename: `comptalyze-export-${filterYear}.pdf`,
            content: Buffer.from(pdfBuffer).toString('base64'),
          },
        ],
      });

      if (emailResult.error) {
        console.error('Erreur Resend:', emailResult.error);
        return NextResponse.json({ 
          error: `Erreur lors de l'envoi de l'email: ${emailResult.error.message || 'Erreur inconnue'}` 
        }, { status: 500 });
      }

      return NextResponse.json({ ok: true });
    } catch (emailError: any) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailError);
      return NextResponse.json({ 
        error: `Erreur lors de l'envoi de l'email: ${emailError.message || 'Erreur inconnue'}` 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Erreur lors de l\'export PDF:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de l\'export PDF' }, { status: 500 });
  }
}
