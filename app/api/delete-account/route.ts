import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyUserOwnership } from '@/lib/auth';
import { deleteAccountSchema, validateAndParse } from '@/lib/validation';

export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Route pour supprimer définitivement un compte utilisateur
 * 
 * Cette route supprime :
 * - L'utilisateur de auth.users (via Admin API)
 * - Toutes les données associées dans les tables :
 *   - ca_records (historique des calculs)
 *   - subscriptions (abonnements)
 *   - invoices (factures)
 *   - email_preferences (préférences email)
 * 
 * ⚠️ ATTENTION : Cette action est IRRÉVERSIBLE
 * ⚠️ PROTÉGÉE : L'utilisateur ne peut supprimer que son propre compte
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Valider les données d'entrée
    const validation = validateAndParse(deleteAccountSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { userId, confirmationText } = validation.data;

    // Vérifier que l'utilisateur authentifié correspond au userId fourni
    const authResult = await verifyUserOwnership(req, userId);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // userId est déjà vérifié via verifyUserOwnership
    const userIdToDelete = authResult.userId;
    const userEmail = authResult.user.email;

    // 2. Supprimer les données dans les tables
    // Ordre important : supprimer d'abord les tables dépendantes, puis l'utilisateur

    // Supprimer les ca_records (historique des calculs)
    const { error: recordsError } = await supabaseAdmin
      .from('ca_records')
      .delete()
      .eq('user_id', userIdToDelete);

    if (recordsError) {
      console.error('Erreur lors de la suppression des ca_records:', recordsError);
    }

    // Supprimer les invoices (factures)
    const { error: invoicesError } = await supabaseAdmin
      .from('invoices')
      .delete()
      .eq('user_id', userIdToDelete);

    if (invoicesError) {
      console.error('Erreur lors de la suppression des invoices:', invoicesError);
    }

    // Supprimer les préférences email
    const { error: prefsError } = await supabaseAdmin
      .from('email_preferences')
      .delete()
      .eq('user_id', userIdToDelete);

    if (prefsError) {
      console.error('Erreur lors de la suppression des préférences email:', prefsError);
    }

    // Supprimer les subscriptions
    const { error: subsError } = await supabaseAdmin
      .from('subscriptions')
      .delete()
      .eq('user_id', userIdToDelete);

    if (subsError) {
      console.error('Erreur lors de la suppression des subscriptions:', subsError);
    }

    // 3. Supprimer l'utilisateur de auth.users
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userIdToDelete);

    if (deleteUserError) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', deleteUserError);
      return NextResponse.json({ 
        error: 'Erreur lors de la suppression du compte' 
      }, { status: 500 });
    }

    console.log(`✅ Compte utilisateur ${userIdToDelete} (${userEmail}) supprimé avec succès`);

    return NextResponse.json({
      success: true,
      message: 'Votre compte et toutes vos données ont été supprimés définitivement.',
    });
  } catch (error: any) {
    const { handleInternalError } = await import('@/lib/error-handler');
    return handleInternalError(error);
  }
}


