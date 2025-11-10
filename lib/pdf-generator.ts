import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Générateur PDF utilisant pdf-lib
 * Fonctionne parfaitement sur Vercel sans dépendance aux fichiers externes
 */

export interface PDFOptions {
  title?: string;
  author?: string;
  subject?: string;
}

/**
 * Crée un nouveau document PDF
 */
export async function createPDF(options: PDFOptions = {}) {
  const pdfDoc = await PDFDocument.create();
  
  // Métadonnées
  if (options.title) pdfDoc.setTitle(options.title);
  if (options.author) pdfDoc.setAuthor(options.author);
  if (options.subject) pdfDoc.setSubject(options.subject);
  
  return pdfDoc;
}

/**
 * Génère un PDF pour les enregistrements de CA
 */
export async function generateRecordsPDF(records: any[], year: number): Promise<Buffer> {
  const pdfDoc = await createPDF({
    title: `Comptalyze - Relevé ${year}`,
    author: 'Comptalyze',
    subject: `Relevé annuel ${year}`
  });
  
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  
  // Charger les polices
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  let y = height - 50;
  
  // En-tête avec fond
  page.drawRectangle({
    x: 0,
    y: height - 100,
    width: width,
    height: 100,
    color: rgb(0.055, 0.059, 0.071), // #0e0f12
  });
  
  // Logo/Titre
  page.drawText('Comptalyze', {
    x: 50,
    y: height - 50,
    size: 24,
    font: helveticaBold,
    color: rgb(0, 0.816, 0.518), // #00D084
  });
  
  page.drawText(`Relevé ${year}`, {
    x: 50,
    y: height - 75,
    size: 16,
    font: helvetica,
    color: rgb(1, 1, 1),
  });
  
  // Titre du document
  y = height - 130;
  page.drawText(`Relevé Comptalyze – ${year}`, {
    x: 50,
    y: y,
    size: 18,
    font: helveticaBold,
    color: rgb(0.18, 0.424, 0.965), // #2E6CF6
  });
  
  // En-têtes du tableau
  y -= 50;
  const colMois = 50;
  const colActivite = 130;
  const colCA = 320;
  const colCotisations = 410;
  const colNet = 500;
  
  page.drawText('Mois', { x: colMois, y, size: 10, font: helveticaBold });
  page.drawText('Activité', { x: colActivite, y, size: 10, font: helveticaBold });
  page.drawText('CA (€)', { x: colCA, y, size: 10, font: helveticaBold });
  page.drawText('Cotisations (€)', { x: colCotisations, y, size: 10, font: helveticaBold });
  page.drawText('Net (€)', { x: colNet, y, size: 10, font: helveticaBold });
  
  // Ligne de séparation
  y -= 15;
  page.drawLine({
    start: { x: colMois, y },
    end: { x: width - 50, y },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  
  y -= 15;
  
  // Totaux
  let totalCA = 0;
  let totalContrib = 0;
  let totalNet = 0;
  
  const MONTHS = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  
  // Lignes du tableau
  for (const record of records) {
    // Nouvelle page si nécessaire
    if (y < 100) {
      const newPage = pdfDoc.addPage([595.28, 841.89]);
      y = newPage.getSize().height - 50;
    }
    
    const monthName = MONTHS[record.month - 1] || `Mois ${record.month}`;
    const ca = Number(record.amount_eur);
    const contrib = Number(record.computed_contrib_eur);
    const net = Number(record.computed_net_eur);
    
    totalCA += ca;
    totalContrib += contrib;
    totalNet += net;
    
    const currentPage = pdfDoc.getPages()[pdfDoc.getPageCount() - 1];
    
    currentPage.drawText(monthName, { x: colMois, y, size: 9, font: helvetica });
    currentPage.drawText(record.activity_type.substring(0, 20), { x: colActivite, y, size: 9, font: helvetica });
    currentPage.drawText(ca.toFixed(2), { x: colCA, y, size: 9, font: helvetica });
    currentPage.drawText(contrib.toFixed(2), { x: colCotisations, y, size: 9, font: helvetica });
    currentPage.drawText(net.toFixed(2), { x: colNet, y, size: 9, font: helvetica });
    
    y -= 20;
  }
  
  // Ligne de séparation avant totaux
  y -= 10;
  const lastPage = pdfDoc.getPages()[pdfDoc.getPageCount() - 1];
  lastPage.drawLine({
    start: { x: colMois, y },
    end: { x: width - 50, y },
    thickness: 2,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  y -= 20;
  
  // Totaux
  lastPage.drawText('TOTAL', { x: colMois, y, size: 11, font: helveticaBold });
  lastPage.drawText(totalCA.toFixed(2), { x: colCA, y, size: 11, font: helveticaBold });
  lastPage.drawText(totalContrib.toFixed(2), { x: colCotisations, y, size: 11, font: helveticaBold });
  lastPage.drawText(totalNet.toFixed(2), { 
    x: colNet, 
    y, 
    size: 11, 
    font: helveticaBold,
    color: rgb(0, 0.816, 0.518) // #00D084
  });
  
  // Pied de page
  lastPage.drawText(
    `Généré le ${new Date().toLocaleDateString('fr-FR')} • Comptalyze`,
    {
      x: width / 2 - 100,
      y: 30,
      size: 8,
      font: helvetica,
      color: rgb(0.6, 0.6, 0.6),
    }
  );
  
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Génère un PDF pour une facture
 */
export async function generateInvoicePDF(invoice: any): Promise<Buffer> {
  const pdfDoc = await createPDF({
    title: `Facture ${invoice.invoice_number}`,
    author: 'Comptalyze',
    subject: `Facture ${invoice.invoice_number}`
  });
  
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  
  // Charger les polices
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  let y = height - 50;
  
  // En-tête avec fond
  page.drawRectangle({
    x: 0,
    y: height - 120,
    width: width,
    height: 120,
    color: rgb(0.055, 0.059, 0.071),
  });
  
  // Logo/Titre Comptalyze
  page.drawText('Comptalyze', {
    x: 50,
    y: height - 65,
    size: 28,
    font: helveticaBold,
    color: rgb(0, 0.816, 0.518),
  });
  
  // Titre FACTURE
  page.drawText('FACTURE', {
    x: width - 200,
    y: height - 70,
    size: 32,
    font: helveticaBold,
    color: rgb(0.18, 0.424, 0.965),
  });
  
  // Informations de facture (gauche)
  y = height - 150;
  page.drawText('Numéro de facture', { x: 50, y, size: 9, font: helvetica, color: rgb(0.4, 0.4, 0.4) });
  page.drawText(invoice.invoice_number, { x: 50, y: y - 12, size: 11, font: helveticaBold });
  
  y -= 35;
  page.drawText('Date d\'émission', { x: 50, y, size: 9, font: helvetica, color: rgb(0.4, 0.4, 0.4) });
  page.drawText(
    new Date(invoice.issue_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
    { x: 50, y: y - 12, size: 11, font: helvetica }
  );
  
  if (invoice.due_date) {
    y -= 35;
    page.drawText('Date d\'échéance', { x: 50, y, size: 9, font: helvetica, color: rgb(0.4, 0.4, 0.4) });
    page.drawText(
      new Date(invoice.due_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
      { x: 50, y: y - 12, size: 11, font: helvetica }
    );
  }
  
  // Destinataire (droite)
  y = height - 150;
  page.drawText('Facturé à', { x: width - 200, y, size: 9, font: helvetica, color: rgb(0.4, 0.4, 0.4) });
  page.drawText(invoice.customer_name, { x: width - 200, y: y - 15, size: 11, font: helveticaBold });
  
  if (invoice.customer_email) {
    page.drawText(invoice.customer_email, { x: width - 200, y: y - 30, size: 10, font: helvetica });
  }
  
  if (invoice.customer_address) {
    page.drawText(invoice.customer_address.substring(0, 30), { x: width - 200, y: y - 45, size: 10, font: helvetica });
  }
  
  // Tableau des lignes
  y = height - 280;
  const colDesc = 50;
  const colQty = 330;
  const colPrice = 390;
  const colTotal = 480;
  
  // En-tête du tableau avec fond
  page.drawRectangle({
    x: colDesc,
    y: y - 5,
    width: width - 100,
    height: 25,
    color: rgb(0.96, 0.96, 0.96),
  });
  
  page.drawText('Description', { x: colDesc + 5, y, size: 10, font: helveticaBold });
  page.drawText('Qté', { x: colQty, y, size: 10, font: helveticaBold });
  page.drawText('Prix unit.', { x: colPrice, y, size: 10, font: helveticaBold });
  page.drawText('Total', { x: colTotal, y, size: 10, font: helveticaBold });
  
  y -= 20;
  page.drawLine({
    start: { x: colDesc, y },
    end: { x: width - 50, y },
    thickness: 1,
    color: rgb(0.87, 0.87, 0.87),
  });
  
  y -= 10;
  
  // Lignes de la facture
  const items = invoice.items || [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    // Fond alterné
    if (i % 2 === 0) {
      page.drawRectangle({
        x: colDesc,
        y: y - 3,
        width: width - 100,
        height: 25,
        color: rgb(0.98, 0.98, 0.98),
      });
    }
    
    page.drawText(item.description.substring(0, 35), { x: colDesc + 5, y, size: 9, font: helvetica });
    page.drawText(item.quantity.toString(), { x: colQty, y, size: 9, font: helvetica });
    page.drawText(`${Number(item.unit_price_eur).toFixed(2)} €`, { x: colPrice, y, size: 9, font: helvetica });
    page.drawText(
      `${(item.quantity * item.unit_price_eur).toFixed(2)} €`,
      { x: colTotal, y, size: 9, font: helveticaBold }
    );
    
    y -= 25;
  }
  
  // Ligne de séparation
  y -= 5;
  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 1,
    color: rgb(0.87, 0.87, 0.87),
  });
  
  y -= 20;
  
  // Totaux
  const labelX = 350;
  const valueX = 470;
  
  page.drawText('Sous-total HT:', { x: labelX, y, size: 10, font: helvetica, color: rgb(0.4, 0.4, 0.4) });
  page.drawText(`${Number(invoice.subtotal_eur).toFixed(2)} €`, { x: valueX, y, size: 10, font: helvetica });
  
  if (invoice.vat_rate > 0) {
    y -= 18;
    page.drawText(`TVA (${invoice.vat_rate}%):`, { x: labelX, y, size: 10, font: helvetica, color: rgb(0.4, 0.4, 0.4) });
    page.drawText(
      `${(Number(invoice.subtotal_eur) * invoice.vat_rate / 100).toFixed(2)} €`,
      { x: valueX, y, size: 10, font: helvetica }
    );
  }
  
  y -= 25;
  page.drawLine({
    start: { x: labelX - 50, y },
    end: { x: width - 50, y },
    thickness: 2,
    color: rgb(0, 0.816, 0.518),
  });
  
  y -= 15;
  page.drawText('Total TTC:', { x: labelX, y, size: 14, font: helveticaBold });
  page.drawText(
    `${Number(invoice.total_eur).toFixed(2)} €`,
    { x: valueX, y, size: 16, font: helveticaBold, color: rgb(0, 0.816, 0.518) }
  );
  
  // Notes
  if (invoice.notes) {
    y -= 50;
    page.drawLine({
      start: { x: 50, y },
      end: { x: width - 50, y },
      thickness: 0.5,
      color: rgb(0.88, 0.88, 0.88),
    });
    
    y -= 20;
    page.drawText('Notes:', { x: 50, y, size: 9, font: helvetica, color: rgb(0.4, 0.4, 0.4) });
    page.drawText(invoice.notes.substring(0, 80), { x: 50, y: y - 15, size: 10, font: helvetica });
  }
  
  // Pied de page
  page.drawLine({
    start: { x: 50, y: 50 },
    end: { x: width - 50, y: 50 },
    thickness: 0.5,
    color: rgb(0.88, 0.88, 0.88),
  });
  
  page.drawText('Comptalyze - Facture générée automatiquement', {
    x: width / 2 - 100,
    y: 30,
    size: 8,
    font: helvetica,
    color: rgb(0.6, 0.6, 0.6),
  });
  
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
