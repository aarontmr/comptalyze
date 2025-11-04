"use client";

import { EmbeddedCheckout } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";

interface CheckoutFormProps {
  plan: string;
}

export default function CheckoutForm({ plan }: CheckoutFormProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    console.log("🎨 CheckoutForm monté pour le plan:", plan);
    
    // Simuler un délai pour masquer le loader une fois Stripe chargé
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [plan]);

  return (
    <div className="space-y-6">
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="relative w-12 h-12 mx-auto mb-4">
              <div
                className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
                style={{
                  borderColor: "#2E6CF6 transparent transparent transparent",
                }}
              />
            </div>
            <p className="text-sm text-gray-400">Chargement du formulaire de paiement...</p>
          </div>
        </div>
      )}
      
      <div style={{ display: isLoading ? 'none' : 'block' }}>
        <EmbeddedCheckout />
      </div>
      
      <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-700">
        <svg className="h-6 opacity-50" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 12.5C0 5.59644 5.59644 0 12.5 0C19.4036 0 25 5.59644 25 12.5C25 19.4036 19.4036 25 12.5 25C5.59644 25 0 19.4036 0 12.5Z" fill="#00D084"/>
          <path d="M35 12.5C35 5.59644 40.5964 0 47.5 0C54.4036 0 60 5.59644 60 12.5C60 19.4036 54.4036 25 47.5 25C40.5964 25 35 19.4036 35 12.5Z" fill="#2E6CF6"/>
        </svg>
        <div className="text-xs text-gray-500">Paiement sécurisé par Stripe</div>
      </div>
    </div>
  );
}

