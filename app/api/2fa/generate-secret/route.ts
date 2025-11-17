import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import speakeasy from 'speakeasy';

export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Token d\'authentification manquant' }, { status: 401 });
    }

    // Vérifier le token avec Supabase
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 401 });
    }

    const userId = user.id;
    const userEmail = user.email || 'user@comptalyze.fr';

    // Générer un secret TOTP
    const secret = speakeasy.generateSecret({
      name: `Comptalyze (${userEmail})`,
      issuer: 'Comptalyze',
      length: 32,
    });

    // Sauvegarder le secret dans la base de données (sans activer la 2FA pour l'instant)
    const { error: dbError } = await supabaseAdmin
      .from('user_security')
      .upsert({
        user_id: userId,
        two_factor_secret: secret.base32,
        two_factor_enabled: false,
      }, {
        onConflict: 'user_id',
      });

    if (dbError) {
      console.error('Erreur lors de la sauvegarde du secret:', dbError);
      return NextResponse.json({ error: 'Erreur lors de la génération du secret' }, { status: 500 });
    }

    // Retourner l'URL du QR code (otpauth://)
    return NextResponse.json({
      secret: secret.base32,
      qrCodeUrl: secret.otpauth_url,
      manualEntryKey: secret.base32,
    });
  } catch (error: any) {
    console.error('Erreur lors de la génération du secret 2FA:', error);
    return NextResponse.json({ error: 'Erreur lors de la génération du secret' }, { status: 500 });
  }
}



