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

    const nowIso = new Date().toISOString();
    const trialStart = metadata.premium_trial_started_at || nowIso;

    // Retirer l'accès Premium et marquer l'essai comme consommé
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...metadata,
        premium_trial_started_at: trialStart,
        premium_trial_ends_at: nowIso,
        premium_trial_active: false,
        premium_trial_cancelled_at: nowIso,
        is_premium: false,
        is_pro: false,
        subscription_plan: null,
        subscription_status: null,
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

