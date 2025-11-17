'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import logo from '@/public/logo.png';
import { Mail, Lock, ArrowRight, Shield } from 'lucide-react';

export default function LoginPage() {
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
      if (!session) return;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('email_verified')
        .eq('id', session.user.id)
        .single();

      const emailVerified =
        !!session.user.email_confirmed_at || !!profile?.email_verified;

      if (!emailVerified) {
        await supabase.auth.signOut();
        router.push('/verify-email-sent');
        return;
      }

      router.push('/dashboard');
    };
    checkSession();
  }, [router]);

  // Écouter les changements d'authentification
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Pour les connexions OAuth (Google), l'email est automatiquement vérifié
          const emailVerified = !!session.user.email_confirmed_at || 
            session.user.app_metadata?.provider === 'google';

          if (!emailVerified) {
            // Vérifier si un profil existe
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('email_verified')
              .eq('id', session.user.id)
              .single();

            const isEmailVerified = emailVerified || !!profile?.email_verified;

            if (!isEmailVerified) {
              await supabase.auth.signOut();
              router.push('/verify-email-sent');
              return;
            }
          }

          setSuccessMessage('Connexion réussie...');
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

  // Gérer la redirection après OAuth
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      }
    };

    // Vérifier si on revient d'une redirection OAuth
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('code') || urlParams.get('access_token')) {
      handleOAuthCallback();
    }
  }, [router]);

  const handleGoogleLogin = async () => {
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (err: any) {
      console.error('Erreur de connexion Google:', err);
      setError(err.message || 'Une erreur est survenue lors de la connexion avec Google.');
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      // Procéder directement à la connexion Supabase sans vérifier le rate-limiting
      // pour éviter les problèmes de connectivité réseau sur mobile
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Messages d'erreur plus explicites
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou mot de passe incorrect. Veuillez vérifier vos identifiants.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Veuillez confirmer votre adresse email avant de vous connecter.');
        } else if (error.message.includes('network')) {
          throw new Error('Problème de connexion réseau. Vérifiez votre connexion internet.');
        } else {
          throw error;
        }
      }

      if (!data.session) {
        throw new Error('Impossible de créer une session. Veuillez réessayer.');
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('email_verified')
        .eq('id', data.session.user.id)
        .single();

      const emailVerified =
        !!data.session.user.email_confirmed_at || !!profile?.email_verified;

      if (!emailVerified) {
        await supabase.auth.signOut();
        setSuccessMessage(
          'Connexion réussie. Merci de confirmer votre email pour accéder à votre compte.'
        );
        setLoading(false);
        router.push('/verify-email-sent');
        return;
      }

      setSuccessMessage('Connexion réussie...');
      
      // Log de rate-limiting après une connexion réussie (en arrière-plan)
      try {
        await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: '***' }),
        }).catch(() => {
          // Ignorer les erreurs de logging
        });
      } catch (logError) {
        // Ignorer les erreurs de logging
      }
    } catch (err: any) {
      console.error('Erreur de connexion:', err);
      
      // Message d'erreur plus explicite
      let errorMessage = err.message || 'Une erreur est survenue lors de la connexion.';
      
      // Détecter les erreurs de connectivité
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Load failed') || errorMessage.includes('NetworkError')) {
        errorMessage = '🌐 Problème de connexion. Vérifiez votre connexion internet et réessayez.';
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4"
      style={{ 
        backgroundColor: '#0e0f12',
        fontFamily: 'Poppins, sans-serif'
      }}
    >
      {/* Background gradient accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(closest-side, #00D084, rgba(0,0,0,0))" }}
        />
        <div 
          className="absolute top-1/3 -right-24 h-[500px] w-[500px] rounded-full blur-3xl opacity-15"
          style={{ background: "radial-gradient(closest-side, #2E6CF6, rgba(0,0,0,0))" }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center">
            <Image
              src={logo}
              alt="Comptalyze"
              width={160}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Card */}
        <div 
          className="rounded-2xl p-8 shadow-2xl relative"
          style={{ 
            backgroundColor: '#14161b',
            border: '1px solid rgba(46, 108, 246, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Gradient accent line */}
          <div 
            className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
            style={{
              background: "linear-gradient(90deg, #00D084 0%, #2E6CF6 100%)",
            }}
          />

          <h1 className="text-2xl font-semibold text-white mb-2 text-center">
            Connexion
          </h1>
          <p className="text-sm text-gray-400 text-center mb-6">
            Accédez à votre tableau de bord
          </p>

          {error && (
            <div 
              className="mb-4 p-4 rounded-lg text-sm text-red-300 flex items-start gap-2"
              style={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                border: '1px solid rgba(239, 68, 68, 0.3)' 
              }}
            >
              <span className="text-red-400">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div 
              className="mb-4 p-4 rounded-lg text-sm text-green-300 flex items-start gap-2"
              style={{ 
                backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                border: '1px solid rgba(16, 185, 129, 0.3)' 
              }}
            >
              <span className="text-green-400">✓</span>
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="votre@email.com"
                  className="w-full pl-12 pr-4 py-3 rounded-lg text-white placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 relative z-0"
                  style={{ 
                    backgroundColor: '#0e0f12',
                    border: '1px solid #2d3441',
                    fontSize: '16px',
                    WebkitAppearance: 'none',
                  }}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 rounded-lg text-white placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 relative z-0"
                  style={{ 
                    backgroundColor: '#0e0f12',
                    border: '1px solid #2d3441',
                    fontSize: '16px',
                    WebkitAppearance: 'none',
                  }}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.05] hover:brightness-110 hover:shadow-2xl cursor-pointer active:scale-95 disabled:hover:scale-100 disabled:hover:brightness-100 flex items-center justify-center gap-2"
              style={{
                background: loading 
                  ? '#374151'
                  : 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
                boxShadow: loading 
                  ? 'none'
                  : '0 4px 20px rgba(46, 108, 246, 0.4)'
              }}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connexion...</span>
                </>
              ) : (
                <>
                  <span>Se connecter</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Séparateur */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: '1px solid #1f232b' }} />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 text-gray-500 bg-[#14161b]">ou</span>
            </div>
          </div>

          {/* Bouton Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full px-4 py-3 rounded-lg text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] hover:brightness-110 active:scale-95 flex items-center justify-center gap-3"
            style={{
              backgroundColor: '#0e0f12',
              border: '1px solid #2d3441',
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continuer avec Google</span>
          </button>

          <div className="mt-6 pt-6 border-t" style={{ borderColor: '#1f232b' }}>
            <p className="text-center text-sm text-gray-400">
              Pas encore de compte ?{' '}
              <Link 
                href="/signup" 
                className="font-medium text-transparent bg-clip-text hover:opacity-80 transition-opacity"
                style={{
                  backgroundImage: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)"
                }}
              >
                S'inscrire
              </Link>
            </p>
          </div>

          {/* Trust badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
            <Shield className="w-4 h-4" style={{ color: '#00D084' }} />
            <span>Basé sur les données officielles de l'URSSAF</span>
          </div>
        </div>
      </div>
    </div>
  );
}
