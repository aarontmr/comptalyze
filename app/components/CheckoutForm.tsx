"use client";

import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";

interface CheckoutFormProps {
  plan: string;
}

export default function CheckoutForm({ plan }: CheckoutFormProps) {
  return (
    <div className="space-y-6">
      <EmbeddedCheckout />
      
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

