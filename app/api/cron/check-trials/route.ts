import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Cette route peut être appelée par un cron job (Vercel Cron, GitHub Actions, etc.)
// pour expirer automatiquement les essais après 3 jours
export async function GET(req: NextRequest) {
  // Vérifier une clé secrète pour sécuriser l'endpoint
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Récupérer tous les utilisateurs avec un essai actif
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const now = new Date();
    let expiredCount = 0;

    // Parcourir tous les utilisateurs et vérifier les essais expirés
    for (const user of users) {
      const metadata = user.user_metadata || {};
      const trialEndsAt = metadata.premium_trial_ends_at;
      const trialActive = metadata.premium_trial_active === true;
      const hasStripeSubscription = !!metadata.stripe_subscription_id;

      // Si l'utilisateur a un essai actif et qu'il est expiré, et qu'il n'a pas d'abonnement Stripe
      if (trialActive && trialEndsAt && !hasStripeSubscription) {
        const trialEnd = new Date(trialEndsAt);
        
        if (now >= trialEnd) {
          // L'essai est expiré, retirer l'accès Premium
          await supabaseAdmin.auth.admin.updateUserById(user.id, {
            user_metadata: {
              ...metadata,
              premium_trial_active: false,
              is_premium: false,
              subscription_plan: null,
              subscription_status: null,
            },
          });
          
          expiredCount++;
          console.log(`✅ Essai expiré pour ${user.id}`);
        }
      }
    }

    return NextResponse.json({ 
      success: true,
      expiredTrials: expiredCount,
      message: `${expiredCount} essai(s) expiré(s)`
    });
  } catch (error: any) {
    console.error('Erreur lors de la vérification des essais:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

