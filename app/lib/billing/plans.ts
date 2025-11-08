/**
 * SOURCE UNIQUE DE VÉRITÉ pour les plans d'abonnement Comptalyze
 * Centralise la définition des fonctionnalités et limites par plan
 */

export type PlanId = 'free' | 'pro' | 'premium';

export interface PlanFeatures {
  // Simulations URSSAF
  maxSimulationsPerMonth: number | null; // null = illimité
  
  // Fonctionnalités de base
  unlimitedRecords: boolean;
  exportPDF: boolean;
  emailExport: boolean;
  
  // Factures
  invoiceManagement: boolean;
  invoicePDFGeneration: boolean;
  invoiceEmailSending: boolean;
  
  // TVA et Charges
  tvaCalculation: boolean;
  chargesDeductibles: boolean;
  
  // Premium features
  urssafReminders: boolean;
  aiChatbot: boolean;
  aiAdvice: boolean;
  fiscalCalendar: boolean;
  urssafPrefill: boolean;
  autoImportStripe: boolean;
  autoImportShopify: boolean;
  monthlyRecapEmail: boolean;
  prioritySupport: boolean;
  
  // Limites IA (messages par mois)
  aiMessagesPerMonth: number | null; // null = illimité
  
  // Essai gratuit
  freeTrialDays: number;
}

export interface PlanDetails {
  id: PlanId;
  name: string;
  slug: string;
  description: string;
  
  // Prix
  priceMonthly: number; // En euros
  priceYearly: number; // En euros
  
  // Prix de lancement (optionnel)
  launchPriceMonthly?: number;
  launchPriceYearly?: number;
  
  // Stripe Price IDs (configurés via env)
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
  
  // Fonctionnalités
  features: PlanFeatures;
  
  // Marketing
  highlighted: boolean;
  badge?: string;
  color: string;
  gradient?: string;
}

/**
 * Configuration des plans - SINGLE SOURCE OF TRUTH
 */
export const PLANS: Record<PlanId, PlanDetails> = {
  free: {
    id: 'free',
    name: 'Gratuit',
    slug: 'free',
    description: 'Idéal pour découvrir Comptalyze',
    priceMonthly: 0,
    priceYearly: 0,
    features: {
      maxSimulationsPerMonth: 3,
      unlimitedRecords: false,
      exportPDF: false,
      emailExport: false,
      invoiceManagement: false,
      invoicePDFGeneration: false,
      invoiceEmailSending: false,
      tvaCalculation: false,
      chargesDeductibles: false,
      urssafReminders: false,
      aiChatbot: false,
      aiAdvice: false,
      fiscalCalendar: false,
      urssafPrefill: false,
      autoImportStripe: false,
      autoImportShopify: false,
      monthlyRecapEmail: false,
      prioritySupport: false,
      aiMessagesPerMonth: 0,
      freeTrialDays: 0,
    },
    highlighted: false,
    color: '#6B7280',
  },
  
  pro: {
    id: 'pro',
    name: 'Pro',
    slug: 'pro',
    description: 'Pour les auto-entrepreneurs actifs',
    priceMonthly: 5.90,
    priceYearly: 56.90,
    launchPriceMonthly: 3.90,
    launchPriceYearly: 37.90,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_PRO || process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
    stripePriceIdYearly: process.env.STRIPE_PRICE_PRO_YEARLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY,
    features: {
      maxSimulationsPerMonth: null, // Illimité
      unlimitedRecords: true,
      exportPDF: true,
      emailExport: true,
      invoiceManagement: true,
      invoicePDFGeneration: true,
      invoiceEmailSending: true,
      tvaCalculation: true,
      chargesDeductibles: true,
      urssafReminders: false,
      aiChatbot: false,
      aiAdvice: false,
      fiscalCalendar: false,
      urssafPrefill: false,
      autoImportStripe: false,
      autoImportShopify: false,
      monthlyRecapEmail: false,
      prioritySupport: false,
      aiMessagesPerMonth: 0,
      freeTrialDays: 0,
    },
    highlighted: false,
    color: '#2E6CF6',
  },
  
  premium: {
    id: 'premium',
    name: 'Premium',
    slug: 'premium',
    description: 'Tout Pro + IA et automatisation',
    priceMonthly: 9.90,
    priceYearly: 94.90,
    launchPriceMonthly: 7.90,
    launchPriceYearly: 75.90,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_PREMIUM || process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM,
    stripePriceIdYearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY,
    features: {
      maxSimulationsPerMonth: null, // Illimité
      unlimitedRecords: true,
      exportPDF: true,
      emailExport: true,
      invoiceManagement: true,
      invoicePDFGeneration: true,
      invoiceEmailSending: true,
      tvaCalculation: true,
      chargesDeductibles: true,
      urssafReminders: true,
      aiChatbot: true,
      aiAdvice: true,
      fiscalCalendar: true,
      urssafPrefill: true,
      autoImportStripe: true,
      autoImportShopify: true,
      monthlyRecapEmail: true,
      prioritySupport: true,
      aiMessagesPerMonth: null, // Illimité
      freeTrialDays: 3,
    },
    highlighted: true,
    badge: 'Le plus populaire',
    color: '#00D084',
    gradient: 'linear-gradient(90deg, #00D084, #2E6CF6)',
  },
};

/**
 * Récupère les détails d'un plan
 */
export function getPlan(planId: PlanId): PlanDetails {
  return PLANS[planId];
}

/**
 * Vérifie si un plan a accès à une fonctionnalité spécifique
 */
export function hasFeatureAccess(planId: PlanId, feature: keyof PlanFeatures): boolean {
  const plan = PLANS[planId];
  const featureValue = plan.features[feature];
  
  // Si c'est un booléen, retourner directement
  if (typeof featureValue === 'boolean') {
    return featureValue;
  }
  
  // Si c'est un nombre (ex: quotas), considérer comme "access" si > 0 ou null (illimité)
  if (typeof featureValue === 'number') {
    return featureValue > 0;
  }
  
  // Si null, considérer comme accès illimité = true
  if (featureValue === null) {
    return true;
  }
  
  return false;
}

/**
 * Récupère le quota de simulations pour un plan
 * Retourne null si illimité
 */
export function getSimulationQuota(planId: PlanId): number | null {
  return PLANS[planId].features.maxSimulationsPerMonth;
}

/**
 * Récupère le quota de messages IA pour un plan
 * Retourne null si illimité
 */
export function getAIQuota(planId: PlanId): number | null {
  return PLANS[planId].features.aiMessagesPerMonth;
}

/**
 * Compare deux plans et retourne les fonctionnalités supplémentaires du plan cible
 */
export function getUpgradeFeatures(currentPlan: PlanId, targetPlan: PlanId): string[] {
  const current = PLANS[currentPlan];
  const target = PLANS[targetPlan];
  
  const upgrades: string[] = [];
  
  // Comparer les fonctionnalités
  if (!current.features.unlimitedRecords && target.features.unlimitedRecords) {
    upgrades.push('Simulations illimitées');
  }
  if (!current.features.exportPDF && target.features.exportPDF) {
    upgrades.push('Export PDF');
  }
  if (!current.features.invoiceManagement && target.features.invoiceManagement) {
    upgrades.push('Gestion des factures');
  }
  if (!current.features.tvaCalculation && target.features.tvaCalculation) {
    upgrades.push('Calcul de TVA');
  }
  if (!current.features.chargesDeductibles && target.features.chargesDeductibles) {
    upgrades.push('Charges déductibles');
  }
  if (!current.features.aiChatbot && target.features.aiChatbot) {
    upgrades.push('ComptaBot IA personnalisé');
  }
  if (!current.features.urssafPrefill && target.features.urssafPrefill) {
    upgrades.push('Pré-remplissage URSSAF automatique');
  }
  if (!current.features.autoImportStripe && target.features.autoImportStripe) {
    upgrades.push('Import automatique Stripe');
  }
  if (!current.features.autoImportShopify && target.features.autoImportShopify) {
    upgrades.push('Import automatique Shopify');
  }
  if (!current.features.fiscalCalendar && target.features.fiscalCalendar) {
    upgrades.push('Calendrier fiscal');
  }
  if (!current.features.monthlyRecapEmail && target.features.monthlyRecapEmail) {
    upgrades.push('Récap mensuel par e-mail');
  }
  if (!current.features.prioritySupport && target.features.prioritySupport) {
    upgrades.push('Support prioritaire');
  }
  
  return upgrades;
}

/**
 * Récupère le Stripe Price ID pour un plan et une période
 */
export function getStripePriceId(planId: PlanId, period: 'monthly' | 'yearly'): string | undefined {
  const plan = PLANS[planId];
  return period === 'monthly' ? plan.stripePriceIdMonthly : plan.stripePriceIdYearly;
}

/**
 * Détermine le plan depuis un Stripe Price ID
 */
export function getPlanFromStripePriceId(priceId: string): PlanId | null {
  // Accepter les price IDs de test
  if (priceId === 'pro_test') return 'pro';
  if (priceId === 'premium_test') return 'premium';
  
  for (const [planId, plan] of Object.entries(PLANS)) {
    if (plan.stripePriceIdMonthly === priceId || plan.stripePriceIdYearly === priceId) {
      return planId as PlanId;
    }
  }
  
  return null;
}

