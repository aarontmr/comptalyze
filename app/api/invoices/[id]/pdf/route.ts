import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { join } from 'path';
import { existsSync } from 'fs';

export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
  // Import dynamique de PDFKit
  const PDFDocumentModule = await import('pdfkit');
  const PDFDocument = PDFDocumentModule.default || PDFDocumentModule;

  return new Promise((resolve, reject) => {
    // Vérifier que PDFDocument est bien un constructeur
    if (typeof PDFDocument !== 'function') {
      reject(new Error(`PDFDocument is not a constructor. Type: ${typeof PDFDocument}`));
      return;
    }

    // Configuration avec autoFirstPage: false pour éviter le chargement précoce des polices
    let doc: any;
    try {
      doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        autoFirstPage: false
      });
      
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Ajouter la première page manuellement après la configuration
      doc.addPage();
    } catch (error: any) {
      reject(new Error(`Erreur lors de l'initialisation PDFKit: ${error?.message || 'Erreur inconnue'}`));
      return;
    }

    // En-tête professionnel avec logo
    const headerHeight = 120;
    doc
      .rect(0, 0, doc.page.width, headerHeight)
      .fill('#0e0f12');

    // Logo
    const logoPath = join(process.cwd(), 'public', 'logo.png');
    if (existsSync(logoPath)) {
      try {
        doc.image(logoPath, 50, 25, { 
          width: 80,
          height: 80,
          fit: [80, 80],
          align: 'left'
        });
      } catch (logoError) {
        console.warn('Erreur lors du chargement du logo:', logoError);
        // Fallback: utiliser le texte si le logo ne peut pas être chargé
        doc
          .fillColor('#00D084')
          .fontSize(28)
          .text('Comptalyze', 50, 45);
      }
    } else {
      // Fallback: utiliser le texte si le logo n'existe pas
      doc
        .fillColor('#00D084')
        .fontSize(28)
        .text('Comptalyze', 50, 45);
    }

    // Titre FACTURE aligné à droite
    doc
      .fillColor('#2E6CF6')
      .fontSize(32)
      .text('FACTURE', doc.page.width - 200, 50, {
        align: 'right',
        width: 150
      });

    // Informations de facture (section gauche)
    let y = 150;
    doc
      .fillColor('#666666')
      .fontSize(9)
      .text('Numéro de facture', 50, y);
    doc
      .fillColor('#000000')
      .fontSize(11)
      .text(invoice.invoice_number, 50, y + 12);

    y += 35;
    doc
      .fillColor('#666666')
      .fontSize(9)
      .text('Date d\'émission', 50, y);
    doc
      .fillColor('#000000')
      .fontSize(11)
      .text(new Date(invoice.issue_date).toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      }), 50, y + 12);

    if (invoice.due_date) {
      y += 35;
      doc
        .fillColor('#666666')
        .fontSize(9)
        .text('Date d\'échéance', 50, y);
      doc
        .fillColor('#000000')
        .fontSize(11)
        .text(new Date(invoice.due_date).toLocaleDateString('fr-FR', { 
          day: '2-digit', 
          month: 'long', 
          year: 'numeric' 
        }), 50, y + 12);
    }

    // Destinataire (section droite)
    y = 150;
    doc
      .fillColor('#666666')
      .fontSize(9)
      .text('Facturé à', doc.page.width - 200, y, {
        align: 'right',
        width: 150
      });
    y += 12;
    doc
      .fillColor('#000000')
      .fontSize(11)
      .text(invoice.customer_name, doc.page.width - 200, y, {
        align: 'right',
        width: 150
      });
    y += 15;
    if (invoice.customer_email) {
      doc
        .fillColor('#333333')
        .fontSize(10)
        .text(invoice.customer_email, doc.page.width - 200, y, {
          align: 'right',
          width: 150
        });
      y += 12;
    }
    if (invoice.customer_address) {
      doc
        .fillColor('#333333')
        .fontSize(10)
        .text(invoice.customer_address, doc.page.width - 200, y, {
          align: 'right',
          width: 150
        });
    }

    // Tableau des lignes
    y = 280;
    const tableTop = y;
    const itemHeight = 25;

    // Positions fixes des colonnes avec espacement généreux pour éviter le chevauchement
    // Format A4 = 595.28 points de largeur (environ 210mm)
    const colDescription = 50;
    const colDescriptionEnd = 320; // 270px pour description
    
    const colQty = 330; // 10px d'espace après description
    const colQtyEnd = 380; // 50px pour quantité
    
    const colPrice = 390; // 10px d'espace après quantité
    const colPriceEnd = 470; // 80px pour prix unitaire
    
    const colTotal = 480; // 10px d'espace après prix
    const colTotalEnd = 545; // 65px pour total (jusqu'à la marge droite)

    // En-têtes du tableau avec fond
    doc
      .rect(colDescription, y - 5, colTotalEnd - colDescription, 25)
      .fill('#f5f5f5');
    
    doc
      .fillColor('#0e0f12')
      .fontSize(10)
      .text('Description', colDescription + 5, y, { width: colDescriptionEnd - colDescription - 10 });
    doc
      .fillColor('#0e0f12')
      .text('Qté', colQty, y, { width: colQtyEnd - colQty, align: 'center' });
    doc
      .fillColor('#0e0f12')
      .text('Prix unit.', colPrice, y, { width: colPriceEnd - colPrice, align: 'right' });
    doc
      .fillColor('#0e0f12')
      .text('Total', colTotal, y, { width: colTotalEnd - colTotal, align: 'right' });

    y += 20;
    doc
      .moveTo(colDescription, y)
      .lineTo(colTotalEnd, y)
      .strokeColor('#dddddd')
      .lineWidth(1)
      .stroke();

    y += 10;

    // Lignes
    const items = invoice.items as InvoiceItem[];
    items.forEach((item, index) => {
      // Ligne de fond alternée pour meilleure lisibilité
      if (index % 2 === 0) {
        doc
          .rect(colDescription, y - 3, colTotalEnd - colDescription, itemHeight)
          .fill('#fafafa');
      }
      
      // Description
      doc
        .fillColor('#333333')
        .fontSize(9)
        .text(item.description, colDescription + 5, y, { width: colDescriptionEnd - colDescription - 10 });
      
      // Quantité
      doc
        .fillColor('#666666')
        .fontSize(9)
        .text(item.quantity.toString(), colQty, y, { width: colQtyEnd - colQty, align: 'center' });
      
      // Prix unitaire
      doc
        .fillColor('#333333')
        .fontSize(9)
        .text(
          Number(item.unit_price_eur).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €',
          colPrice,
          y,
          { width: colPriceEnd - colPrice, align: 'right' }
        );
      
      // Total
      doc
        .fillColor('#000000')
        .fontSize(9)
        .text(
          (item.quantity * item.unit_price_eur).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €',
          colTotal,
          y,
          { width: colTotalEnd - colTotal, align: 'right' }
        );
      y += itemHeight;
    });

    // Ligne de séparation
    y += 5;
    doc
      .moveTo(50, y)
      .lineTo(doc.page.width - 50, y)
      .strokeColor('#dddddd')
      .lineWidth(1)
      .stroke();

    y += 20;

    // Totaux - positions fixes simples pour garantir l'affichage
    const pageWidth = doc.page.width;
    
    // Labels à gauche (position X fixe)
    const labelX = 350;
    
    // Valeurs à droite (position X fixe avec marge)
    const valueX = 470;
    
    // Sous-total HT
    doc
      .fillColor('#666666')
      .fontSize(10)
      .text('Sous-total HT:', labelX, y);
    doc
      .fillColor('#000000')
      .fontSize(10)
      .text(
        Number(invoice.subtotal_eur).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €',
        valueX,
        y,
        { align: 'right', width: pageWidth - valueX - 50 }
      );

    if (invoice.vat_rate > 0) {
      y += 18;
      doc
        .fillColor('#666666')
        .fontSize(10)
        .text(`TVA (${invoice.vat_rate}%):`, labelX, y);
      doc
        .fillColor('#000000')
        .fontSize(10)
        .text(
          (Number(invoice.subtotal_eur) * invoice.vat_rate / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €',
          valueX,
          y,
          { align: 'right', width: pageWidth - valueX - 50 }
        );
    }

    y += 25;
    doc
      .moveTo(labelX - 50, y)
      .lineTo(pageWidth - 50, y)
      .strokeColor('#00D084')
      .lineWidth(2)
      .stroke();

    y += 15;
    // Total TTC
    doc
      .fillColor('#0e0f12')
      .fontSize(14)
      .text('Total TTC:', labelX, y);
    doc
      .fillColor('#00D084')
      .fontSize(16)
      .text(
        Number(invoice.total_eur).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €',
        valueX,
        y,
        { align: 'right', width: pageWidth - valueX - 50 }
      );

    // Notes
    if (invoice.notes) {
      y += 50;
      doc
        .moveTo(50, y)
        .lineTo(doc.page.width - 50, y)
        .strokeColor('#e0e0e0')
        .lineWidth(0.5)
        .stroke();
      
      y += 20;
      doc
        .fillColor('#666666')
        .fontSize(9)
        .text('Notes:', 50, y);
      y += 15;
      doc
        .fillColor('#333333')
        .fontSize(10)
        .text(invoice.notes, 50, y, { width: doc.page.width - 100 });
    }

    // Pied de page professionnel
    const footerY = doc.page.height - 40;
    doc
      .moveTo(50, footerY - 10)
      .lineTo(doc.page.width - 50, footerY - 10)
      .strokeColor('#e0e0e0')
      .lineWidth(0.5)
      .stroke();
    
    doc
      .fillColor('#999999')
      .fontSize(8)
      .text('Comptalyze - Facture générée automatiquement', 50, footerY, { 
        align: 'center', 
        width: doc.page.width - 100 
      });

    doc.end();
  });
}

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

    // Générer le PDF
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

