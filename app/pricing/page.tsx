'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function PricingPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setLoading(false);
  };

  const handleCheckout = async (plan: 'free' | 'pro') => {
    if (plan === 'free') {
      router.push('/');
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: 'pro', userId: user.id }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Une erreur est survenue lors du traitement du paiement.');
    }
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#0f1117' }}
      >
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center py-12 px-4"
        style={{ backgroundColor: '#0f1117' }}
      >
        <div 
          className="w-full max-w-md rounded-xl shadow-2xl p-8 text-center"
          style={{ backgroundColor: '#1a1d24' }}
        >
          <h2 className="text-xl font-semibold text-white mb-4">
            Connexion requise
          </h2>
          <p className="text-gray-400 mb-6">
            Vous devez être connecté pour voir les tarifs.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 transform hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
            }}
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen py-12 px-4"
      style={{ 
        backgroundColor: '#0f1117',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}
    >
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-3xl font-semibold text-white mb-4">
            Tarifs Comptalyze
          </h1>
          <p className="text-gray-400">
            Choisissez le plan qui vous convient
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <div 
            className="rounded-xl shadow-2xl p-8"
            style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}
          >
            <h2 className="text-2xl font-semibold text-white mb-2">Gratuit</h2>
            <div className="mb-4">
              <span className="text-4xl font-bold text-white">0€</span>
              <span className="text-gray-400">/mois</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start text-gray-300">
                <span className="mr-2 text-green-400">✓</span>
                <span>3 simulations par mois</span>
              </li>
              <li className="flex items-start text-gray-300">
                <span className="mr-2 text-green-400">✓</span>
                <span>Historique limité</span>
              </li>
              <li className="flex items-start text-gray-300">
                <span className="mr-2 text-green-400">✓</span>
                <span>Calculs URSSAF</span>
              </li>
            </ul>
            <button
              onClick={() => handleCheckout('free')}
              className="w-full px-4 py-2.5 rounded-lg text-white font-medium transition-all duration-300 border-2"
              style={{
                borderColor: '#2d3441',
                backgroundColor: '#23272f',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2d3441';
              }}
            >
              Plan actuel
            </button>
          </div>

          {/* Pro Plan */}
          <div 
            className="rounded-xl shadow-2xl p-8 relative"
            style={{ 
              backgroundColor: '#1a1d24',
              border: '2px solid #3b82f6',
              boxShadow: '0 8px 30px rgba(59, 130, 246, 0.2)'
            }}
          >
            <div 
              className="absolute top-0 right-0 px-3 py-1 rounded-bl-lg text-xs font-semibold text-white"
              style={{ backgroundColor: '#3b82f6' }}
            >
              Recommandé
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">Pro</h2>
            <div className="mb-4">
              <span className="text-4xl font-bold text-white">5€</span>
              <span className="text-gray-400">/mois</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start text-gray-300">
                <span className="mr-2 text-green-400">✓</span>
                <span>Simulations illimitées</span>
              </li>
              <li className="flex items-start text-gray-300">
                <span className="mr-2 text-green-400">✓</span>
                <span>Historique complet</span>
              </li>
              <li className="flex items-start text-gray-300">
                <span className="mr-2 text-green-400">✓</span>
                <span>Tous les calculs URSSAF</span>
              </li>
              <li className="flex items-start text-gray-300">
                <span className="mr-2 text-green-400">✓</span>
                <span>Support prioritaire</span>
              </li>
            </ul>
            <button
              onClick={() => handleCheckout('pro')}
              className="w-full px-4 py-2.5 rounded-lg text-white font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
              }}
            >
              Passer à Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

