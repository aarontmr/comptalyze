/**
 * Page 404 personnalisée
 * Affichée quand une route n'existe pas
 */

import Link from 'next/link';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center max-w-2xl">
        {/* Animation 404 */}
        <div className="relative mb-8">
          <h1 
            className="text-9xl font-bold text-transparent bg-clip-text animate-pulse"
            style={{
              backgroundImage: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
            }}
          >
            404
          </h1>
          <div className="absolute inset-0 blur-3xl opacity-20">
            <div 
              className="w-full h-full"
              style={{
                background: 'radial-gradient(circle, #00D084 0%, #2E6CF6 100%)',
              }}
            />
          </div>
        </div>

        {/* Message */}
        <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          Page introuvable
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Oups ! La page que vous recherchez semble avoir disparu dans les méandres du web...
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all hover:scale-105 hover:shadow-xl"
            style={{
              background: 'linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)',
            }}
          >
            <Home className="w-5 h-5" />
            Retour à l'accueil
          </Link>
          
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Dashboard
          </Link>
        </div>

        {/* Suggestions */}
        <div className="mt-12 p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg">
          <div className="flex items-center gap-2 mb-4 text-gray-700 dark:text-gray-300">
            <Search className="w-5 h-5" />
            <h3 className="font-semibold">Pages populaires</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Link 
              href="/dashboard/simulateur" 
              className="text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Simulateur URSSAF
            </Link>
            <Link 
              href="/pricing" 
              className="text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Tarifs
            </Link>
            <Link 
              href="/blog" 
              className="text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Blog
            </Link>
            <Link 
              href="/a-propos" 
              className="text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              À propos
            </Link>
          </div>
        </div>

        {/* Contact */}
        <p className="mt-8 text-sm text-gray-500 dark:text-gray-500">
          Un problème ?{' '}
          <a 
            href="mailto:support@comptalyze.com" 
            className="text-blue-600 hover:underline"
          >
            Contactez-nous
          </a>
        </p>
      </div>
    </div>
  );
}

