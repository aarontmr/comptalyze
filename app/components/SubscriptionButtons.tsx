"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";

export default function SubscriptionButtons() {
  const [loading, setLoading] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Récupérer l'utilisateur connecté
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getCurrentUser();
  }, []);

  const handleCheckout = async (plan: "pro" | "premium") => {
    // Vérifier que l'utilisateur est connecté
    if (!user) {
      alert("Vous devez être connecté pour souscrire à un abonnement. Redirection vers la page de connexion...");
      window.location.href = "/login";
      return;
    }

    try {
      setLoading(plan);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, userId: user.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Si la réponse n'est pas OK, afficher le message d'erreur
        const errorMessage = data.error || "Une erreur est survenue lors de la création de la session de paiement";
        alert(`Erreur: ${errorMessage}`);
        console.error("Erreur API checkout:", data);
        return;
      }

      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        alert("Erreur: Aucune URL de redirection reçue du serveur.");
        console.error("Réponse API sans URL:", data);
      }
    } catch (error) {
      console.error("Erreur lors de l'appel API:", error);
      alert("Une erreur est survenue lors de la connexion au serveur. Vérifiez votre connexion internet.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <button
        onClick={() => handleCheckout("pro")}
        disabled={loading !== null}
        className="bg-gradient-to-r from-[#00D084] to-[#2E6CF6] text-white font-semibold px-6 py-3 rounded-lg transition-transform duration-200 hover:scale-[1.02] disabled:hover:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          boxShadow: "0 8px 28px rgba(46,108,246,0.35)",
        }}
      >
        {loading === "pro" ? "Redirection..." : "Passer à Pro"}
      </button>
      <button
        onClick={() => handleCheckout("premium")}
        disabled={loading !== null}
        className="bg-gradient-to-r from-[#00D084] to-[#2E6CF6] text-white font-semibold px-6 py-3 rounded-lg transition-transform duration-200 hover:scale-[1.02] disabled:hover:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          boxShadow: "0 8px 28px rgba(46,108,246,0.35)",
        }}
      >
        {loading === "premium" ? "Redirection..." : "Passer à Premium"}
      </button>
    </div>
  );
}

