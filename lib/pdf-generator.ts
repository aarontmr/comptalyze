import { join, dirname } from 'path';

/**
 * Wrapper pour PDFKit qui configure correctement les chemins de polices
 * Résout le problème du chemin /ROOT/ sur Vercel
 */

// Configuration du chemin des polices AVANT d'importer PDFKit
if (typeof process !== 'undefined' && process.env && typeof require !== 'undefined') {
  try {
    // Trouver le vrai chemin de PDFKit
    const pdfkitPath = require.resolve('pdfkit');
    const pdfkitDir = dirname(dirname(pdfkitPath));
    const fontPath = join(pdfkitDir, 'js', 'data');
    
    // Définir la variable d'environnement que PDFKit utilise
    process.env.PDFKIT_FONT_PATH = fontPath;
    
    console.log('[PDF Generator] PDFKit font path configured:', fontPath);
  } catch (e) {
    console.warn('[PDF Generator] Could not configure PDFKit font path:', e);
  }
}

// Importer PDFKit APRÈS la configuration
import PDFDocument from 'pdfkit';

/**
 * Crée une instance de PDFDocument avec la configuration correcte
 */
export function createPDFDocument(options: any = {}) {
  const defaultOptions = {
    autoFirstPage: false,
    size: 'A4',
    margin: 50,
    bufferPages: true,
    ...options
  };

  try {
    const doc = new PDFDocument(defaultOptions);
    
    // Ajouter la première page si nécessaire
    if (options.autoFirstPage !== false) {
      doc.addPage();
    }
    
    return doc;
  } catch (error: any) {
    console.error('[PDF Generator] Error creating PDF document:', error);
    throw new Error(`Failed to create PDF: ${error.message}`);
  }
}

/**
 * Crée un buffer PDF à partir d'une fonction de génération
 */
export function generatePDFBuffer(generator: (doc: any) => void): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    let doc;
    
    try {
      doc = createPDFDocument({ autoFirstPage: false });
      
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);
      
      // Ajouter la première page
      doc.addPage();
      
      // Exécuter la fonction de génération
      generator(doc);
      
      // Finaliser le PDF
      doc.end();
    } catch (error: any) {
      reject(new Error(`PDF generation failed: ${error.message}`));
    }
  });
}

export default PDFDocument;


