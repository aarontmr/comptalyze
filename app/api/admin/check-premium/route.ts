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
 * Route pour vérifier le statut Premium d'un utilisateur
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
      return NextResponse.json({ error: 'Erreur lors de la recherche' }, { status: 500 });
    }

    const user = users.users.find(u => u.email === email);

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Vérifier les métadonnées
    const metadata = user.user_metadata || {};
    
    // Vérifier la table subscriptions
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      user: {
        email: user.email,
        id: user.id,
      },
      metadata: {
        subscription_plan: metadata.subscription_plan,
        is_pro: metadata.is_pro,
        is_premium: metadata.is_premium,
        subscription_status: metadata.subscription_status,
        full_metadata: metadata,
      },
      subscription: subscription || null,
      subscriptionError: subError?.message || null,
      analysis: {
        shouldBePremium: metadata.subscription_plan === 'premium' || metadata.is_premium === true,
        hasActiveSubscription: subscription?.status === 'active' && subscription?.price_id === 'premium_test',
        recommendation: (metadata.subscription_plan === 'premium' || metadata.is_premium === true || subscription?.price_id === 'premium_test')
          ? 'Premium devrait être actif. Si ce n\'est pas le cas, déconnectez-vous complètement et reconnectez-vous.'
          : 'Premium n\'est pas activé. Utilisez /api/admin/set-premium pour l\'activer.',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}




































