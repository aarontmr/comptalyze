"use client";

import { useState } from "react";
import { ShoppingBag, Store, Link as LinkIcon, CheckCircle2, X } from "lucide-react";
import Breadcrumbs from "@/app/components/Breadcrumbs";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  connected: boolean;
  category: "ecommerce" | "payment" | "other";
}

export default function IntegrationsPage() {
  const [integrations] = useState<Integration[]>([
    {
      id: "woocommerce",
      name: "WooCommerce",
      description: "Synchronisez automatiquement vos commandes et ventes",
      icon: ShoppingBag,
      connected: false,
      category: "ecommerce",
    },
    {
      id: "prestashop",
      name: "PrestaShop",
      description: "Importez vos données de vente depuis PrestaShop",
      icon: Store,
      connected: false,
      category: "ecommerce",
    },
    {
      id: "shopify",
      name: "Shopify",
      description: "Connectez votre boutique Shopify pour synchroniser les ventes",
      icon: ShoppingBag,
      connected: false,
      category: "ecommerce",
    },
  ]);

  const handleConnect = (integrationId: string) => {
    // TODO: Implémenter la connexion OAuth
    alert(`Connexion à ${integrationId} - Fonctionnalité à venir`);
  };

  const handleDisconnect = (integrationId: string) => {
    if (confirm(`Déconnecter ${integrationId} ?`)) {
      // TODO: Implémenter la déconnexion
      alert(`Déconnexion de ${integrationId}`);
    }
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: "Aperçu", href: "/dashboard" }, { label: "Intégrations" }]} />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Intégrations</h1>
        <p className="text-gray-400">Connectez vos outils e-commerce et de paiement</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          return (
            <div
              key={integration.id}
              className="rounded-xl p-6 border"
              style={{
                backgroundColor: "#14161b",
                borderColor: integration.connected ? "#00D084" : "#1f232b",
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: "#00D08420" }}
                >
                  <Icon className="w-6 h-6" style={{ color: "#00D084" }} />
                </div>
                {integration.connected && (
                  <CheckCircle2 className="w-5 h-5" style={{ color: "#00D084" }} />
                )}
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">{integration.name}</h3>
              <p className="text-sm text-gray-400 mb-4">{integration.description}</p>

              {integration.connected ? (
                <button
                  onClick={() => handleDisconnect(integration.id)}
                  className="w-full px-4 py-2 rounded-lg text-white font-medium transition-colors"
                  style={{ backgroundColor: "#ef4444", border: "1px solid #ef4444" }}
                >
                  Déconnecter
                </button>
              ) : (
                <button
                  onClick={() => handleConnect(integration.id)}
                  className="w-full px-4 py-2 rounded-lg text-white font-medium transition-all hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Connecter
                  </div>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Note */}
      <div
        className="mt-6 rounded-xl p-4 border"
        style={{
          backgroundColor: "#f59e0b20",
          borderColor: "#f59e0b",
        }}
      >
        <p className="text-sm text-gray-300">
          <strong className="text-white">Note :</strong> Les intégrations e-commerce synchronisent automatiquement
          vos ventes et les enregistrent comme CA dans Comptalyze. La synchronisation se fait en temps réel.
        </p>
      </div>
    </div>
  );
}




