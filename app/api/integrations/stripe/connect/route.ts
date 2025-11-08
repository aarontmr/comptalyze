import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const returnUrl = searchParams.get('return') || '/dashboard';

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    }

    // Vérifier si les credentials Stripe sont configurées
    const stripeClientId = process.env.STRIPE_CONNECT_CLIENT_ID;
    const stripeRedirectUri = process.env.STRIPE_REDIRECT_URI;

    if (!stripeClientId || !stripeRedirectUri) {
      console.warn('⚠️ Variables Stripe Connect non configurées');
      // En mode démo, simuler une connexion
      return NextResponse.redirect(new URL(`${returnUrl}?stripe=demo`, request.url));
    }

    // Générer un state pour CSRF protection
    const state = Buffer.from(JSON.stringify({ userId, returnUrl })).toString('base64');

    // URL d'autorisation Stripe Connect
    const authUrl = new URL('https://connect.stripe.com/oauth/authorize');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', stripeClientId);
    authUrl.searchParams.set('scope', 'read_only');
    authUrl.searchParams.set('redirect_uri', stripeRedirectUri);
    authUrl.searchParams.set('state', state);

    // Rediriger vers Stripe Connect
    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error('Erreur Stripe connect:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

