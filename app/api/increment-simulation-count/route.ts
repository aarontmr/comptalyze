/**
 * Route pour incrémenter le compteur de simulations
 * À appeler APRÈS une simulation réussie
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
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
    
    // Incrémenter le compteur
    const { data, error } = await supabaseAdmin
      .rpc('increment_simulation_count', { p_user_id: userId });
    
    if (error) {
      console.error('Erreur increment:', error);
      return NextResponse.json(
        { error: 'Erreur incrémentation' },
        { status: 500 }
      );
    }
    
    const result = data?.[0];
    
    return NextResponse.json({
      success: true,
      count: result?.new_count || 0,
      isAtLimit: result?.is_at_limit || false,
    });
    
  } catch (error: any) {
    console.error('Erreur increment:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

