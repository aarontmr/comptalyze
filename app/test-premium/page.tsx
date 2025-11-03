'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function TestPremiumPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const activatePremium = async () => {
    if (!email) {
      setError('Veuillez entrer votre email');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/set-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erreur lors de l\'activation');
        return;
      }

      setResult(data);
      
      // Forcer le rechargement de la session si l'utilisateur est connecté
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email === email) {
          // Forcer le refresh de la session pour charger les nouvelles métadonnées
          await supabase.auth.refreshSession();
        }
      } catch (refreshError) {
        console.warn('Impossible de rafraîchir la session:', refreshError);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const checkCurrentUser = async () => {
    setChecking(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setEmail(session.user.email || '');
        // Vérifier le statut Premium via l'API
        checkPremiumStatus(session.user.email || '');
      } else {
        setError('Aucun utilisateur connecté');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la vérification');
    } finally {
      setChecking(false);
    }
  };

  const checkPremiumStatus = async (emailToCheck: string) => {
    try {
      const response = await fetch('/api/admin/check-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToCheck }),
      });

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la vérification');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#0e0f12' }}
    >
      <div
        className="max-w-md w-full p-6 rounded-xl"
        style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}
      >
        <h1 className="text-2xl font-semibold text-white mb-6">Activer Premium (Test)</h1>

        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={checkCurrentUser}
              disabled={checking}
              className="flex-1 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-300 disabled:opacity-50"
              style={{ backgroundColor: '#374151' }}
            >
              {checking ? 'Vérification...' : 'Remplir email'}
            </button>
            {email && (
              <button
                onClick={() => checkPremiumStatus(email)}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-300 disabled:opacity-50"
                style={{ backgroundColor: '#2E6CF6' }}
              >
                Vérifier statut
              </button>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="w-full px-4 py-2.5 rounded-lg text-white placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              style={{
                backgroundColor: '#23272f',
                border: '1px solid #2d3441',
              }}
            />
          </div>

          <button
            onClick={activatePremium}
            disabled={loading || !email}
            className="w-full px-4 py-2.5 rounded-lg text-white font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            style={{
              background: loading || !email
                ? '#374151'
                : 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
              boxShadow: loading || !email
                ? 'none'
                : '0 4px 15px rgba(46,108,246,0.3)',
            }}
          >
            {loading ? 'Activation...' : 'Activer Premium'}
          </button>

          {error && (
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {result && (
            <div
              className="p-3 rounded-lg space-y-2"
              style={{ 
                backgroundColor: result.success || result.analysis?.shouldBePremium 
                  ? 'rgba(0,208,132,0.1)' 
                  : 'rgba(239,68,68,0.1)',
                border: `1px solid ${result.success || result.analysis?.shouldBePremium ? 'rgba(0,208,132,0.3)' : 'rgba(239,68,68,0.3)'}`
              }}
            >
              {result.success ? (
                <>
                  <p className="text-sm text-green-400 font-semibold">✅ Premium activé avec succès !</p>
                  {result.user?.metadata && (
                    <div className="text-xs text-gray-300">
                      <p className="mb-1">Métadonnées actuelles :</p>
                      <pre className="bg-black bg-opacity-30 p-2 rounded text-xs overflow-auto max-h-32">
                        {JSON.stringify(result.user.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </>
              ) : result.analysis ? (
                <>
                  <p className={`text-sm font-semibold ${result.analysis.shouldBePremium ? 'text-green-400' : 'text-red-400'}`}>
                    {result.analysis.shouldBePremium ? '✅ Premium est activé' : '❌ Premium n\'est pas activé'}
                  </p>
                  <div className="text-xs text-gray-300 space-y-1">
                    <p><strong>Métadonnées :</strong></p>
                    <pre className="bg-black bg-opacity-30 p-2 rounded text-xs overflow-auto max-h-32">
                      {JSON.stringify(result.metadata, null, 2)}
                    </pre>
                    {result.subscription && (
                      <>
                        <p className="mt-2"><strong>Abonnement :</strong></p>
                        <pre className="bg-black bg-opacity-30 p-2 rounded text-xs overflow-auto">
                          {JSON.stringify(result.subscription, null, 2)}
                        </pre>
                      </>
                    )}
                    <p className="mt-2 text-yellow-400">{result.analysis.recommendation}</p>
                  </div>
                </>
              ) : null}
              
              <div className="pt-2 border-t" style={{ borderColor: result.success || result.analysis?.shouldBePremium ? 'rgba(0,208,132,0.3)' : 'rgba(239,68,68,0.3)' }}>
                <p className="text-xs text-gray-400 mb-2">
                  ⚠️ <strong>Important :</strong> Pour que les changements prennent effet :
                </p>
                <ol className="text-xs text-gray-400 list-decimal list-inside space-y-1">
                  <li>Déconnectez-vous complètement de l'application</li>
                  <li>Fermez complètement l'onglet du navigateur (F12 → Application → Clear storage)</li>
                  <li>Reconnectez-vous</li>
                  <li>Les fonctionnalités Premium devraient maintenant être visibles</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t" style={{ borderColor: '#2d3441' }}>
          <p className="text-xs text-gray-500">
            ⚠️ Cette page est pour les tests uniquement. En production, protégez cette route.
          </p>
        </div>
      </div>
    </div>
  );
}

