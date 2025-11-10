import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { generateInvoicePDF } from '@/lib/pdf-generator';

export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendApiKey = process.env.RESEND_API_KEY;
const companyFromEmail = process.env.COMPANY_FROM_EMAIL || 'Comptalyze <no-reply@comptalyze.com>';

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invoiceId } = await params;

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

    // Générer le PDF avec pdf-lib
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
