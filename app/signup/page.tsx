'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      }
    };
    checkSession();
  }, [router]);

  // Écouter les changements d'authentification
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setSuccessMessage('Inscription réussie...');
          // Petit délai pour afficher le message
          setTimeout(() => {
            router.push('/dashboard');
          }, 500);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Le message de succès sera affiché via onAuthStateChange si l'email n'est pas confirmé
      // Sinon, la redirection se fera automatiquement
      setSuccessMessage('Inscription réussie...');
      
      // Vérifier si la session est créée immédiatement (email confirmé automatiquement)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      } else {
        // Si l'email doit être confirmé, afficher un message
        setSuccessMessage('Vérifiez votre email pour confirmer votre compte.');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'inscription.');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 transition-opacity duration-700 ease-in-out"
      style={{ 
        backgroundColor: '#0f1117',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}
    >
      <div 
        className="w-full max-w-md rounded-xl shadow-2xl p-8"
        style={{ backgroundColor: '#1a1d24' }}
      >
        <h1 className="text-2xl font-semibold text-white mb-6 text-center">
          Inscription
        </h1>

        {error && (
          <div 
            className="mb-4 p-3 rounded-lg text-sm text-red-400"
            style={{ backgroundColor: '#2d1b1b', border: '1px solid #ef4444' }}
          >
            {error}
          </div>
        )}

        {successMessage && (
          <div 
            className="mb-4 p-3 rounded-lg text-sm text-green-400"
            style={{ backgroundColor: '#1b2d1b', border: '1px solid #10b981' }}
          >
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg text-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              style={{ 
                backgroundColor: '#23272f',
                border: '1px solid #2d3441'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#2d3441';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2.5 rounded-lg text-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              style={{ 
                backgroundColor: '#23272f',
                border: '1px solid #2d3441'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#2d3441';
                e.target.style.boxShadow = 'none';
              }}
            />
            <p className="mt-1 text-xs text-gray-400">
              Minimum 6 caractères
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 rounded-lg text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: loading 
                ? '#374151'
                : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              boxShadow: loading 
                ? 'none'
                : '0 4px 15px rgba(59, 130, 246, 0.3)'
            }}
          >
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}



