import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdmin } from '@/lib/auth';
import { adminEmailSchema, validateAndParse } from '@/lib/validation';

export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Route pour activer Pro sur un compte
 * 
 * ⚠️ PROTÉGÉE : Requiert authentification admin
 * 
 * Usage : POST /api/admin/set-pro
 * Headers: { "Authorization": "Bearer <token>" }
 * Body: { "email": "votre@email.com" }
 */
export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const authResult = await verifyAdmin(req);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await req.json();
    
    // Valider les données d'entrée
    const validation = validateAndParse(adminEmailSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { email } = validation.data;

    // Trouver l'utilisateur par email
    const { data: users, error: findError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (findError) {
      return NextResponse.json({ error: 'Erreur lors de la recherche de l\'utilisateur' }, { status: 500 });
    }

    const user = users.users.find(u => u.email === email);

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Mettre à jour les métadonnées utilisateur pour Pro
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          subscription_plan: 'pro',
          is_pro: true,
          is_premium: false, // Pro n'est pas Premium
          subscription_status: 'active',
        },
      }
    );

    if (updateError) {
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
    }

    // Créer ou mettre à jour l'enregistrement dans subscriptions
    const { error: subError } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        status: 'active',
        price_id: 'pro_test', // Valeur de test acceptée par lib/plan.ts
        stripe_subscription_id: 'sub_test_pro',
        stripe_customer_id: 'cus_test_pro',
      }, {
        onConflict: 'user_id',
      });

    if (subError) {
      console.error('Erreur lors de la création de l\'abonnement:', subError);
      // On continue quand même car les métadonnées sont mises à jour
    }

    return NextResponse.json({
      success: true,
      message: 'Abonnement Pro activé avec succès',
      user: {
        email: updatedUser.user.email,
        id: updatedUser.user.id,
        metadata: updatedUser.user.user_metadata,
      },
      instructions: [
        'Déconnectez-vous complètement de l\'application',
        'Fermez l\'onglet du navigateur (ou videz le cache)',
        'Reconnectez-vous',
        'Les fonctionnalités Pro devraient maintenant être visibles',
      ],
    });
  } catch (error: any) {
    const { handleInternalError } = await import('@/lib/error-handler');
    return handleInternalError(error);
  }
}

