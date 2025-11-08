/**
 * Page d'erreur globale (500)
 * Affichée quand une erreur non gérée survient
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Home, RefreshCcw, AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Logger l'erreur (vous pouvez envoyer à Sentry ici)
    console.error('Error caught by error.tsx:', error);
    
    // TODO: Envoyer à Sentry
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error);
    // }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center max-w-2xl">
        {/* Icon erreur */}
        <div className="mb-8 inline-block">
          <div className="relative">
            <AlertTriangle 
              className="w-32 h-32 text-red-500 animate-pulse"
              strokeWidth={1.5}
            />
            <div className="absolute inset-0 blur-3xl opacity-20">
              <div 
                className="w-full h-full rounded-full"
                style={{
                  background: 'radial-gradient(circle, #ef4444 0%, #dc2626 100%)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          Oups ! Une erreur est survenue
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
          Quelque chose s'est mal passé de notre côté.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
          Notre équipe a été notifiée et va corriger le problème rapidement.
        </p>

        {/* Détails techniques (en dev) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-left">
            <p className="text-sm font-mono text-red-800 dark:text-red-300 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all hover:scale-105 hover:shadow-xl"
            style={{
              background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
            }}
          >
            <RefreshCcw className="w-5 h-5" />
            Réessayer
          </button>
          
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
          >
            <Home className="w-5 h-5" />
            Retour à l'accueil
          </Link>
        </div>

        {/* Info additionnelle */}
        <div className="mt-12 p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg">
          <h3 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">
            En attendant, vous pouvez :
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 text-left">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Rafraîchir la page (bouton "Réessayer" ci-dessus)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Vérifier votre connexion internet</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Vider le cache de votre navigateur</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Consulter notre{' '}
                <Link href="/status" className="text-blue-600 hover:underline">
                  page de statut
                </Link>
              </span>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <p className="mt-8 text-sm text-gray-500 dark:text-gray-500">
          Le problème persiste ?{' '}
          <a 
            href="mailto:support@comptalyze.com" 
            className="text-blue-600 hover:underline"
          >
            Contactez notre support
          </a>
          {error.digest && ` (Réf: ${error.digest})`}
        </p>
      </div>
    </div>
  );
}

