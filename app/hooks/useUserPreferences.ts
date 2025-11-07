"use client";

import { useState, useEffect } from 'react';

interface UserPreferences {
  showHelperTexts: boolean;
  compactMode: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  showHelperTexts: true,
  compactMode: false,
};

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger les préférences depuis localStorage au démarrage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('comptalyze_preferences');
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      }
      setIsLoaded(true);
    } catch (error) {
      console.error('Erreur chargement préférences:', error);
      setIsLoaded(true);
    }
  }, []);

  // Sauvegarder dans localStorage à chaque changement
  const updatePreferences = (updates: Partial<UserPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    
    try {
      localStorage.setItem('comptalyze_preferences', JSON.stringify(newPreferences));
    } catch (error) {
      console.error('Erreur sauvegarde préférences:', error);
    }
  };

  const toggleHelperTexts = () => {
    updatePreferences({ showHelperTexts: !preferences.showHelperTexts });
  };

  const toggleCompactMode = () => {
    updatePreferences({ compactMode: !preferences.compactMode });
  };

  return {
    preferences,
    isLoaded,
    updatePreferences,
    toggleHelperTexts,
    toggleCompactMode,
  };
}

