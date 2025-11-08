'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShoppingCart, AlertCircle } from 'lucide-react';

export default function ShopifyAuthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [shopDomain, setShopDomain] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const state = searchParams.get('state');

  const handleConnect = () => {
    if (!shopDomain) {
      setError('Veuillez entrer le domaine de votre boutique');
      return;
    }

    // Valider le format
    const cleanDomain = shopDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!cleanDomain.includes('.myshopify.com')) {
      setError('Le domaine doit être au format: votre-boutique.myshopify.com');
      return;
    }

    setLoading(true);

    // Construire l'URL Shopify OAuth
    const shopifyClientId = process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID;
    if (!shopifyClientId) {
      setError('Configuration Shopify manquante');
      setLoading(false);
      return;
    }

    const redirectUri = `${window.location.origin}/api/integrations/shopify/callback`;
    const scope = 'read_orders,read_products,read_customers';
    
    const authUrl = `https://${cleanDomain}/admin/oauth/authorize?client_id=${shopifyClientId}&scope=${scope}&redirect_uri=${redirectUri}&state=${state}`;
    
    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#0e0f12' }}>
      <div className="w-full max-w-md">
        <div
          className="rounded-2xl p-8"
          style={{
            backgroundColor: '#14161b',
            border: '1px solid rgba(46, 108, 246, 0.3)',
          }}
        >
          <div className="text-center mb-6">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{
                background: 'rgba(149, 208, 90, 0.1)',
              }}
            >
              <ShoppingCart className="w-8 h-8" style={{ color: '#95D05A' }} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Connecter Shopify</h1>
            <p className="text-sm text-gray-400">
              Entrez le domaine de votre boutique Shopify
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="shop-domain" className="block text-sm font-medium text-gray-300 mb-2">
              Domaine de la boutique
            </label>
            <div className="relative">
              <input
                id="shop-domain"
                type="text"
                value={shopDomain}
                onChange={(e) => {
                  setShopDomain(e.target.value);
                  setError('');
                }}
                placeholder="votre-boutique.myshopify.com"
                className="w-full px-4 py-3 rounded-xl text-white transition-all focus:ring-2 focus:ring-[#95D05A] outline-none"
                style={{
                  backgroundColor: '#1a1d24',
                  border: '1px solid #2d3441',
                  fontSize: '16px',
                  WebkitAppearance: 'none',
                }}
                disabled={loading}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Exemple: ma-boutique.myshopify.com
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl mb-4 flex items-start gap-2" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            onClick={handleConnect}
            disabled={loading || !shopDomain}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-h-[48px]"
            style={{
              background: loading ? '#374151' : 'linear-gradient(135deg, #95D05A 0%, #76B432 100%)',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(149, 208, 90, 0.3)',
            }}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Connexion...</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                <span>Se connecter à Shopify</span>
              </>
            )}
          </button>

          <button
            onClick={() => router.back()}
            disabled={loading}
            className="w-full mt-3 px-6 py-3 rounded-xl text-gray-400 hover:text-white font-medium transition-colors border border-gray-800 hover:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
          >
            Annuler
          </button>
        </div>

        <div className="mt-4 p-4 rounded-xl text-center" style={{ backgroundColor: 'rgba(46, 108, 246, 0.05)', border: '1px solid rgba(46, 108, 246, 0.2)' }}>
          <p className="text-xs text-gray-400">
            🔒 Comptalyze ne peut que <span className="text-white font-medium">lire</span> vos données.
            Nous ne pouvons jamais modifier ou supprimer vos commandes.
          </p>
        </div>
      </div>
    </div>
  );
}

