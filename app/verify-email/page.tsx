import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabaseService';

interface VerifyEmailPageProps {
  searchParams: {
    token?: string;
    user?: string;
  };
}

async function verifyToken(userId: string, token: string) {
  const supabase = createServiceClient();

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('email, email_verification_token, email_verification_sent_at, email_verified')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return { success: false, reason: 'Profil introuvable.' };
  }

  if (!profile.email_verification_token || profile.email_verification_token !== token) {
    return { success: false, reason: 'Lien invalide ou déjà utilisé.' };
  }

  // Optionnel : vérifier expiration (48h)
  if (profile.email_verification_sent_at) {
    const sentAt = new Date(profile.email_verification_sent_at).getTime();
    const now = Date.now();
    const fortyEightHours = 48 * 60 * 60 * 1000;
    if (now - sentAt > fortyEightHours) {
      return { success: false, reason: 'Ce lien a expiré. Demande un nouvel email de vérification.' };
    }
  }

  const updates = {
    email_verified: true,
    email_verification_token: null,
    email_verification_sent_at: null,
  };

  const { error: updateError } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId);

  if (updateError) {
    return { success: false, reason: 'Impossible de mettre à jour le profil.' };
  }

  // Mettre à jour le statut dans auth.users
  await supabase.auth.admin.updateUserById(userId, {
    email_confirm: true,
  });

  return { success: true };
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const token = searchParams.token;
  const userId = searchParams.user;

  if (!token || !userId) {
    redirect('/signup');
  }

  const result = await verifyToken(userId, token);

  if (!result.success) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-slate-950 text-white">
        <div className="max-w-md w-full text-center space-y-6 bg-slate-900/60 border border-slate-800 rounded-3xl p-10 shadow-xl">
          <h1 className="text-2xl font-semibold">Lien invalide</h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            {result.reason || "Ce lien de vérification n'est plus valide."}
          </p>
          <div className="pt-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl font-medium bg-blue-500 hover:bg-blue-600 transition"
            >
              Retour à l'inscription
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-slate-950 text-white">
      <div className="max-w-md w-full text-center space-y-6 bg-slate-900/60 border border-slate-800 rounded-3xl p-10 shadow-xl">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
          <span className="text-3xl">✅</span>
        </div>
        <h1 className="text-2xl font-semibold">Email confirmé avec succès</h1>
        <p className="text-slate-300 text-sm leading-relaxed">
          Merci d'avoir confirmé ton adresse email. Ton compte est maintenant actif.
        </p>
        <div className="pt-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-5 py-3 rounded-xl font-medium bg-blue-500 hover:bg-blue-600 transition"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </main>
  );
}

