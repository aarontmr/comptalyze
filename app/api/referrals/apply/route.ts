import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { userId, referralCode } = await req.json();

    if (!userId || !referralCode) {
      return NextResponse.json(
        { error: 'userId et referralCode requis' },
        { status: 400 }
      );
    }

    // Vérifier que le code de parrainage existe et récupérer le parrain
    const { data: referral, error: referralError } = await supabaseAdmin
      .from('referrals')
      .select('id, referrer_id, referral_code')
      .eq('referral_code', referralCode)
      .single();

    if (referralError || !referral) {
      console.error('Code de parrainage invalide:', referralCode);
      return NextResponse.json(
        { error: 'Code de parrainage invalide' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur ne se parraine pas lui-même
    if (referral.referrer_id === userId) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas utiliser votre propre code de parrainage' },
        { status: 400 }
      );
    }

    // Vérifier si ce code a déjà été utilisé par cet utilisateur
    const { data: existing } = await supabaseAdmin
      .from('referrals')
      .select('id')
      .eq('referral_code', referralCode)
      .eq('referred_id', userId)
      .single();

    if (existing) {
      // Le parrainage existe déjà, on ne fait rien
      return NextResponse.json({ 
        success: true, 
        message: 'Code de parrainage déjà appliqué' 
      });
    }

    // Créer un nouvel enregistrement de parrainage
    // Le statut reste "pending" jusqu'à ce que le filleul s'abonne
    const { error: insertError } = await supabaseAdmin
      .from('referrals')
      .insert({
        referrer_id: referral.referrer_id,
        referred_id: userId,
        referral_code: referralCode,
        status: 'pending',
      });

    if (insertError) {
      console.error('Erreur lors de la création du parrainage:', insertError);
      return NextResponse.json(
        { error: 'Erreur lors de la création du parrainage' },
        { status: 500 }
      );
    }

    console.log(`✅ Parrainage créé: ${referral.referrer_id} a parrainé ${userId} avec le code ${referralCode}`);

    return NextResponse.json({
      success: true,
      message: 'Code de parrainage appliqué avec succès',
    });
  } catch (error: any) {
    console.error('Erreur dans /api/referrals/apply:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

