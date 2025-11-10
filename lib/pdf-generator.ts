import { join, dirname } from 'path';

/**
 * Wrapper pour PDFKit qui configure correctement les chemins de polices
 * Résout le problème du chemin /ROOT/ sur Vercel
 */

// Variable pour savoir si la configuration a été faite
let pdfkitConfigured = false;

/**
 * Configure le chemin des polices PDFKit au runtime
 */
function configurePDFKitFonts() {
  if (pdfkitConfigured) return;
  
  try {
    // Vérifier si on est côté serveur
    if (typeof process === 'undefined' || !process.env) return;
    
    // Essayer plusieurs chemins possibles pour les polices
    const possiblePaths = [
      // Chemin standard dans node_modules
      join(process.cwd(), 'node_modules', 'pdfkit', 'js', 'data'),
      // Chemin dans .next (après build)
      join(process.cwd(), '.next', 'server', 'node_modules', 'pdfkit', 'js', 'data'),
      // Chemin Vercel
      join('/var', 'task', 'node_modules', 'pdfkit', 'js', 'data'),
    ];
    
    const fs = require('fs');
    let fontPath = null;
    
    // Trouver le premier chemin qui existe
    for (const path of possiblePaths) {
      if (fs.existsSync(path)) {
        fontPath = path;
        break;
      }
    }
    
    if (fontPath) {
      process.env.PDFKIT_FONT_PATH = fontPath;
      console.log('[PDF Generator] PDFKit font path configured:', fontPath);
      pdfkitConfigured = true;
    } else {
      console.warn('[PDF Generator] No valid font path found, tried:', possiblePaths);
    }
  } catch (e) {
    console.warn('[PDF Generator] Could not configure PDFKit font path:', e);
  }
}

// Import PDFKit
import PDFDocument from 'pdfkit';

/**
 * Crée une instance de PDFDocument avec la configuration correcte
 */
export function createPDFDocument(options: any = {}) {
  // Configurer les polices au runtime (première fois seulement)
  configurePDFKitFonts();
  
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


