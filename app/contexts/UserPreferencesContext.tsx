"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserPreferences {
  showHelperTexts: boolean;
  compactMode: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  showHelperTexts: true,
  compactMode: false,
};

interface UserPreferencesContextType {
  preferences: UserPreferences;
  isLoaded: boolean;
  toggleHelperTexts: () => void;
  toggleCompactMode: () => void;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
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
    setPreferences((prev) => {
      const newPreferences = { ...prev, ...updates };
      try {
        localStorage.setItem('comptalyze_preferences', JSON.stringify(newPreferences));
      } catch (error) {
        console.error('Erreur sauvegarde préférences:', error);
      }
      return newPreferences;
    });
  };

  const toggleHelperTexts = () => {
    updatePreferences({ showHelperTexts: !preferences.showHelperTexts });
  };

  const toggleCompactMode = () => {
    updatePreferences({ compactMode: !preferences.compactMode });
  };

  return (
    <UserPreferencesContext.Provider
      value={{
        preferences,
        isLoaded,
        toggleHelperTexts,
        toggleCompactMode,
        updatePreferences,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
}


