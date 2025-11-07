"use client";

import { useState, FormEvent } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Lock } from "lucide-react";

interface CheckoutFormProps {
  plan: string;
}

export default function CheckoutForm({ plan }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${baseUrl}/success`,
      },
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || "Une erreur est survenue");
      } else {
        setMessage("Une erreur inattendue est survenue.");
      }
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{
        layout: "tabs",
        wallets: {
          applePay: "auto",
          googlePay: "auto"
        }
      }} />

      {message && (
        <div
          className="rounded-lg p-4"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
          }}
        >
          <p className="text-sm text-red-400">{message}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !stripe || !elements}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-6 py-4 text-base font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] disabled:hover:scale-100"
        style={{
          background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
          boxShadow: "0 8px 28px rgba(46,108,246,0.35)",
        }}
      >
        <Lock className="w-4 h-4" />
        {isLoading ? "Traitement en cours..." : "Confirmer le paiement"}
      </button>

      <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-700">
        <svg className="h-6 opacity-50" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 12.5C0 5.59644 5.59644 0 12.5 0C19.4036 0 25 5.59644 25 12.5C25 19.4036 19.4036 25 12.5 25C5.59644 25 0 19.4036 0 12.5Z" fill="#00D084"/>
          <path d="M35 12.5C35 5.59644 40.5964 0 47.5 0C54.4036 0 60 5.59644 60 12.5C60 19.4036 54.4036 25 47.5 25C40.5964 25 35 19.4036 35 12.5Z" fill="#2E6CF6"/>
        </svg>
        <div className="text-xs text-gray-500">Paiement sécurisé par Stripe</div>
      </div>
    </form>
  );
}

