'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface PremiumAdviceProps {
  userId: string;
}

export default function PremiumAdvice({ userId }: PremiumAdviceProps) {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAdvice();
  }, [userId]);

  const loadAdvice = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer le token d'accès
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/ai/advice', { headers });
      
      // Vérifier que la réponse est bien du JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Réponse non-JSON reçue:', text.substring(0, 200));
        throw new Error('La réponse du serveur n\'est pas au format JSON. Vérifiez que l\'API fonctionne correctement.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du chargement du conseil');
      }

      if (!data.advice) {
        throw new Error('Aucun conseil retourné par l\'API');
      }

      setAdvice(data.advice);
    } catch (err: any) {
      console.error('Erreur lors du chargement du conseil IA:', err);
      setError(err.message || 'Erreur lors du chargement du conseil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="p-6 rounded-xl relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(0,208,132,0.1) 0%, rgba(46,108,246,0.1) 100%)',
        border: '1px solid rgba(46,108,246,0.3)',
      }}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">
            <span className="inline-block mr-2">✨</span>
            Conseil IA (Premium)
          </h3>
          <button
            onClick={loadAdvice}
            disabled={loading}
            className="text-xs text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            {loading ? 'Chargement...' : 'Actualiser'}
          </button>
        </div>

        {loading && !advice && (
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded animate-pulse" style={{ width: '100%' }}></div>
            <div className="h-4 bg-gray-700 rounded animate-pulse" style={{ width: '80%' }}></div>
            <div className="h-4 bg-gray-700 rounded animate-pulse" style={{ width: '90%' }}></div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={loadAdvice}
              className="mt-2 text-xs text-red-300 hover:text-red-200 underline"
            >
              Réessayer
            </button>
          </div>
        )}

        {advice && !loading && (
          <p className="text-sm text-gray-300 leading-relaxed">{advice}</p>
        )}
      </div>
    </div>
  );
}

