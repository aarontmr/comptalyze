'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface EmailReminderToggleProps {
  userId: string;
  isPremium: boolean;
}

export default function EmailReminderToggle({ userId, isPremium }: EmailReminderToggleProps) {
  const [monthlyReminder, setMonthlyReminder] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (isPremium && userId) {
      loadPreference();
    }
  }, [userId, isPremium]);

  const loadPreference = async () => {
    try {
      const { data, error } = await supabase
        .from('email_preferences')
        .select('monthly_reminder')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned, ce qui est normal si aucune préférence n'existe encore
        console.error('Erreur lors du chargement de la préférence:', error);
      } else {
        setMonthlyReminder(data?.monthly_reminder ?? true); // Par défaut true
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleToggle = async (enabled: boolean) => {
    if (!isPremium || !userId) return;

    try {
      setLoading(true);

      // Upsert (insert or update)
      const { error } = await supabase
        .from('email_preferences')
        .upsert({
          user_id: userId,
          monthly_reminder: enabled,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) {
        console.error('Erreur lors de la mise à jour:', error);
        // Revert the toggle if update failed
        setMonthlyReminder(!enabled);
        return;
      }

      setMonthlyReminder(enabled);
    } catch (error) {
      console.error('Erreur:', error);
      setMonthlyReminder(!enabled);
    } finally {
      setLoading(false);
    }
  };

  if (!isPremium) {
    return null;
  }

  if (initialLoading) {
    return (
      <div className="p-4 rounded-xl" style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}>
        <div className="h-6 bg-gray-700 rounded animate-pulse" style={{ width: '60%' }}></div>
      </div>
    );
  }

  return (
    <div
      className="p-4 rounded-xl"
      style={{ backgroundColor: '#1a1d24', border: '1px solid #2d3441' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-white mb-1">
            Recevoir un rappel par e-mail tous les 2 du mois
          </p>
          <p className="text-xs text-gray-400">
            Un email vous rappellera d'enregistrer votre chiffre d'affaires du mois précédent
          </p>
        </div>
        <button
          onClick={() => handleToggle(!monthlyReminder)}
          disabled={loading}
          className={`ml-4 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            monthlyReminder ? 'bg-blue-600' : 'bg-gray-600'
          }`}
          style={{
            backgroundColor: monthlyReminder ? '#2E6CF6' : '#4b5563',
          }}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              monthlyReminder ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
}





































