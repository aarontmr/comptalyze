/**
 * Bouton pour ouvrir le portail de facturation Stripe
 * Permet à l'utilisateur de gérer son abonnement, CB, télécharger reçus, etc.
 */

'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { getUserSubscription } from '@/lib/subscriptionUtils';

interface BillingPortalButtonProps {
  user: User;
  label?: string;
  className?: string;
}

export default function BillingPortalButton({
  user,
  label = 'Gérer mon abonnement',
  className = '',
}: BillingPortalButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const subscription = getUserSubscription(user);
  
  // Ne afficher que si l'utilisateur a un abonnement actif
  if (subscription.plan === 'free') {
    return null;
  }
  
  const handleClick = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Appeler l'API pour créer une session de portail Stripe
      const response = await fetch('/api/create-billing-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la création de la session');
      }
      
      const { url } = await response.json();
      
      // Rediriger vers le portail Stripe
      window.location.href = url;
    } catch (err: any) {
      console.error('Erreur portail facturation:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium
          transition-all duration-200
          ${loading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
          }
          ${className}
        `}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Chargement...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            {label}
          </>
        )}
      </button>
      
      {error && (
        <p className="text-sm text-red-600 mt-2">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Lien texte pour ouvrir le portail (version compacte)
 */
export function BillingPortalLink({ user }: { user: User }) {
  const [loading, setLoading] = useState(false);
  
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/create-billing-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      
      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <a
      href="#"
      onClick={handleClick}
      className="text-blue-600 hover:text-blue-700 hover:underline text-sm"
    >
      {loading ? 'Chargement...' : 'Gérer mon abonnement'}
    </a>
  );
}

