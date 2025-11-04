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

    // Vérifier si l'utilisateur a déjà un essai ou un abonnement actif
    if (metadata.premium_trial_started_at || metadata.is_premium || metadata.subscription_plan === 'premium') {
      return NextResponse.json({ 
        error: "Vous avez déjà un essai gratuit ou un abonnement Premium actif" 
      }, { status: 400 });
    }

    // Calculer la date d'expiration (3 jours à partir de maintenant)
    const trialStartDate = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 3);

    // Mettre à jour les métadonnées utilisateur
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...metadata,
        premium_trial_started_at: trialStartDate.toISOString(),
        premium_trial_ends_at: trialEndDate.toISOString(),
        is_premium: true,
        subscription_plan: 'premium',
        subscription_status: 'trialing',
        premium_trial_active: true,
      },
    });

    console.log(`✅ Essai gratuit Premium démarré pour ${userId} jusqu'au ${trialEndDate.toISOString()}`);

    return NextResponse.json({ 
      success: true,
      trialEndsAt: trialEndDate.toISOString(),
      message: "Votre essai gratuit de 3 jours a commencé !"
    });
  } catch (error: any) {
    console.error('Erreur lors du démarrage de l\'essai:', error);
    return NextResponse.json({ error: error.message || "Une erreur est survenue" }, { status: 500 });
  }
}

