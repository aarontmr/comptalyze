/**
 * Utilitaire de tracking analytics
 * Gère les événements, les sources UTM et l'intégration Umami
 */

import { supabase } from './supabaseClient';

// Types d'événements trackés
export type AnalyticsEvent =
  | 'signup_started'
  | 'signup_completed'
  | 'record_created'
  | 'upgrade_clicked'
  | 'upgrade_completed';

// Interface pour les paramètres UTM
export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

// Interface pour les métadonnées d'événement
export interface EventMetadata {
  [key: string]: any;
}

const UTM_STORAGE_KEY = 'comptalyze_utm_params';
const SESSION_ID_KEY = 'comptalyze_session_id';

/**
 * Génère un ID de session unique
 */
function generateSessionId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Récupère ou crée un ID de session
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

/**
 * Capture et stocke les paramètres UTM depuis l'URL
 * À appeler au chargement de la page
 */
export function captureUTMParams(): void {
  if (typeof window === 'undefined') return;

  // Vérifier si les UTM sont déjà stockés
  const storedUTM = localStorage.getItem(UTM_STORAGE_KEY);
  if (storedUTM) return; // Ne pas écraser les UTM existants

  const urlParams = new URLSearchParams(window.location.search);
  const utmParams: UTMParams = {};

  // Extraire tous les paramètres UTM
  const utmKeys: (keyof UTMParams)[] = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
  ];

  let hasUTM = false;
  utmKeys.forEach((key) => {
    const value = urlParams.get(key);
    if (value) {
      utmParams[key] = value;
      hasUTM = true;
    }
  });

  // Stocker si au moins un paramètre UTM est présent
  if (hasUTM) {
    localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmParams));
    console.log('✅ Paramètres UTM capturés:', utmParams);
  }
}

/**
 * Récupère les paramètres UTM stockés
 */
export function getStoredUTMParams(): UTMParams {
  if (typeof window === 'undefined') return {};

  const stored = localStorage.getItem(UTM_STORAGE_KEY);
  if (!stored) return {};

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Erreur lors de la lecture des UTM params:', error);
    return {};
  }
}

/**
 * Efface les paramètres UTM stockés
 * Utile pour les tests ou si l'utilisateur se déconnecte
 */
export function clearUTMParams(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(UTM_STORAGE_KEY);
}

/**
 * Track un événement dans Supabase et Umami
 */
export async function trackEvent(
  eventName: AnalyticsEvent,
  metadata: EventMetadata = {}
): Promise<void> {
  try {
    // Récupérer les informations
    const utmParams = getStoredUTMParams();
    const sessionId = getSessionId();
    
    // Récupérer l'utilisateur connecté (si disponible)
    const { data: { user } } = await supabase.auth.getUser();

    // Préparer les données de l'événement
    const eventData = {
      event_name: eventName,
      user_id: user?.id || null,
      session_id: sessionId,
      ...utmParams,
      metadata,
      page_path: typeof window !== 'undefined' ? window.location.pathname : null,
      referrer: typeof document !== 'undefined' ? document.referrer : null,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    };

    // Insérer dans Supabase
    const { error } = await supabase
      .from('analytics_events')
      .insert([eventData]);

    if (error) {
      console.error('Erreur lors du tracking de l\'événement:', error);
    } else {
      console.log('✅ Événement tracké:', eventName);
    }

    // Track avec Umami si disponible
    if (typeof window !== 'undefined' && (window as any).umami) {
      (window as any).umami.track(eventName, metadata);
    }
  } catch (error) {
    console.error('Erreur lors du tracking:', error);
  }
}

/**
 * Hook d'initialisation à appeler dans le layout principal
 */
export function initializeAnalytics(): void {
  if (typeof window === 'undefined') return;

  // Capturer les UTM params à la première visite
  captureUTMParams();

  // Créer ou récupérer l'ID de session
  getSessionId();

  console.log('✅ Analytics initialisé');
}

