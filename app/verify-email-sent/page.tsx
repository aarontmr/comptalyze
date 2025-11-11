'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function VerifyEmailSentPage() {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    setSending(true);
    setMessage(null);
    setError(null);

    try {
      const { data: { session }, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !session) {
        setError('Session expirée. Merci de vous reconnecter.');
        router.push('/login');
        return;
      }

      const response = await fetch('/api/auth/send-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          email: session.user.email,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(
          data?.error || "Impossible d'envoyer l'email pour le moment."
        );
        return;
      }

      setMessage('Email de vérification renvoyé. Vérifie ta boîte de réception.');
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue. Merci d'essayer à nouveau.");
    } finally {
      setSending(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-slate-950 text-white">
      <div className="max-w-md w-full text-center space-y-6 bg-slate-900/60 border border-slate-800 rounded-3xl p-10 shadow-xl">
        <h1 className="text-2xl font-semibold">Vérifie ton email 📬</h1>
        <p className="text-slate-300 text-sm leading-relaxed">
          Nous t'avons envoyé un email de confirmation. Clique sur le lien dans cet email pour activer ton compte.
          Pense à vérifier tes spams / courriers indésirables.
        </p>

        {message && (
          <div className="px-4 py-3 rounded-lg bg-emerald-500/15 text-emerald-200 text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-500/15 text-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3 pt-2">
          <button
            onClick={handleResend}
            disabled={sending}
            className="w-full inline-flex items-center justify-center px-5 py-3 rounded-xl font-medium bg-blue-500 hover:bg-blue-600 disabled:opacity-60 transition"
          >
            {sending ? 'Envoi en cours...' : 'Renvoyer l’email'}
          </button>
          <button
            onClick={handleLogout}
            className="text-sm text-slate-400 hover:text-white transition"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </main>
  );
}

