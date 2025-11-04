/**
 * Calculs pour le simulateur URSSAF avec gestion de l'impôt sur le revenu
 */

export type Activity = 'ventes' | 'bic' | 'bnc';
export type IRMode = 'none' | 'vl' | 'bareme';

// Taux de versement libératoire par activité
export const VL_RATES: Record<Activity, number> = {
  ventes: 0.01,      // 1%
  bic: 0.017,        // 1.7%
  bnc: 0.022,        // 2.2%
};

// Abattements forfaitaires par activité (pour le barème classique)
export const ABATTEMENTS: Record<Activity, number> = {
  ventes: 0.71,      // 71%
  bic: 0.5,          // 50%
  bnc: 0.34,         // 34%
};

// Abattement minimum (305€)
const ABATTEMENT_MIN = 305;

export interface CalcInput {
  ca: number;
  activity: Activity;
  cotisRate: number;
  irMode: IRMode;
  baremeProvisionRate?: number; // ex 0.06 → 6%
}

export interface CalcResult {
  cotis: number;
  ir: number;
  netAfterCotis: number;
  netAfterAll: number;
}

/**
 * Calcule les cotisations URSSAF et l'impôt sur le revenu pour un mois
 */
export function computeMonth(input: CalcInput): CalcResult {
  const { ca, activity, cotisRate, irMode, baremeProvisionRate = 0.06 } = input;

  // Cotisations sociales
  const cotis = +(ca * cotisRate).toFixed(2);
  const netAfterCotis = +(ca - cotis).toFixed(2);

  // Impôt sur le revenu
  let ir = 0;

  if (irMode === 'vl') {
    // Versement libératoire : taux fixe sur le CA
    ir = +(ca * VL_RATES[activity]).toFixed(2);
  } else if (irMode === 'bareme') {
    // Barème classique : calcul avec abattement forfaitaire
    const abattement = Math.max(ABATTEMENT_MIN, ca * ABATTEMENTS[activity]);
    const base = Math.max(0, ca - abattement);
    ir = +(base * baremeProvisionRate).toFixed(2);
  }

  const netAfterAll = +(ca - cotis - ir).toFixed(2);

  return { cotis, ir, netAfterCotis, netAfterAll };
}

/**
 * Convertit le type d'activité du formulaire vers le type utilisé dans les calculs
 */
export function mapActivityType(activityType: 'vente' | 'services' | 'liberal'): Activity {
  switch (activityType) {
    case 'vente':
      return 'ventes';
    case 'services':
      return 'bic';
    case 'liberal':
      return 'bnc';
    default:
      return 'ventes';
  }
}

