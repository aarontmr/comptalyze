"use client";

// Réexport depuis le contexte pour maintenir la compatibilité
import { useUserPreferences as useUserPreferencesContext } from '@/app/contexts/UserPreferencesContext';

export function useUserPreferences() {
  return useUserPreferencesContext();
}

// Réexport du provider
export { UserPreferencesProvider } from '@/app/contexts/UserPreferencesContext';

