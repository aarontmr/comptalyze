'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface MonthlyRecapEmailToggleProps {
  userId: string;
}

export default function MonthlyRecapEmailToggle({ userId }: MonthlyRecapEmailToggleProps) {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreference();
  }, [userId]);

  const loadPreference = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('monthly_recap_email')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur chargement préférence:', error);
      }

      setEnabled(data?.monthly_recap_email ?? true); // Activé par défaut
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    setSaving(true);
    const newValue = !enabled;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          monthly_recap_email: newValue,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setEnabled(newValue);
    } catch (error) {
      console.error('Erreur sauvegarde préférence:', error);
      alert('Une erreur est survenue');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-6 w-12 bg-gray-800 rounded-full animate-pulse"></div>;
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleToggle}
        disabled={saving}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-gradient-to-r from-[#00D084] to-[#2E6CF6]' : 'bg-gray-700'
        } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span className="text-sm text-gray-300">
        {enabled ? 'Activé' : 'Désactivé'}
      </span>
    </div>
  );
}

