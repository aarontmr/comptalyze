/**
 * Configuration des limites par plan
 */

export type Plan = 'free' | 'pro' | 'premium';

export interface PlanLimits {
  urssafRecordsPerMonth: number; // Nombre de records URSSAF par mois (0 = illimité)
  invoicesPerMonth: number; // Nombre de factures par mois (0 = illimité)
  dashboardDaysLimit: number; // Nombre de jours de données dans le dashboard (0 = illumé)
  chartMonthsLimit: number; // Nombre de mois dans les graphiques (0 = illimité)
  hasUrssafPrefill: boolean; // Accès au pré-remplissage URSSAF
  hasInvoiceEmail: boolean; // Envoi d'emails de factures
  hasInvoiceCustomization: boolean; // Personnalisation factures (logo/couleurs)
  hasTvaSimulator: boolean; // Simulateur TVA
  hasFullExport: boolean; // Export Excel/CSV/PDF complet
  hasAdvancedStats: boolean; // Statistiques avancées
  hasAiAnalysis: boolean; // Analyse IA
  hasAiAssistant: boolean; // Assistant IA avec accès aux données
  hasCalendarFiscal: boolean; // Calendrier fiscal URSSAF
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    urssafRecordsPerMonth: 5,
    invoicesPerMonth: 1,
    dashboardDaysLimit: 30,
    chartMonthsLimit: 3,
    hasUrssafPrefill: false,
    hasInvoiceEmail: false,
    hasInvoiceCustomization: false,
    hasTvaSimulator: false,
    hasFullExport: false,
    hasAdvancedStats: false,
    hasAiAnalysis: false,
    hasAiAssistant: false,
    hasCalendarFiscal: false,
  },
  pro: {
    urssafRecordsPerMonth: 0, // Illimité
    invoicesPerMonth: 0, // Illimité
    dashboardDaysLimit: 0, // Illimité
    chartMonthsLimit: 0, // Illimité
    hasUrssafPrefill: false,
    hasInvoiceEmail: true,
    hasInvoiceCustomization: true,
    hasTvaSimulator: true,
    hasFullExport: true,
    hasAdvancedStats: true,
    hasAiAnalysis: false,
    hasAiAssistant: false,
    hasCalendarFiscal: false,
  },
  premium: {
    urssafRecordsPerMonth: 0, // Illimité
    invoicesPerMonth: 0, // Illimité
    dashboardDaysLimit: 0, // Illimité
    chartMonthsLimit: 0, // Illimité
    hasUrssafPrefill: true,
    hasInvoiceEmail: true,
    hasInvoiceCustomization: true,
    hasTvaSimulator: true,
    hasFullExport: true,
    hasAdvancedStats: true,
    hasAiAnalysis: true,
    hasAiAssistant: true,
    hasCalendarFiscal: true,
  },
};

/**
 * Récupère les limites d'un plan
 */
export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan];
}

/**
 * Vérifie si un plan a accès à une fonctionnalité
 */
export function hasPlanFeature(plan: Plan, feature: keyof PlanLimits): boolean {
  const limits = getPlanLimits(plan);
  return limits[feature] === true || (typeof limits[feature] === 'number' && limits[feature] > 0);
}









