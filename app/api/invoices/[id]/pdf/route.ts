import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateInvoicePDF } from '@/lib/pdf-generator';

export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invoiceId } = await params;

    if (!invoiceId) {
      return NextResponse.json({ error: 'ID de facture manquant' }, { status: 400 });
    }

    // Vérifier la session
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Non autorisé - Token manquant' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé - Token vide' }, { status: 401 });
    }

    // Vérifier l'utilisateur avec le token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError) {
      console.error('Erreur authentification:', authError);
      return NextResponse.json({ error: 'Non autorisé - Erreur d\'authentification' }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé - Utilisateur non trouvé' }, { status: 401 });
    }

    // Récupérer la facture avec l'admin client (bypass RLS)
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .single();

    if (invoiceError) {
      console.error('Erreur récupération facture:', invoiceError);
      console.error('Invoice ID:', invoiceId);
      console.error('User ID:', user.id);
      
      // Messages d'erreur plus spécifiques
      if (invoiceError.code === 'PGRST116') {
        return NextResponse.json({ 
          error: 'Facture non trouvée - Cette facture n\'existe pas ou ne vous appartient pas' 
        }, { status: 404 });
      }
      
      return NextResponse.json({ 
        error: `Erreur lors de la récupération de la facture: ${invoiceError.message}` 
      }, { status: 500 });
    }

    if (!invoice) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 });
    }

    // Vérifier que la facture appartient bien à l'utilisateur (double sécurité)
    if (invoice.user_id !== user.id) {
      return NextResponse.json({ error: 'Non autorisé - Cette facture ne vous appartient pas' }, { status: 403 });
    }

    // Générer le PDF avec pdf-lib
    const pdfBuffer = await generateInvoicePDF(invoice);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="facture-${invoice.invoice_number}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Erreur lors de la génération du PDF:', error);
    return NextResponse.json({ 
      error: `Erreur lors de la génération du PDF: ${error?.message || 'Erreur inconnue'}` 
    }, { status: 500 });
  }
}
