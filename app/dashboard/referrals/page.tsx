"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { Gift, Copy, CheckCircle2, Users } from "lucide-react";
import Breadcrumbs from "@/app/components/Breadcrumbs";

interface Referral {
  id: string;
  referral_code: string;
  status: string;
  reward_type?: string;
  reward_amount?: number;
  created_at: string;
}

export default function ReferralsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadReferrals(session.user.id);
        await generateReferralCode(session.user.id);
      }
    };
    fetchUser();
  }, []);

  const loadReferrals = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReferrals(data || []);
    } catch (error) {
      console.error("Error loading referrals:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateReferralCode = async (userId: string) => {
    try {
      // Vérifier si un code existe déjà
      const { data: existing } = await supabase
        .from("referrals")
        .select("referral_code")
        .eq("referrer_id", userId)
        .limit(1)
        .single();

      if (existing?.referral_code) {
        setReferralCode(existing.referral_code);
        return;
      }

      // Générer un nouveau code
      const code = `COMPTALYZE-${userId.substring(0, 8).toUpperCase()}`;
      setReferralCode(code);

      // Créer l'entrée dans la base de données
      await supabase.from("referrals").insert({
        referrer_id: userId,
        referral_code: code,
        status: "pending",
      });
    } catch (error) {
      console.error("Error generating referral code:", error);
    }
  };

  const copyToClipboard = () => {
    const url = `${window.location.origin}/signup?ref=${referralCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const completedCount = referrals.filter((r) => r.status === "completed").length;
  const totalRewards = referrals
    .filter((r) => r.status === "completed" && r.reward_amount)
    .reduce((sum, r) => sum + (r.reward_amount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: "Aperçu", href: "/dashboard" }, { label: "Parrainage" }]} />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Programme de parrainage</h1>
        <p className="text-gray-400">Invitez vos amis et gagnez des récompenses</p>
      </div>

      {/* Section explicative */}
      <div
        className="rounded-2xl p-6 border mb-8"
        style={{
          backgroundColor: "#14161b",
          borderColor: "#1f232b",
        }}
      >
        <div className="flex items-start gap-3 mb-4">
          <div
            className="p-2 rounded-lg flex-shrink-0"
            style={{ backgroundColor: "rgba(46,108,246,0.1)" }}
          >
            <Gift className="w-5 h-5" style={{ color: "#2E6CF6" }} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white mb-3">Comment ça fonctionne ?</h2>
            <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
              <p>
                Le programme de parrainage Comptalyze vous permet de gagner des récompenses en invitant vos amis, collègues ou connaissances à rejoindre notre plateforme.
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-[#00D084] font-bold mt-0.5">1.</span>
                  <p>
                    <strong className="text-white">Partagez votre code unique</strong> : Copiez votre lien de parrainage et partagez-le via email, réseaux sociaux, ou tout autre moyen de communication.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#00D084] font-bold mt-0.5">2.</span>
                  <p>
                    <strong className="text-white">Votre filleul s'inscrit</strong> : La personne que vous parrainez doit utiliser votre lien pour créer son compte Comptalyze.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#00D084] font-bold mt-0.5">3.</span>
                  <p>
                    <strong className="text-white">Récompense automatique</strong> : Dès que votre filleul s'abonne à un plan payant (Pro ou Premium), vous recevez automatiquement votre récompense.
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: "rgba(0,208,132,0.1)", border: "1px solid rgba(0,208,132,0.2)" }}>
                <p className="text-xs text-gray-300">
                  <strong className="text-white">💡 Astuce :</strong> Plus vous parrainez, plus vous gagnez ! Les récompenses s'accumulent et peuvent être utilisées pour réduire le coût de votre abonnement ou être converties en crédits.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Code de parrainage */}
        <div
          className="rounded-2xl p-6 border"
          style={{
            backgroundColor: "#14161b",
            borderColor: "#1f232b",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Gift className="w-6 h-6" style={{ color: "#00D084" }} />
            <h2 className="text-xl font-semibold text-white">Votre code de parrainage</h2>
          </div>

          <div className="mb-4">
            <div
              className="p-4 rounded-lg flex items-center justify-between"
              style={{ backgroundColor: "#0e0f12" }}
            >
              <code className="text-white font-mono">{referralCode}</code>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: copied ? "#00D08420" : "#2d3441",
                  color: copied ? "#00D084" : "#9ca3af",
                }}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copier
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-400">
            Partagez ce lien avec vos amis pour qu'ils s'inscrivent et vous recevrez une récompense !
          </p>
        </div>

        {/* Statistiques */}
        <div
          className="rounded-2xl p-6 border"
          style={{
            backgroundColor: "#14161b",
            borderColor: "#1f232b",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6" style={{ color: "#2E6CF6" }} />
            <h2 className="text-xl font-semibold text-white">Vos statistiques</h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Parrainages réussis</p>
              <p className="text-3xl font-bold text-white">{completedCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Récompenses totales</p>
              <p className="text-3xl font-bold" style={{ color: "#00D084" }}>
                {totalRewards.toFixed(2)} €
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des parrainages */}
      <div
        className="rounded-2xl p-6 border"
        style={{
          backgroundColor: "#14161b",
          borderColor: "#1f232b",
        }}
      >
        <h2 className="text-xl font-semibold text-white mb-4">Historique des parrainages</h2>

        {referrals.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto mb-4" style={{ color: "#6b7280" }} />
            <p className="text-gray-400">Aucun parrainage pour le moment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {referrals.map((referral) => (
              <div
                key={referral.id}
                className="p-4 rounded-lg"
                style={{ backgroundColor: "#0e0f12" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{referral.referral_code}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(referral.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      referral.status === "completed"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {referral.status === "completed" ? "Complété" : "En attente"}
                  </span>
                </div>
                {referral.reward_amount && (
                  <p className="text-sm text-gray-400 mt-2">
                    Récompense : <span className="text-white">{referral.reward_amount} €</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



