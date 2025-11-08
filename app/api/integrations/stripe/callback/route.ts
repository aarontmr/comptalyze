import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { encrypt } from '@/lib/encryption';
import Stripe from 'stripe';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    // Décoder le state
    const { userId, returnUrl } = JSON.parse(Buffer.from(state, 'base64').toString());

    // Échanger le code contre un access token
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY non configurée');
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-10-29.clover' });

    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code,
    });

    const { access_token, refresh_token, stripe_user_id } = response;

    // Chiffrer et sauvegarder les tokens
    const encryptedAccessToken = encrypt(access_token);
    const encryptedRefreshToken = refresh_token ? encrypt(refresh_token) : null;

    const { error: dbError } = await supabase
      .from('integration_tokens')
      .upsert({
        user_id: userId,
        provider: 'stripe',
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        stripe_account_id: stripe_user_id,
        is_active: true,
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,provider'
      });

    if (dbError) {
      throw dbError;
    }

    // Log de succès
    await supabase.from('sync_logs').insert({
      user_id: userId,
      provider: 'stripe',
      sync_type: 'manual',
      status: 'success',
      records_synced: 0,
      metadata: { event: 'connection_success', account_id: stripe_user_id },
    });

    // Rediriger avec succès
    return NextResponse.redirect(new URL(`${returnUrl}?stripe=connected`, request.url));
  } catch (error: any) {
    console.error('Erreur Stripe callback:', error);
    return NextResponse.redirect(
      new URL(`/dashboard?error=stripe_connection_failed&message=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}

