import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Vous devez être connecté" }, { status: 401 });
    }

    // Récupérer les données utilisateur actuelles
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const metadata = userData.user.user_metadata || {};

    // Vérifier si l'utilisateur a un essai actif
    if (!metadata.premium_trial_active && !metadata.premium_trial_started_at) {
      return NextResponse.json({ 
        error: "Vous n'avez pas d'essai gratuit actif" 
      }, { status: 400 });
    }

    // Retirer l'accès Premium et les métadonnées d'essai
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...metadata,
        premium_trial_started_at: null,
        premium_trial_ends_at: null,
        premium_trial_active: false,
        is_premium: false,
        subscription_plan: metadata.subscription_plan === 'premium' && !metadata.stripe_subscription_id ? null : metadata.subscription_plan,
        subscription_status: metadata.stripe_subscription_id ? metadata.subscription_status : null,
      },
    });

    console.log(`❌ Essai gratuit Premium annulé pour ${userId}`);

    return NextResponse.json({ 
      success: true,
      message: "Votre essai gratuit a été annulé."
    });
  } catch (error: any) {
    console.error('Erreur lors de l\'annulation de l\'essai:', error);
    return NextResponse.json({ error: error.message || "Une erreur est survenue" }, { status: 500 });
  }
}

