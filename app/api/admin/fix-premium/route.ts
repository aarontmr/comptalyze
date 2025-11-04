import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Route pour diagnostiquer et corriger le statut Premium d'un utilisateur
 * Usage: POST /api/admin/fix-premium
 * Body: { "email": "user@email.com" }
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    // Trouver l'utilisateur par email
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      return NextResponse.json({ error: 'Erreur lors de la récupération des utilisateurs' }, { status: 500 });
    }

    const user = users.find(u => u.email === email);

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Diagnostic actuel
    const currentMetadata = user.user_metadata || {};
    const diagnosis = {
      userId: user.id,
      email: user.email,
      currentMetadata: {
        subscription_plan: currentMetadata.subscription_plan,
        is_premium: currentMetadata.is_premium,
        is_pro: currentMetadata.is_pro,
        subscription_status: currentMetadata.subscription_status,
        premium_trial_active: currentMetadata.premium_trial_active,
        premium_trial_ends_at: currentMetadata.premium_trial_ends_at,
      },
    };

    // Forcer le statut Premium
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...currentMetadata,
          subscription_plan: 'premium',
          is_premium: true,
          is_pro: true,
          subscription_status: 'active',
        },
      }
    );

    if (updateError) {
      return NextResponse.json({ 
        error: 'Erreur lors de la mise à jour', 
        details: updateError 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Statut Premium corrigé avec succès',
      before: diagnosis.currentMetadata,
      after: {
        subscription_plan: 'premium',
        is_premium: true,
        is_pro: true,
        subscription_status: 'active',
      },
      user: {
        id: updatedUser.user.id,
        email: updatedUser.user.email,
      },
    });
  } catch (error: any) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Route GET pour vérifier le statut sans modifier
 */
export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email requis (param: email)' }, { status: 400 });
    }

    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      return NextResponse.json({ error: 'Erreur lors de la récupération des utilisateurs' }, { status: 500 });
    }

    const user = users.find(u => u.email === email);

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const metadata = user.user_metadata || {};

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      metadata: {
        subscription_plan: metadata.subscription_plan,
        is_premium: metadata.is_premium,
        is_pro: metadata.is_pro,
        subscription_status: metadata.subscription_status,
        premium_trial_active: metadata.premium_trial_active,
        premium_trial_ends_at: metadata.premium_trial_ends_at,
        stripe_customer_id: metadata.stripe_customer_id,
        stripe_subscription_id: metadata.stripe_subscription_id,
      },
      interpretation: {
        isPremium: metadata.is_premium === true,
        isPro: metadata.is_pro === true,
        plan: metadata.subscription_plan || 'free',
        status: metadata.subscription_status || 'none',
      },
    });
  } catch (error: any) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

