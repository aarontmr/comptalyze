/**
 * Route pour vérifier et incrémenter le quota de simulations
 * Enforcement côté serveur pour le plan Free (3 simulations/mois max)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserPlanServer } from '@/lib/plan';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const FREE_PLAN_LIMIT = 3;

export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 401 }
      );
    }
    
    // Vérifier le token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }
    
    const userId = user.id;
    
    // Récupérer le plan de l'utilisateur
    const plan = await getUserPlanServer(userId, user.user_metadata);
    
    // Si Pro ou Premium, accès illimité
    if (plan === 'pro' || plan === 'premium') {
      return NextResponse.json({
        allowed: true,
        plan,
        unlimited: true,
        current: 0,
        limit: null,
      });
    }
    
    // Pour Free, vérifier le quota
    // Récupérer le compteur actuel
    const { data: countData, error: countError } = await supabaseAdmin
      .rpc('get_simulation_count', { p_user_id: userId });
    
    if (countError) {
      console.error('Erreur get_simulation_count:', countError);
      // En cas d'erreur, autoriser (fail open) mais logger
      return NextResponse.json({
        allowed: true,
        plan: 'free',
        current: 0,
        limit: FREE_PLAN_LIMIT,
        error: 'Erreur vérification quota',
      });
    }
    
    const currentCount = countData || 0;
    
    // Vérifier si limite atteinte
    if (currentCount >= FREE_PLAN_LIMIT) {
      return NextResponse.json(
        {
          allowed: false,
          plan: 'free',
          current: currentCount,
          limit: FREE_PLAN_LIMIT,
          message: `Vous avez atteint votre limite de ${FREE_PLAN_LIMIT} simulations gratuites ce mois-ci.`,
          upgradeUrl: '/pricing?from=quota',
        },
        { status: 403 }
      );
    }
    
    // Si on peut encore simuler, retourner OK (sans incrémenter ici)
    // L'incrémentation se fera après la simulation réussie
    return NextResponse.json({
      allowed: true,
      plan: 'free',
      current: currentCount,
      limit: FREE_PLAN_LIMIT,
      remaining: FREE_PLAN_LIMIT - currentCount,
    });
    
  } catch (error: any) {
    console.error('Erreur check quota:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * GET: Récupérer le statut du quota (sans incrémenter)
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 401 }
      );
    }
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }
    
    const userId = user.id;
    const plan = await getUserPlanServer(userId, user.user_metadata);
    
    if (plan === 'pro' || plan === 'premium') {
      return NextResponse.json({
        plan,
        unlimited: true,
        current: 0,
        limit: null,
      });
    }
    
    // Free: récupérer le compteur
    const { data: countData } = await supabaseAdmin
      .rpc('get_simulation_count', { p_user_id: userId });
    
    const currentCount = countData || 0;
    
    return NextResponse.json({
      plan: 'free',
      unlimited: false,
      current: currentCount,
      limit: FREE_PLAN_LIMIT,
      remaining: Math.max(0, FREE_PLAN_LIMIT - currentCount),
      percentage: Math.round((currentCount / FREE_PLAN_LIMIT) * 100),
    });
    
  } catch (error: any) {
    console.error('Erreur get quota:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

