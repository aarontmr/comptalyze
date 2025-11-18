/**
 * Gestion sécurisée des erreurs
 * Évite l'exposition de stack traces et d'informations sensibles
 */

import { NextResponse } from 'next/server';

/**
 * Type d'erreur pour classification
 */
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  INTERNAL = 'INTERNAL',
}

/**
 * Configuration pour la gestion des erreurs
 */
interface ErrorConfig {
  logError?: boolean;
  logStack?: boolean;
  exposeDetails?: boolean;
}

/**
 * Messages d'erreur génériques pour les clients
 */
const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.VALIDATION]: 'Les données fournies sont invalides',
  [ErrorType.AUTHENTICATION]: 'Authentification requise',
  [ErrorType.AUTHORIZATION]: 'Accès non autorisé',
  [ErrorType.NOT_FOUND]: 'Ressource non trouvée',
  [ErrorType.RATE_LIMIT]: 'Trop de requêtes. Veuillez réessayer plus tard',
  [ErrorType.EXTERNAL_SERVICE]: 'Service temporairement indisponible',
  [ErrorType.INTERNAL]: 'Une erreur est survenue',
};

/**
 * Gère une erreur de manière sécurisée
 * 
 * @param error - L'erreur à gérer
 * @param type - Le type d'erreur
 * @param statusCode - Le code de statut HTTP
 * @param config - Configuration optionnelle
 * @returns Une réponse NextResponse avec un message d'erreur sécurisé
 */
export function handleError(
  error: unknown,
  type: ErrorType = ErrorType.INTERNAL,
  statusCode: number = 500,
  config: ErrorConfig = {}
): NextResponse {
  const {
    logError = true,
    logStack = process.env.NODE_ENV === 'development',
    exposeDetails = false,
  } = config;

  // Logger l'erreur côté serveur (avec stack trace en dev uniquement)
  if (logError) {
    if (error instanceof Error) {
      console.error(`[${type}] ${error.message}`, logStack ? error.stack : '');
    } else {
      console.error(`[${type}]`, error);
    }
  }

  // Message pour le client
  let clientMessage = ERROR_MESSAGES[type];
  
  // En développement ou si explicitement autorisé, exposer plus de détails
  if (exposeDetails && process.env.NODE_ENV === 'development' && error instanceof Error) {
    clientMessage = error.message;
  }

  // Ne jamais exposer de stack traces au client
  return NextResponse.json(
    {
      error: clientMessage,
      type,
      ...(process.env.NODE_ENV === 'development' && {
        _dev: {
          message: error instanceof Error ? error.message : String(error),
        },
      }),
    },
    { status: statusCode }
  );
}

/**
 * Helper pour les erreurs de validation
 */
export function handleValidationError(error: unknown): NextResponse {
  return handleError(error, ErrorType.VALIDATION, 400, {
    exposeDetails: true, // Les erreurs de validation peuvent exposer le message
  });
}

/**
 * Helper pour les erreurs d'authentification
 */
export function handleAuthError(error: unknown): NextResponse {
  return handleError(error, ErrorType.AUTHENTICATION, 401);
}

/**
 * Helper pour les erreurs d'autorisation
 */
export function handleAuthorizationError(error: unknown): NextResponse {
  return handleError(error, ErrorType.AUTHORIZATION, 403);
}

/**
 * Helper pour les erreurs 404
 */
export function handleNotFoundError(error: unknown): NextResponse {
  return handleError(error, ErrorType.NOT_FOUND, 404);
}

/**
 * Helper pour les erreurs de rate limiting
 */
export function handleRateLimitError(error: unknown): NextResponse {
  return handleError(error, ErrorType.RATE_LIMIT, 429);
}

/**
 * Helper pour les erreurs de services externes
 */
export function handleExternalServiceError(error: unknown): NextResponse {
  return handleError(error, ErrorType.EXTERNAL_SERVICE, 502);
}

/**
 * Helper pour les erreurs internes
 */
export function handleInternalError(error: unknown): NextResponse {
  return handleError(error, ErrorType.INTERNAL, 500);
}

