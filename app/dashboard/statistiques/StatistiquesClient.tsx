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
          setAdvice('Connectez-vous pour recevoir des conseils personnalisés basés sur votre activité.');
          setLoading(false);
          return;
        }

        // Appeler l'API d'analyse IA
        const response = await fetch('/api/ai/advice', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        // Si l'utilisateur n'est pas Premium, ne pas afficher d'erreur
        if (response.status === 403) {
          setAdvice('Cette fonctionnalité est réservée aux utilisateurs Premium. Passez à Premium pour recevoir des conseils personnalisés basés sur votre activité.');
          setLoading(false);
          return;
        }

        if (!response.ok) {
          // Essayer de récupérer le message d'erreur
          let errorMessage = 'Erreur lors de la récupération du conseil';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            // Si la réponse n'est pas du JSON, utiliser le message par défaut
          }
          setAdvice('Analysez régulièrement vos enregistrements pour suivre l\'évolution de vos cotisations URSSAF.');
          // Ne pas afficher l'erreur dans la console si c'est juste une limitation de plan
          if (response.status !== 403) {
            console.error('Erreur API:', errorMessage);
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setAdvice(data.advice || 'Analysez régulièrement vos enregistrements pour suivre l\'évolution de vos cotisations URSSAF.');
      } catch (err: any) {
        // Ne pas afficher d'erreur dans la console pour les erreurs réseau normales
        if (err.name !== 'TypeError' || !err.message.includes('fetch')) {
          console.error('Erreur:', err);
        }
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

        {advice && !loading && (
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {advice}
          </p>
        )}
        
        {!advice && !loading && (
          <p className="text-gray-300 leading-relaxed">
            Analysez régulièrement vos enregistrements pour suivre l'évolution de vos cotisations URSSAF.
          </p>
        )}
      </div>
    </motion.div>
  );
}































