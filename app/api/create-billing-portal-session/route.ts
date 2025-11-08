/**
 * Crée une session Stripe Billing Portal
 * Permet à l'utilisateur de gérer son abonnement
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId requis' },
        { status: 400 }
      );
    }
    
    // Récupérer le stripe_customer_id de l'utilisateur
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (userError || !userData?.user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    const stripeCustomerId = userData.user.user_metadata?.stripe_customer_id;
    
    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: 'Aucun abonnement Stripe trouvé' },
        { status: 400 }
      );
    }
    
    // Créer la session du portail
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/compte`,
    });
    
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Erreur création session portail:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

