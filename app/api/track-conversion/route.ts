import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * API route pour tracker les conversions Google Ads
 * POST /api/track-conversion
 * Body: { userId, eventType: 'free_signup' | 'upgrade_to_pro' | 'upgrade_to_premium', utmParams }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, eventType, utmParams } = body;

    if (!userId || !eventType) {
      return NextResponse.json({ error: 'userId et eventType requis' }, { status: 400 });
    }

    // Vérifier si c'est une conversion Google Ads
    const isGoogleAds = utmParams?.utm_source === 'google' || utmParams?.utm_medium === 'cpc';

    if (!isGoogleAds) {
      // Pas une conversion Google Ads, on peut quand même tracker mais sans priorité
      return NextResponse.json({ tracked: false, reason: 'not_google_ads' });
    }

    // Stocker l'attribution marketing dans user_profiles ou une table dédiée
    // Pour l'instant, on utilise la table analytics_events existante
    const conversionData = {
      event_name: `google_ads_${eventType}`,
      user_id: userId,
      utm_source: utmParams?.utm_source || null,
      utm_medium: utmParams?.utm_medium || null,
      utm_campaign: utmParams?.utm_campaign || null,
      utm_term: utmParams?.utm_term || null,
      utm_content: utmParams?.utm_content || null,
      metadata: {
        eventType,
        isGoogleAds: true,
        timestamp: new Date().toISOString(),
      },
      page_path: '/signup',
    };

    const { error } = await supabaseAdmin
      .from('analytics_events')
      .insert([conversionData]);

    if (error) {
      console.error('Erreur lors du tracking de conversion:', error);
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    // Mettre à jour user_profiles avec l'attribution si la table existe
    try {
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .upsert({
          user_id: userId,
          marketing_source: utmParams?.utm_source || null,
          marketing_campaign: utmParams?.utm_campaign || null,
          first_conversion_event: eventType,
          first_conversion_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 = table n'existe pas, ce n'est pas grave
        console.warn('Erreur lors de la mise à jour du profil:', profileError);
      }
    } catch (profileErr) {
      // Table user_profiles peut ne pas exister, ce n'est pas bloquant
      console.warn('Table user_profiles non disponible:', profileErr);
    }

    return NextResponse.json({ tracked: true, eventType, isGoogleAds: true });
  } catch (error: any) {
    console.error('Erreur dans track-conversion:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}



