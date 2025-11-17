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
    const { code } = await req.json();

    if (!code || code.length !== 6) {
      return NextResponse.json({ error: 'Code invalide' }, { status: 400 });
    }

    // Récupérer le secret depuis la base de données
    const { data: securityData, error: fetchError } = await supabaseAdmin
      .from('user_security')
      .select('two_factor_secret, backup_codes')
      .eq('user_id', userId)
      .single();

    if (fetchError || !securityData?.two_factor_secret) {
      return NextResponse.json({ error: 'Secret 2FA non trouvé' }, { status: 404 });
    }

    // Vérifier le code TOTP
    const verified = speakeasy.totp.verify({
      secret: securityData.two_factor_secret,
      encoding: 'base32',
      token: code,
      window: 2, // Accepter les codes dans une fenêtre de ±2 périodes (60 secondes)
    });

    if (!verified) {
      // Vérifier si c'est un code de secours
      const backupCodes = (securityData.backup_codes as string[]) || [];
      const isBackupCode = backupCodes.includes(code);

      if (!isBackupCode) {
        return NextResponse.json({ error: 'Code invalide' }, { status: 400 });
      }

      // Retirer le code de secours utilisé
      const updatedBackupCodes = backupCodes.filter(c => c !== code);
      await supabaseAdmin
        .from('user_security')
        .update({ backup_codes: updatedBackupCodes })
        .eq('user_id', userId);
    }

    // Générer des codes de secours
    const backupCodes = Array.from({ length: 8 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    // Activer la 2FA
    const { error: updateError } = await supabaseAdmin
      .from('user_security')
      .update({
        two_factor_enabled: true,
        backup_codes: backupCodes,
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Erreur lors de l\'activation de la 2FA:', updateError);
      return NextResponse.json({ error: 'Erreur lors de l\'activation' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      backupCodes,
    });
  } catch (error: any) {
    console.error('Erreur lors de la vérification du code 2FA:', error);
    return NextResponse.json({ error: 'Erreur lors de la vérification' }, { status: 500 });
  }
}





