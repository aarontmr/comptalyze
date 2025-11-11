import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { createServiceClient } from '@/lib/supabaseService';
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const defaultFromEmail = process.env.EMAIL_VERIFICATION_FROM || 'Comptalyze <onboarding@resend.dev>';
const frontendUrl =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.FRONTEND_URL ||
  'https://comptalyze.com';

export async function POST(request: NextRequest) {
  if (!resendApiKey) {
    return NextResponse.json(
      { error: 'Resend API key non configurée' },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const userId = body?.userId as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: 'userId manquant' }, { status: 400 });
  }

  // Vérifier la session utilisateur (doit être connecté)
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session || session.user.id !== userId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const adminClient = createServiceClient();

  const { data: profile, error: profileError } = await adminClient
    .from('user_profiles')
    .select('email, email_verified')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    return NextResponse.json(
      { error: 'Profil utilisateur introuvable' },
      { status: 404 }
    );
  }

  const token = crypto.randomUUID();
  const sentAt = new Date().toISOString();

  const { error: updateError } = await adminClient
    .from('user_profiles')
    .update({
      email_verification_token: token,
      email_verification_sent_at: sentAt,
      email_verified: false,
    })
    .eq('id', userId);

  if (updateError) {
    return NextResponse.json(
      { error: 'Impossible de générer le token de vérification' },
      { status: 500 }
    );
  }

  const verificationLink = `${frontendUrl.replace(
    /\/$/,
    ''
  )}/verify-email?token=${encodeURIComponent(token)}&user=${encodeURIComponent(
    userId
  )}`;

  const resend = new Resend(resendApiKey);

  const targetEmail = profile.email || session.user.email;

  try {
    await resend.emails.send({
      from: defaultFromEmail,
      to: targetEmail,
      subject: 'Confirme ton adresse email',
      html: `
      <p>Bonjour 👋,</p>
      <p>Merci de rejoindre Comptalyze ! Pour activer ton compte, clique sur le bouton ci-dessous :</p>
      <p>
        <a href="${verificationLink}" style="display:inline-block;padding:12px 20px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">
          Confirmer mon email
        </a>
      </p>
      <p>Ou copie ce lien dans ton navigateur :</p>
      <p style="word-break:break-all;">${verificationLink}</p>
      <p style="font-size:12px;color:#6b7280;">Ce lien expire dans 48 heures. Si tu n'es pas à l'origine de cette inscription, ignore simplement cet email.</p>
      <p>À très vite,<br/>L'équipe Comptalyze</p>
    `,
    });
  } catch (error) {
    console.error('Erreur envoi email Resend:', error);
    return NextResponse.json(
      { error: "Impossible d'envoyer l'email de vérification." },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true });
}

