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
 * Route pour activer Pro sur un compte (pour les tests uniquement)
 * 
 * ⚠️ SÉCURITÉ : Cette route devrait être protégée en production
 * Pour les tests, passez votre email en paramètre
 * 
 * Usage : POST /api/admin/set-pro
 * Body: { "email": "votre@email.com" }
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

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
    console.error('Erreur:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}

