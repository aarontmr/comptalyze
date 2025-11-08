import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { encrypt } from '@/lib/encryption';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const shop = searchParams.get('shop');

    if (!code || !state || !shop) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    // Décoder le state
    const { userId, returnUrl } = JSON.parse(Buffer.from(state, 'base64').toString());

    // Échanger le code contre un access token
    const shopifyClientId = process.env.SHOPIFY_CLIENT_ID;
    const shopifyClientSecret = process.env.SHOPIFY_CLIENT_SECRET;

    if (!shopifyClientId || !shopifyClientSecret) {
      throw new Error('Credentials Shopify non configurées');
    }

    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: shopifyClientId,
        client_secret: shopifyClientSecret,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Échec récupération token Shopify');
    }

    const { access_token } = await tokenResponse.json();

    // Chiffrer et sauvegarder le token
    const encryptedToken = encrypt(access_token);

    const { error: dbError } = await supabase
      .from('integration_tokens')
      .upsert({
        user_id: userId,
        provider: 'shopify',
        access_token: encryptedToken,
        shop_domain: shop,
        store_url: `https://${shop}`,
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
      provider: 'shopify',
      sync_type: 'manual',
      status: 'success',
      records_synced: 0,
      metadata: { event: 'connection_success' },
    });

    // Rediriger avec succès
    return NextResponse.redirect(new URL(`${returnUrl}?shopify=connected`, request.url));
  } catch (error: any) {
    console.error('Erreur Shopify callback:', error);
    return NextResponse.redirect(
      new URL(`/dashboard?error=shopify_connection_failed&message=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}

