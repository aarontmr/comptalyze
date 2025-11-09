/**
 * Helper pour les événements Google Analytics 4
 * Centralise le tracking des événements importants
 */

export type AnalyticsEvent =
  // Événements Auth
  | { name: 'sign_up'; params: { method: string } }
  | { name: 'login'; params: { method: string } }
  | { name: 'logout'; params: {} }
  
  // Événements Plans & Abonnements
  | { name: 'view_pricing'; params: {} }
  | { name: 'start_checkout'; params: { plan: string; period: 'monthly' | 'yearly' } }
  | { name: 'upgrade_completed'; params: { plan: string; value: number; currency: string } }
  | { name: 'trial_started'; params: { plan: string } }
  | { name: 'trial_ended'; params: { plan: string; converted: boolean } }
  | { name: 'subscription_cancelled'; params: { plan: string } }
  
  // Événements Simulation URSSAF
  | { name: 'simulation_created'; params: { activity_type: string; has_acre: boolean } }
  | { name: 'simulation_limit_reached'; params: { plan: string; limit: number } }
  | { name: 'record_saved'; params: { month: number; year: number } }
  | { name: 'record_deleted'; params: {} }
  
  // Événements Export
  | { name: 'export_pdf'; params: { year: number; records_count: number } }
  | { name: 'export_data'; params: { format: string } }
  
  // Événements Factures
  | { name: 'invoice_created'; params: { amount: number } }
  | { name: 'invoice_sent'; params: { channel: 'email' } }
  | { name: 'invoice_pdf_generated'; params: {} }
  
  // Événements IA
  | { name: 'ai_chat_message'; params: { message_count: number } }
  | { name: 'ai_advice_requested'; params: {} }
  | { name: 'ai_quota_reached'; params: { plan: string } }
  
  // Événements Intégrations
  | { name: 'integration_connected'; params: { provider: 'stripe' | 'shopify' } }
  | { name: 'integration_disconnected'; params: { provider: 'stripe' | 'shopify' } }
  | { name: 'import_completed'; params: { provider: string; records_count: number } }
  
  // Événements UX
  | { name: 'cta_clicked'; params: { cta_name: string; location: string } }
  | { name: 'page_view'; params: { page_path: string; page_title?: string } }
  | { name: 'feedback_submitted'; params: { rating: number; category: string } }
  | { name: 'tutorial_completed'; params: { step: number } }
  | { name: 'onboarding_completed'; params: { duration_seconds: number } }
};

/**
 * Envoie un événement à Google Analytics 4
 * Utilise gtag si disponible, sinon log en console (dev)
 */
export function trackEvent(event: AnalyticsEvent): void {
  const { name, params } = event;
  
  // En environnement serveur, ne rien faire
  if (typeof window === 'undefined') {
    return;
  }
  
  // Si gtag est disponible (GA4 chargé)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', name, params);
    console.log('[Analytics] Event tracked:', name, params);
  } else {
    // En dev, logger dans la console
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Event (not sent):', name, params);
    }
  }
}

/**
 * Track une page view
 */
export function trackPageView(path: string, title?: string): void {
  trackEvent({
    name: 'page_view',
    params: {
      page_path: path,
      page_title: title,
    },
  });
}

/**
 * Track un CTA click
 */
export function trackCTA(ctaName: string, location: string): void {
  trackEvent({
    name: 'cta_clicked',
    params: {
      cta_name: ctaName,
      location,
    },
  });
}

/**
 * Track une conversion (upgrade)
 */
export function trackConversion(plan: string, value: number): void {
  trackEvent({
    name: 'upgrade_completed',
    params: {
      plan,
      value,
      currency: 'EUR',
    },
  });
}

/**
 * Track une limite atteinte (plan gratuit)
 */
export function trackLimitReached(plan: string, limit: number): void {
  trackEvent({
    name: 'simulation_limit_reached',
    params: {
      plan,
      limit,
    },
  });
}

/**
 * Enregistre un événement dans la table analytics_events de Supabase
 * Pour un tracking côté serveur et des analytics avancées
 */
export async function logEventToDatabase(
  eventName: string,
  userId: string | null,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    // Import dynamique pour éviter les erreurs côté client
    const { supabase } = await import('@/lib/supabaseClient');
    
    await supabase.from('analytics_events').insert({
      event_name: eventName,
      user_id: userId,
      metadata: metadata || {},
    });
  } catch (error) {
    console.error('[Analytics] Failed to log event to database:', error);
  }
}

