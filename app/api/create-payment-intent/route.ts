import { NextResponse } from "next/server";
import Stripe from "stripe";

function getStripeClient(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY n'est pas défini");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-10-29.clover",
  });
}

export async function POST(req: Request) {
  try {
    console.log("🔄 API create-payment-intent appelée");
    
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("❌ STRIPE_SECRET_KEY n'est pas défini dans les variables d'environnement");
      return NextResponse.json({ error: "Configuration Stripe manquante" }, { status: 500 });
    }

    const stripe = getStripeClient();
    const { plan, userId, autoRenew = true } = await req.json();
    
    console.log("📥 Paramètres reçus:", { plan, userId, autoRenew });

    if (!plan) {
      return NextResponse.json({ error: "Le plan est requis" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "Vous devez être connecté pour souscrire à un abonnement" }, { status: 401 });
    }

    const validPlans = ["pro", "premium", "pro_yearly", "premium_yearly"];
    if (!validPlans.includes(plan)) {
      return NextResponse.json({ error: `Plan invalide: ${plan}` }, { status: 400 });
    }

    const prices: Record<string, string> = {
      pro: process.env.STRIPE_PRICE_PRO || "",
      premium: process.env.STRIPE_PRICE_PREMIUM || "",
      pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY || "",
      premium_yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY || "",
    };

    const priceId = prices[plan];
    console.log("💰 Price ID pour le plan", plan, ":", priceId);

    if (!priceId || !priceId.startsWith("price_")) {
      const isProduction = process.env.VERCEL_ENV === "production";
      let errorMessage: string;
      
      if (!priceId) {
        console.error(`❌ Price ID non défini pour le plan ${plan}`);
        errorMessage = isProduction
          ? `STRIPE_PRICE_${plan.toUpperCase()} n'est pas défini dans les variables d'environnement de Vercel`
          : `STRIPE_PRICE_${plan.toUpperCase()} n'est pas défini dans votre fichier .env.local`;
      } else {
        console.error(`❌ Price ID invalide pour le plan ${plan}:`, priceId);
        errorMessage = `Le Price ID pour le plan ${plan} est invalide. Il doit commencer par "price_".`;
      }
      
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    // Créer une session Stripe Checkout en mode embedded
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || req.headers.get('origin') || 'http://localhost:3000';
    
    // Pour les plans annuels sans renouvellement auto, on configure l'abonnement différemment
    const isYearly = plan.includes("yearly");
    const subscriptionData: any = {};
    
    if (isYearly && !autoRenew) {
      // Désactiver le renouvellement automatique
      subscriptionData.cancel_at_period_end = true;
    }
    
    console.log("🚀 Création de la session Stripe avec:", {
      mode: "subscription",
      priceId,
      ui_mode: "embedded",
      return_url: `${baseUrl}/success`,
    });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      ui_mode: "embedded",
      return_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      automatic_tax: { enabled: true },
      client_reference_id: userId,
      metadata: {
        userId: userId,
        plan: plan,
        autoRenew: autoRenew.toString(),
      },
      ...(Object.keys(subscriptionData).length > 0 && { subscription_data: subscriptionData }),
    });

    console.log("✅ Session Stripe créée:", session.id);

    if (!session.client_secret) {
      console.error("❌ Pas de client_secret dans la session Stripe");
      return NextResponse.json({ error: "Erreur lors de la création de la session" }, { status: 500 });
    }

    console.log("✅ ClientSecret généré avec succès");
    
    return NextResponse.json({
      clientSecret: session.client_secret,
    });
  } catch (error: any) {
    console.error("Erreur lors de la création du Payment Intent:", error);
    return NextResponse.json(
      { error: error.message || "Une erreur est survenue lors de la création du paiement" },
      { status: 500 }
    );
  }
}

