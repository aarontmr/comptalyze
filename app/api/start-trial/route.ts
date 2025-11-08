import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    console.log('🔍 Tentative de démarrage d\'essai pour userId:', userId);

    if (!userId) {
      console.error('❌ UserId manquant');
      return NextResponse.json({ error: "Vous devez être connecté" }, { status: 401 });
    }

    // Récupérer les données utilisateur actuelles
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (userError) {
      console.error('❌ Erreur récupération utilisateur:', userError);
      return NextResponse.json({ error: "Utilisateur non trouvé: " + userError.message }, { status: 404 });
    }
    
    if (!userData?.user) {
      console.error('❌ Utilisateur non trouvé');
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const metadata = userData.user.user_metadata || {};
    console.log('📋 Métadonnées actuelles:', JSON.stringify(metadata, null, 2));

    // Vérifier si l'utilisateur a déjà un essai ou un abonnement actif
    if (metadata.premium_trial_started_at) {
      console.log('⚠️ Essai déjà commencé à:', metadata.premium_trial_started_at);
      return NextResponse.json({ 
        error: "Vous avez déjà utilisé votre essai gratuit" 
      }, { status: 400 });
    }
    
    if (metadata.is_premium && metadata.stripe_subscription_id) {
      console.log('⚠️ Abonnement Premium actif');
      return NextResponse.json({ 
        error: "Vous avez déjà un abonnement Premium actif" 
      }, { status: 400 });
    }

    // Calculer la date d'expiration (3 jours à partir de maintenant)
    const trialStartDate = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 3);

    console.log('📅 Dates d\'essai:', {
      start: trialStartDate.toISOString(),
      end: trialEndDate.toISOString()
    });

    // Mettre à jour les métadonnées utilisateur
    const updateData = {
      user_metadata: {
        ...metadata,
        premium_trial_started_at: trialStartDate.toISOString(),
        premium_trial_ends_at: trialEndDate.toISOString(),
        is_premium: true,
        subscription_plan: 'premium',
        subscription_status: 'trialing',
        premium_trial_active: true,
      },
    };

    console.log('💾 Mise à jour des métadonnées:', JSON.stringify(updateData, null, 2));

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, updateData);

    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour:', updateError);
      return NextResponse.json({ error: "Erreur lors de l'activation de l'essai: " + updateError.message }, { status: 500 });
    }

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

