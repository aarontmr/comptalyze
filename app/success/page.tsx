"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Check, ArrowRight, Sparkles, RefreshCw } from "lucide-react";
import logo from "@/public/logo.png";
import { supabase } from "@/lib/supabaseClient";
import { getUserSubscription } from "@/lib/subscriptionUtils";
import { trackSignup } from "@/app/actions/trackSignup";
import { getAttributionData } from "@/lib/attributionUtils";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const paymentIntent = searchParams.get("payment_intent");
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [conversionTracked, setConversionTracked] = useState(false);

  useEffect(() => {
    // Vérifier que nous avons bien un identifiant de paiement
    if (sessionId || paymentIntent) {
      setLoading(false);
      setShowConfetti(true);
      
      // Animation de confettis
      setTimeout(() => setShowConfetti(false), 3000);

      // Vérifier l'activation de l'abonnement
      checkSubscriptionStatus();

      // Track conversions (une seule fois)
      if (!conversionTracked) {
        trackConversions();
      }
    } else {
      setLoading(false);
      setCheckingSubscription(false);
    }
  }, [sessionId, paymentIntent]);

  const trackConversions = async () => {
    try {
      console.log("📊 Tracking conversions...");

      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn("⚠️ No user found for conversion tracking");
        return;
      }

      // Get attribution data
      const attribution = getAttributionData();

      // 1) Track signup in database
      await trackSignup({
        userId: user.id,
        email: user.email!,
        utmSource: attribution.utmSource,
        utmMedium: attribution.utmMedium,
        utmCampaign: attribution.utmCampaign,
        utmContent: attribution.utmContent,
        utmTerm: attribution.utmTerm,
        gclid: attribution.gclid,
        fbclid: attribution.fbclid,
        landingSlug: attribution.landingSlug,
        referrer: attribution.referrer,
      });

      console.log("✅ Signup tracked in database");

      // 2) Fire Google Ads conversion (if available)
      const googleAdsConvId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONV_ID;
      const googleAdsConvLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONV_LABEL;

      if (googleAdsConvId && googleAdsConvLabel && (window as any).gtag) {
        (window as any).gtag("event", "conversion", {
          send_to: `${googleAdsConvId}/${googleAdsConvLabel}`,
          transaction_id: sessionId || paymentIntent || user.id,
        });
        console.log("✅ Google Ads conversion fired");
      }

      // 3) Fire GA4 event
      if ((window as any).gtag) {
        (window as any).gtag("event", "signup_complete", {
          method: "email",
          user_id: user.id,
          utm_source: attribution.utmSource,
          utm_campaign: attribution.utmCampaign,
        });
        console.log("✅ GA4 signup_complete event fired");
      }

      // 4) Fire GTM event
      if ((window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: "signup_complete",
          user_id: user.id,
          email: user.email,
          utm_source: attribution.utmSource,
          utm_campaign: attribution.utmCampaign,
        });
        console.log("✅ GTM signup_complete event fired");
      }

      // 5) Fire Meta Pixel CompleteRegistration
      if ((window as any).fbq) {
        (window as any).fbq("track", "CompleteRegistration", {
          content_name: "Signup",
          status: "completed",
        });
        console.log("✅ Meta Pixel CompleteRegistration fired");
      }

      setConversionTracked(true);
    } catch (error) {
      console.error("❌ Error tracking conversions:", error);
    }
  };

  const checkSubscriptionStatus = async (currentRetry: number = 0) => {
    console.log(`🔍 Vérification du statut de l'abonnement (tentative ${currentRetry + 1}/10)...`);
    
    try {
      // Forcer le refresh de la session Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
      
      if (sessionError) {
        console.error('❌ Erreur refresh session:', sessionError);
      } else {
        console.log('✅ Session rafraîchie');
      }

      // Récupérer l'utilisateur avec les métadonnées à jour
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('❌ Erreur récupération utilisateur:', userError);
        setCheckingSubscription(false);
        return;
      }

      console.log('👤 Utilisateur récupéré:', user.id);
      console.log('📋 Métadonnées:', user.user_metadata);

      const subscription = getUserSubscription(user);
      console.log('📊 Abonnement détecté:', subscription);

      if (subscription.isPro || subscription.isPremium) {
        console.log('✅ Abonnement actif détecté!');
        setSubscriptionActive(true);
        setCheckingSubscription(false);
      } else {
        console.log('⏳ Abonnement pas encore actif, retry dans 2s...');
        
        // Après 3 tentatives (6 secondes), essayer de forcer la synchronisation avec Stripe
        if (currentRetry === 3) {
          console.log('🔄 Tentative de synchronisation manuelle avec Stripe...');
          try {
            const syncRes = await fetch('/api/sync-stripe-subscription', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id }),
            });

            const syncData = await syncRes.json();
            
            if (syncRes.ok) {
              console.log('✅ Synchronisation manuelle réussie!');
              // Forcer un nouveau check immédiatement
              setTimeout(() => {
                setRetryCount(currentRetry + 1);
                checkSubscriptionStatus(currentRetry + 1);
              }, 1000);
              return;
            } else {
              console.warn('⚠️ Synchronisation manuelle échouée:', syncData.error);
            }
          } catch (syncError) {
            console.error('❌ Erreur synchronisation:', syncError);
          }
        }
        
        // Retry jusqu'à 10 fois (20 secondes total)
        if (currentRetry < 10) {
          setTimeout(() => {
            setRetryCount(currentRetry + 1);
            checkSubscriptionStatus(currentRetry + 1);
          }, 2000);
        } else {
          console.warn('⚠️ Délai d\'attente dépassé (20s). Le webhook Stripe peut prendre plus de temps.');
          console.warn('💡 Tentez une synchronisation manuelle ou allez dans votre dashboard.');
          setCheckingSubscription(false);
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification:', error);
      setCheckingSubscription(false);
    }
  };

  return (
    <main
      className="min-h-screen w-full flex items-center justify-center text-white relative overflow-hidden"
      style={{ backgroundColor: "#0e0f12", fontFamily: "Poppins, sans-serif" }}
    >
      {/* Effet de fond animé */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ 
            background: "radial-gradient(circle, #00D084 0%, transparent 70%)",
            animation: "pulse 4s ease-in-out infinite"
          }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ 
            background: "radial-gradient(circle, #2E6CF6 0%, transparent 70%)",
            animation: "pulse 4s ease-in-out infinite 2s"
          }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-4 text-center relative z-10">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="relative w-16 h-16">
              <div
                className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
                style={{
                  borderColor: "#2E6CF6 transparent transparent transparent",
                }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Logo en haut */}
            <div className="mb-8">
              <Link href="/" className="inline-block">
                <Image
                  src={logo}
                  alt="Comptalyze"
                  width={180}
                  height={45}
                  className="h-10 w-auto mx-auto"
                  priority
                />
              </Link>
            </div>

            {/* Icône de succès avec animation */}
            <div className="relative inline-block">
              <div 
                className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6"
                style={{
                  background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                  boxShadow: "0 0 60px rgba(0, 208, 132, 0.4)",
                  animation: showConfetti ? "scaleIn 0.5s ease-out" : "none"
                }}
              >
                <Check className="w-12 h-12 text-white" strokeWidth={3} />
              </div>
              {showConfetti && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-8 -left-8 animate-ping" />
                  <Sparkles className="w-6 h-6 text-blue-400 absolute -top-6 -right-6 animate-ping" style={{ animationDelay: "0.2s" }} />
                  <Sparkles className="w-7 h-7 text-green-400 absolute -bottom-6 -left-10 animate-ping" style={{ animationDelay: "0.4s" }} />
                </div>
              )}
            </div>

            {/* Titre et message */}
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Paiement réussi !
              </h1>
              <p className="text-xl text-gray-300 mb-2">
                Merci pour votre confiance 🎉
              </p>
              <p className="text-base text-gray-400">
                Votre abonnement a été activé avec succès. Vous avez maintenant accès à toutes les fonctionnalités.
              </p>
            </div>

            {/* Statut de l'abonnement */}
            {checkingSubscription && (
              <div 
                className="rounded-xl p-6 mb-6"
                style={{
                  backgroundColor: "#14161b",
                  border: "1px solid rgba(46, 108, 246, 0.3)",
                }}
              >
                <div className="flex items-center justify-center gap-3">
                  <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
                  <span className="text-sm text-gray-300">
                    Activation de votre abonnement en cours... ({retryCount + 1}/10)
                  </span>
                </div>
              </div>
            )}

            {!checkingSubscription && subscriptionActive && (
              <div 
                className="rounded-xl p-6 mb-6"
                style={{
                  backgroundColor: "rgba(0, 208, 132, 0.1)",
                  border: "1px solid rgba(0, 208, 132, 0.3)",
                }}
              >
                <div className="flex items-center justify-center gap-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-semibold text-green-400">
                    Abonnement activé avec succès !
                  </span>
                </div>
              </div>
            )}

            {!checkingSubscription && !subscriptionActive && (
              <div 
                className="rounded-xl p-6 mb-6"
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                }}
              >
                <div className="text-center">
                  <p className="text-sm text-yellow-400 mb-1 font-semibold">
                    ⚠️ L'activation prend plus de temps que prévu
                  </p>
                  <p className="text-xs text-gray-400 mb-4">
                    Le webhook Stripe n'a pas encore activé votre abonnement. Votre paiement est confirmé !
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={async () => {
                        setCheckingSubscription(true);
                        setRetryCount(0);
                        
                        // Forcer la synchronisation avec Stripe
                        try {
                          const { data: { user } } = await supabase.auth.getUser();
                          if (user) {
                            const syncRes = await fetch('/api/sync-stripe-subscription', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ userId: user.id }),
                            });
                            
                            if (syncRes.ok) {
                              console.log('✅ Synchronisation forcée réussie');
                              // Re-check immédiatement
                              setTimeout(() => checkSubscriptionStatus(0), 500);
                            } else {
                              const data = await syncRes.json();
                              console.error('❌ Erreur sync:', data.error);
                              alert('Erreur: ' + data.error);
                              setCheckingSubscription(false);
                            }
                          }
                        } catch (err) {
                          console.error('❌ Erreur:', err);
                          setCheckingSubscription(false);
                        }
                      }}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all hover:scale-105"
                      style={{
                        background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                        boxShadow: "0 4px 15px rgba(46,108,246,0.3)",
                      }}
                    >
                      <RefreshCw className="w-5 h-5" />
                      Forcer la synchronisation avec Stripe
                    </button>
                    <button
                      onClick={() => {
                        setCheckingSubscription(true);
                        setRetryCount(0);
                        checkSubscriptionStatus();
                      }}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                      style={{
                        border: "1px solid rgba(46,108,246,0.5)",
                        backgroundColor: "transparent",
                        color: "#60a5fa",
                      }}
                    >
                      <RefreshCw className="w-4 h-4" />
                      Vérifier à nouveau
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    💡 Si le problème persiste, contactez le support avec votre session_id
                  </p>
                </div>
              </div>
            )}

            {/* Cartes d'informations */}
            <div className="grid sm:grid-cols-3 gap-4 mt-8">
              <div 
                className="rounded-xl p-4"
                style={{
                  backgroundColor: "#14161b",
                  border: "1px solid #1f232b",
                }}
              >
                <div className="text-2xl mb-2">✨</div>
                <div className="text-sm font-semibold text-white mb-1">Accès immédiat</div>
                <div className="text-xs text-gray-400">
                  {subscriptionActive ? "Actif maintenant !" : "Activation en cours..."}
                </div>
              </div>

              <div 
                className="rounded-xl p-4"
                style={{
                  backgroundColor: "#14161b",
                  border: "1px solid #1f232b",
                }}
              >
                <div className="text-2xl mb-2">📧</div>
                <div className="text-sm font-semibold text-white mb-1">Email de confirmation</div>
                <div className="text-xs text-gray-400">Envoyé dans quelques instants</div>
              </div>

              <div 
                className="rounded-xl p-4"
                style={{
                  backgroundColor: "#14161b",
                  border: "1px solid #1f232b",
                }}
              >
                <div className="text-2xl mb-2">🔒</div>
                <div className="text-sm font-semibold text-white mb-1">Paiement sécurisé</div>
                <div className="text-xs text-gray-400">Par Stripe</div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Link
                href="/dashboard"
                className="group inline-flex items-center justify-center gap-2 rounded-lg px-8 py-4 text-base font-medium text-white transition-all duration-200 hover:scale-[1.02] shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #00D084 0%, #2E6CF6 100%)",
                  boxShadow: "0 8px 28px rgba(46,108,246,0.35)",
                }}
              >
                Accéder au tableau de bord
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/dashboard/compte"
                className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-4 text-sm font-medium text-gray-300 transition-all duration-200 hover:text-white hover:bg-opacity-80"
                style={{
                  border: "1px solid #2d3441",
                  backgroundColor: "#14161b",
                }}
              >
                Voir mon compte
              </Link>
            </div>

            {/* Note de bas de page */}
            <div className="mt-12 pt-8 border-t" style={{ borderColor: "#1f232b" }}>
              <p className="text-sm text-gray-500">
                Une question ? Contactez notre support à{" "}
                <a href="mailto:support@comptalyze.com" className="text-blue-400 hover:text-blue-300">
                  support@comptalyze.com
                </a>
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes scaleIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.1;
            transform: scale(1);
          }
          50% {
            opacity: 0.15;
            transform: scale(1.05);
          }
        }
      `}</style>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main
        className="min-h-screen w-full flex items-center justify-center text-white"
        style={{ backgroundColor: "#0e0f12", fontFamily: "Poppins, sans-serif" }}
      >
        <div className="relative w-16 h-16">
          <div
            className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
            style={{
              borderColor: "#2E6CF6 transparent transparent transparent",
            }}
          />
        </div>
      </main>
    }>
      <SuccessContent />
    </Suspense>
  );
}

