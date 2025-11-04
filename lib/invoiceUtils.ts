import { createClient } from '@supabase/supabase-js';

/**
 * Génère un numéro de facture unique au format CPT-YYYY-XXXX
 * où XXXX est un numéro incrémental par utilisateur et année
 */
export async function generateInvoiceNumber(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `CPT-${year}-`;

  // Récupérer le dernier numéro de facture de l'utilisateur pour cette année
  const { data: lastInvoice, error } = await supabase
    .from('invoices')
    .select('invoice_number')
    .eq('user_id', userId)
    .like('invoice_number', `${prefix}%`)
    .order('invoice_number', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned, ce qui est normal pour la première facture
    console.error('Erreur lors de la récupération du dernier numéro:', error);
  }

  let nextNumber = 1;

  if (lastInvoice?.invoice_number) {
    // Extraire le numéro de la dernière facture
    const lastNumberStr = lastInvoice.invoice_number.replace(prefix, '');
    const lastNumber = parseInt(lastNumberStr, 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  // Formater le numéro avec 4 chiffres
  const numberStr = nextNumber.toString().padStart(4, '0');
  const invoiceNumber = `${prefix}${numberStr}`;

  // Vérifier l'unicité (retry si conflit)
  const { data: existing } = await supabase
    .from('invoices')
    .select('id')
    .eq('invoice_number', invoiceNumber)
    .single();

  if (existing) {
    // Si le numéro existe déjà, réessayer avec le suivant
    return generateInvoiceNumber(supabase, userId);
  }

  return invoiceNumber;
}


