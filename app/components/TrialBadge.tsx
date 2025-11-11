/**
 * Badge affichant le compte à rebours du trial
 * Version serveur qui lit depuis user_profiles (source de vérité)
 */

import { getUserPlan } from '@/app/lib/billing/getUserPlan';
import { getPlan } from '@/app/lib/billing/plans';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import TrialBadgeClient from './TrialBadgeClient';

export default async function TrialBadge() {
  // Récupérer l'utilisateur courant
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }
  
  // Récupérer le plan depuis la DB
  const userPlan = await getUserPlan(user.id);
  
  // Afficher uniquement si en trial actif
  if (!userPlan.isTrialing || !userPlan.trialEndsAt || !userPlan.trialPlan) {
    return null;
  }
  
  // Le badge n'est pertinent que pour les trials Pro/Premium (pas Free)
  if (userPlan.trialPlan === 'free') {
    return null;
  }
  
  const planDetails = getPlan(userPlan.trialPlan);
  
  return (
    <TrialBadgeClient 
      trialEndsAt={userPlan.trialEndsAt.toISOString()} 
      plan={userPlan.trialPlan as 'pro' | 'premium'}
      planColor={planDetails.color}
      planGradient={planDetails.gradient || planDetails.color}
    />
  );
}

