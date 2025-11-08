import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const returnUrl = searchParams.get('return') || '/dashboard';

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    }

    // Vérifier si les credentials Shopify sont configurées
    const shopifyClientId = process.env.SHOPIFY_CLIENT_ID;
    const shopifyRedirectUri = process.env.SHOPIFY_REDIRECT_URI;

    if (!shopifyClientId || !shopifyRedirectUri) {
      console.warn('⚠️ Variables Shopify non configurées');
      // En mode démo, simuler une connexion
      return NextResponse.redirect(new URL(`${returnUrl}?shopify=demo`, request.url));
    }

    // Générer un state pour CSRF protection
    const state = Buffer.from(JSON.stringify({ userId, returnUrl })).toString('base64');

    // Redirection vers Shopify OAuth
    // Note: L'utilisateur doit d'abord entrer son shop domain
    // Nous allons rediriger vers une page intermédiaire
    return NextResponse.redirect(
      new URL(
        `/dashboard/integrations/shopify-auth?state=${state}`,
        request.url
      )
    );
  } catch (error) {
    console.error('Erreur Shopify connect:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

