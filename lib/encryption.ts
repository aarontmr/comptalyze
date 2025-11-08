import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  console.warn('⚠️ ENCRYPTION_KEY non configurée ou invalide (doit faire 32 caractères). Génération automatique...');
}

// Générer une clé par défaut si non définie (DEV UNIQUEMENT)
const ACTUAL_KEY = ENCRYPTION_KEY.length === 32 
  ? ENCRYPTION_KEY 
  : crypto.randomBytes(32).toString('hex').substring(0, 32);

export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ACTUAL_KEY), iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    console.error('Erreur chiffrement:', error);
    throw new Error('Échec du chiffrement');
  }
}

export function decrypt(text: string): string {
  try {
    const parts = text.split(':');
    if (parts.length !== 2) {
      throw new Error('Format de texte chiffré invalide');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = Buffer.from(parts[1], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ACTUAL_KEY), iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Erreur déchiffrement:', error);
    throw new Error('Échec du déchiffrement');
  }
}

