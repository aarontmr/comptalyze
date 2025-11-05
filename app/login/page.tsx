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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setSuccessMessage('Connexion réussie...');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la connexion.');
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
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="votre@email.com"
                  className="w-full pl-12 pr-4 py-3 rounded-lg text-white placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: '#0e0f12',
                    border: '1px solid #2d3441'
                  }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 rounded-lg text-white placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: '#0e0f12',
                    border: '1px solid #2d3441'
                  }}
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
