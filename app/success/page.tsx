"use client";

import Link from "next/link";

export default function SuccessPage() {
  return (
    <main
      className="min-h-screen w-full flex items-center justify-center text-white"
      style={{ backgroundColor: "#0e0f12", fontFamily: "Poppins, sans-serif" }}
    >
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="mb-6 text-6xl">✅</div>
        <h1 className="text-3xl font-semibold mb-4">Merci !</h1>
        <p className="text-lg text-gray-300 mb-8">
          Votre abonnement a été activé avec succès.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium text-white transition-transform duration-200 hover:scale-[1.02]"
          style={{
            background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
            boxShadow: "0 8px 28px rgba(46,108,246,0.35)",
          }}
        >
          Aller au tableau de bord
        </Link>
      </div>
    </main>
  );
}

