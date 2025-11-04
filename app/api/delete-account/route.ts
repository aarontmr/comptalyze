import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, confirmationText } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'ID utilisateur requis' }, { status: 400 });
    }

    // Vérification de la confirmation
    if (confirmationText !== 'SUPPRIMER') {
      return NextResponse.json({ 
        error: 'Confirmation invalide. Vous devez taper "SUPPRIMER" pour confirmer.' 
      }, { status: 400 });
    }

    // 1. Vérifier que l'utilisateur existe
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // 2. Supprimer les données dans les tables
    // Ordre important : supprimer d'abord les tables dépendantes, puis l'utilisateur

    // Supprimer les ca_records (historique des calculs)
    const { error: recordsError } = await supabaseAdmin
      .from('ca_records')
      .delete()
      .eq('user_id', userId);

    if (recordsError) {
      console.error('Erreur lors de la suppression des ca_records:', recordsError);
    }

    // Supprimer les invoices (factures)
    const { error: invoicesError } = await supabaseAdmin
      .from('invoices')
      .delete()
      .eq('user_id', userId);

    if (invoicesError) {
      console.error('Erreur lors de la suppression des invoices:', invoicesError);
    }

    // Supprimer les préférences email
    const { error: prefsError } = await supabaseAdmin
      .from('email_preferences')
      .delete()
      .eq('user_id', userId);

    if (prefsError) {
      console.error('Erreur lors de la suppression des préférences email:', prefsError);
    }

    // Supprimer les subscriptions
    const { error: subsError } = await supabaseAdmin
      .from('subscriptions')
      .delete()
      .eq('user_id', userId);

    if (subsError) {
      console.error('Erreur lors de la suppression des subscriptions:', subsError);
    }

    // 3. Supprimer l'utilisateur de auth.users
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', deleteUserError);
      return NextResponse.json({ 
        error: 'Erreur lors de la suppression du compte' 
      }, { status: 500 });
    }

    console.log(`✅ Compte utilisateur ${userId} (${userData.user.email}) supprimé avec succès`);

    return NextResponse.json({
      success: true,
      message: 'Votre compte et toutes vos données ont été supprimés définitivement.',
    });
  } catch (error: any) {
    console.error('Erreur lors de la suppression du compte:', error);
    return NextResponse.json({ 
      error: error.message || 'Erreur serveur lors de la suppression du compte' 
    }, { status: 500 });
  }
}


