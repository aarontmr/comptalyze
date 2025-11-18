/**
 * Schémas de validation Zod pour toutes les routes API
 * Centralise la validation des données d'entrée
 */

import { z } from 'zod';

/**
 * Schéma pour la suppression de compte
 */
export const deleteAccountSchema = z.object({
  userId: z.string().uuid('ID utilisateur invalide'),
  confirmationText: z.literal('SUPPRIMER', {
    errorMap: () => ({ message: 'Vous devez taper "SUPPRIMER" pour confirmer' }),
  }),
});

/**
 * Schéma pour l'export de données
 */
export const exportDataSchema = z.object({
  userId: z.string().uuid('ID utilisateur invalide'),
  exportType: z.enum(['csv', 'excel'], {
    errorMap: () => ({ message: 'Type d\'export invalide (csv ou excel)' }),
  }).optional(),
  period: z.string().optional(),
  date: z.string().optional(),
});

/**
 * Schéma pour les routes admin (email requis)
 */
export const adminEmailSchema = z.object({
  email: z.string().email('Email invalide'),
});

/**
 * Schéma pour le chat IA
 */
export const aiChatSchema = z.object({
  message: z.string()
    .min(1, 'Le message ne peut pas être vide')
    .max(5000, 'Le message est trop long (max 5000 caractères)'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })).optional(),
});

/**
 * Schéma pour le pré-remplissage URSSAF
 */
export const urssafPrefillSchema = z.object({
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12).optional(),
  quarter: z.number().int().min(1).max(4).optional(),
  activity_type: z.string().optional(),
});

/**
 * Schéma pour la création de facture
 */
export const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description requise'),
  quantity: z.number().positive('La quantité doit être positive'),
  unit_price_eur: z.number().nonnegative('Le prix doit être positif ou nul'),
});

export const createInvoiceSchema = z.object({
  customer_name: z.string().min(1, 'Nom du client requis'),
  customer_email: z.string().email('Email invalide').optional().or(z.literal('')),
  customer_address: z.string().optional(),
  issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)').optional().or(z.literal('')),
  items: z.array(invoiceItemSchema).min(1, 'Au moins un article est requis'),
  vat_rate: z.number().min(0).max(100, 'Le taux de TVA doit être entre 0 et 100%'),
  notes: z.string().optional(),
});

/**
 * Schéma pour le checkout Stripe
 */
export const checkoutSchema = z.object({
  plan: z.enum(['pro', 'premium', 'pro_yearly', 'premium_yearly'], {
    errorMap: () => ({ message: 'Plan invalide' }),
  }),
  userId: z.string().uuid('ID utilisateur invalide'),
  gclid: z.string().optional(),
});

/**
 * Helper pour valider et parser les données
 */
export function validateAndParse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  // Retourner le premier message d'erreur
  const firstError = result.error.errors[0];
  return {
    success: false,
    error: firstError?.message || 'Données invalides',
  };
}

