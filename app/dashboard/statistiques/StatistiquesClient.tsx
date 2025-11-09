'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';

interface StatistiquesClientProps {
  userId: string;
}

export function StatistiquesClient({ userId }: StatistiquesClientProps) {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdvice = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer le token d'authentification
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          setError('Session non disponible');
          return;
        }

        // Appeler l'API d'analyse IA
        const response = await fetch('/api/ai/advice', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération du conseil');
        }

        const data = await response.json();
        setAdvice(data.advice || 'Aucun conseil disponible pour le moment.');
      } catch (err: any) {
        console.error('Erreur:', err);
        setError(err.message || 'Une erreur est survenue');
        setAdvice('Analysez régulièrement vos enregistrements pour suivre l\'évolution de vos cotisations URSSAF.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAdvice();
    }
  }, [userId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1 }}
      className="rounded-2xl p-6"
      style={{
        backgroundColor: '#16181d',
        border: '1px solid rgba(45, 52, 65, 0.5)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="p-2 rounded-lg"
          style={{
            backgroundColor: 'rgba(0, 208, 132, 0.1)',
          }}
        >
          <Sparkles className="w-5 h-5" style={{ color: '#00D084' }} />
        </div>
        <h3 className="text-xl font-semibold text-white">Analyse IA personnalisée</h3>
      </div>

      <div
        className="rounded-lg p-6"
        style={{
          backgroundColor: '#23272f',
          border: '1px solid #2d3441',
          borderLeft: '4px solid',
          borderImage: 'linear-gradient(180deg, #00D084, #2E6CF6) 1',
        }}
      >
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#00D084' }} />
            <span className="ml-3 text-gray-400">Génération de l'analyse...</span>
          </div>
        )}

        {error && !advice && (
          <div className="text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        {advice && !loading && (
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {advice}
          </p>
        )}
      </div>
    </motion.div>
  );
}














