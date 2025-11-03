import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import PDFDocument from 'pdfkit';
import { Resend } from 'resend';

export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendApiKey = process.env.RESEND_API_KEY;
const companyFromEmail = process.env.COMPANY_FROM_EMAIL || 'Comptalyze <no-reply@comptalyze.com>';

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price_eur: number;
}

async function generateInvoicePDF(invoice: any): Promise<Buffer> {
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

    // En-tête avec gradient
    doc
      .rect(0, 0, doc.page.width, 100)
      .fill('#0e0f12');

    // Logo ou titre
    doc
      .fillColor('#00D084')
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('Comptalyze', 50, 30);

    doc
      .fillColor('#ffffff')
      .fontSize(12)
      .font('Helvetica')
      .text('Noraa', 50, 60);

    // Titre
    doc
      .fillColor('#2E6CF6')
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('FACTURE', 50, 120);

    // Informations de facture
    let y = 160;
    doc
      .fillColor('#666666')
      .fontSize(10)
      .font('Helvetica')
      .text('Numéro:', 50, y);
    doc
      .fillColor('#000000')
      .font('Helvetica-Bold')
      .text(invoice.invoice_number, 120, y);

    y += 15;
    doc
      .fillColor('#666666')
      .font('Helvetica')
      .text('Date d\'émission:', 50, y);
    doc
      .fillColor('#000000')
      .font('Helvetica-Bold')
      .text(new Date(invoice.issue_date).toLocaleDateString('fr-FR'), 120, y);

    if (invoice.due_date) {
      y += 15;
      doc
        .fillColor('#666666')
        .font('Helvetica')
        .text('Date d\'échéance:', 50, y);
      doc
        .fillColor('#000000')
        .font('Helvetica-Bold')
        .text(new Date(invoice.due_date).toLocaleDateString('fr-FR'), 120, y);
    }

    // Destinataire
    y = 160;
    doc
      .fillColor('#666666')
      .fontSize(10)
      .font('Helvetica')
      .text('Facturé à:', 350, y);
    y += 15;
    doc
      .fillColor('#000000')
      .font('Helvetica-Bold')
      .text(invoice.customer_name, 350, y);
    y += 15;
    if (invoice.customer_email) {
      doc
        .fillColor('#333333')
        .font('Helvetica')
        .text(invoice.customer_email, 350, y);
      y += 15;
    }
    if (invoice.customer_address) {
      doc
        .fillColor('#333333')
        .font('Helvetica')
        .text(invoice.customer_address, 350, y, { width: 200 });
    }

    // Tableau des lignes
    y = 280;
    const itemHeight = 25;

    // En-têtes du tableau
    doc
      .fillColor('#0e0f12')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Description', 50, y);
    doc.text('Qté', 350, y);
    doc.text('Prix unitaire', 390, y);
    doc.text('Total', 470, y, { align: 'right' });

    y += 20;
    doc
      .moveTo(50, y)
      .lineTo(550, y)
      .strokeColor('#cccccc')
      .stroke();

    y += 10;

    // Lignes
    const items = invoice.items as InvoiceItem[];
    items.forEach((item) => {
      doc
        .fillColor('#333333')
        .fontSize(9)
        .font('Helvetica')
        .text(item.description, 50, y, { width: 280 });
      doc.text(item.quantity.toString(), 350, y);
      doc.text(
        Number(item.unit_price_eur).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €',
        390,
        y
      );
      doc.text(
        (item.quantity * item.unit_price_eur).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €',
        470,
        y,
        { align: 'right' }
      );
      y += itemHeight;
    });

    // Ligne de séparation
    y += 5;
    doc
      .moveTo(50, y)
      .lineTo(550, y)
      .strokeColor('#cccccc')
      .stroke();

    y += 15;

    // Totaux
    doc
      .fillColor('#333333')
      .fontSize(10)
      .font('Helvetica')
      .text('Sous-total HT:', 350, y);
    doc
      .fillColor('#000000')
      .font('Helvetica-Bold')
      .text(
        Number(invoice.subtotal_eur).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €',
        470,
        y,
        { align: 'right' }
      );

    if (invoice.vat_rate > 0) {
      y += 15;
      doc
        .fillColor('#333333')
        .font('Helvetica')
        .text(`TVA (${invoice.vat_rate}%):`, 350, y);
      doc
        .fillColor('#000000')
        .font('Helvetica-Bold')
        .text(
          (Number(invoice.subtotal_eur) * invoice.vat_rate / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €',
          470,
          y,
          { align: 'right' }
        );
    }

    y += 20;
    doc
      .moveTo(350, y)
      .lineTo(550, y)
      .strokeColor('#cccccc')
      .stroke();

    y += 15;
    doc
      .fillColor('#0e0f12')
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Total TTC:', 350, y);
    doc
      .fillColor('#00D084')
      .fontSize(14)
      .text(
        Number(invoice.total_eur).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €',
        470,
        y,
        { align: 'right' }
      );

    // Notes
    if (invoice.notes) {
      y += 40;
      doc
        .fillColor('#666666')
        .fontSize(9)
        .font('Helvetica')
        .text('Notes:', 50, y);
      y += 15;
      doc
        .fillColor('#333333')
        .text(invoice.notes, 50, y, { width: 500 });
    }

    // Pied de page
    const footerY = doc.page.height - 50;
    doc
      .fillColor('#999999')
      .fontSize(8)
      .font('Helvetica')
      .text('Comptalyze - Facture générée automatiquement', 50, footerY, { align: 'center', width: 500 });

    doc.end();
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;

    if (!resendApiKey) {
      return NextResponse.json({ error: 'Configuration Resend manquante' }, { status: 500 });
    }

    // Vérifier la session
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer la facture
    const { data: invoice, error } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .single();

    if (error || !invoice) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 });
    }

    // Générer le PDF
    const pdfBuffer = await generateInvoicePDF(invoice);

    // Déterminer l'email destinataire
    const recipientEmail = invoice.customer_email || user.email;
    if (!recipientEmail) {
      return NextResponse.json({ error: 'Aucun email destinataire disponible' }, { status: 400 });
    }

    // Envoyer l'email avec Resend
    const resend = new Resend(resendApiKey);
    const pdfBase64 = pdfBuffer.toString('base64');

    await resend.emails.send({
      from: companyFromEmail,
      to: recipientEmail,
      subject: `[Comptalyze] Votre facture ${invoice.invoice_number}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #00D084;">Facture ${invoice.invoice_number}</h2>
          <p>Bonjour,</p>
          <p>Vous trouverez ci-joint votre facture ${invoice.invoice_number} d'un montant de ${Number(invoice.total_eur).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €.</p>
          <p>Merci de votre confiance.</p>
          <p>Cordialement,<br>L'équipe Comptalyze</p>
        </div>
      `,
      attachments: [
        {
          filename: `facture-${invoice.invoice_number}.pdf`,
          content: pdfBase64,
        },
      ],
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'envoi de l\'email' }, { status: 500 });
  }
}

