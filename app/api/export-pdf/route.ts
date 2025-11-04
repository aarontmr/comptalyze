import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import PDFDocument from 'pdfkit';
import { Resend } from 'resend';

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
    const pdfBuffer = await generatePDF(records, filterYear);

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

async function generatePDF(records: any[], year: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
    });

    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
    doc.on('error', reject);

    // En-tête avec gradient (simulé avec un rectangle)
    doc
      .rect(0, 0, doc.page.width, 100)
      .fill('#0e0f12');

    // Logo ou titre
    doc
      .fillColor('#00D084')
      .fontSize(24)
      .text('Comptalyze', 50, 30);

    doc
      .fillColor('#ffffff')
      .fontSize(16)
      .text(`Relevé ${year}`, 50, 60);

    // Titre du document
    doc
      .fillColor('#2E6CF6')
      .fontSize(18)
      .text(`Relevé Comptalyze – ${year}`, 50, 120);

    // Table des enregistrements
    let y = 170;
    const tableTop = y;
    const itemHeight = 25;
    const pageHeight = doc.page.height;

    // En-têtes du tableau
    doc
      .fillColor('#0e0f12')
      .fontSize(10)
      .text('Mois', 50, y);
    doc.text('Activité', 120, y);
    doc.text('CA (€)', 280, y, { align: 'right' });
    doc.text('Cotisations (€)', 360, y, { align: 'right' });
    doc.text('Net (€)', 460, y, { align: 'right' });

    y += 20;
    doc
      .moveTo(50, y)
      .lineTo(550, y)
      .strokeColor('#cccccc')
      .stroke();

    y += 10;

    // Totaux
    let totalCA = 0;
    let totalContrib = 0;
    let totalNet = 0;

    const MONTHS = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    // Lignes du tableau
    records.forEach((record) => {
      // Vérifier si on doit créer une nouvelle page
      if (y > pageHeight - 100) {
        doc.addPage();
        y = 50;
      }

      const monthName = MONTHS[record.month - 1] || `Mois ${record.month}`;
      const ca = Number(record.amount_eur);
      const contrib = Number(record.computed_contrib_eur);
      const net = Number(record.computed_net_eur);

      totalCA += ca;
      totalContrib += contrib;
      totalNet += net;

      doc
        .fillColor('#333333')
        .fontSize(9)
        .text(monthName, 50, y);
      doc.text(record.activity_type, 120, y, { width: 150 });
      doc.text(ca.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 280, y, { align: 'right' });
      doc.text(contrib.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 360, y, { align: 'right' });
      doc.text(net.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 460, y, { align: 'right' });

      y += itemHeight;
    });

    // Ligne de séparation avant les totaux
    y += 5;
    doc
      .moveTo(50, y)
      .lineTo(550, y)
      .strokeColor('#cccccc')
      .stroke();

    y += 10;

    // Totaux
    doc
      .fillColor('#0e0f12')
      .fontSize(11)
      .text('TOTAL', 50, y);
    doc.text(totalCA.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €', 280, y, { align: 'right' });
    doc.text(totalContrib.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €', 360, y, { align: 'right' });
    
    doc
      .fillColor('#00D084')
      .text(totalNet.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €', 460, y, { align: 'right' });

    // Pied de page
    const footerY = doc.page.height - 50;
    doc
      .fillColor('#999999')
      .fontSize(8)
      .text(
        `Généré le ${new Date().toLocaleDateString('fr-FR')} • Comptalyze`,
        50,
        footerY,
        { align: 'center', width: doc.page.width - 100 }
      );

    doc.end();
  });
}

