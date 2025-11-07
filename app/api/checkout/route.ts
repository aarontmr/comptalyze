// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = 'nodejs'; // Stripe ne fonctionne pas en edge

function getStripeClient(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY n'est pas défini dans les variables d'environnement");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-10-29.clover", // or latest supported
  });
}

export async function POST(req: Request) {
  try {
    // Vérifier que STRIPE_SECRET_KEY est défini
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY n'est pas défini dans les variables d'environnement");
      return NextResponse.json({ error: "Configuration Stripe manquante" }, { status: 500 });
    }

    const stripe = getStripeClient();

    const { plan, userId } = await req.json(); // "pro" or "premium", userId from frontend

    if (!plan) {
      return NextResponse.json({ error: "Le plan est requis" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "Vous devez être connecté pour souscrire à un abonnement" }, { status: 401 });
    }

    // Vérifier que le plan est valide
    const validPlans = ["pro", "premium"];
    if (!validPlans.includes(plan)) {
      return NextResponse.json({ error: `Plan invalide: ${plan}. Les plans valides sont: pro, premium` }, { status: 400 });
    }

    const prices: Record<string, string> = {
      pro: process.env.STRIPE_PRICE_PRO || "",
      premium: process.env.STRIPE_PRICE_PREMIUM || "",
    };

    // Vérifier que le Price ID n'est pas vide et a le bon format
    if (!prices[plan] || !prices[plan].startsWith("price_")) {
      const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';
      
      let errorMessage: string;
      
      if (!prices[plan]) {
        if (isProduction) {
          // Instructions pour Vercel/Production
          errorMessage = `STRIPE_PRICE_${plan.toUpperCase()} n'est pas configuré sur Vercel.\n\n` +
            `🔧 Configuration sur Vercel :\n` +
            `1. Allez sur vercel.com et connectez-vous\n` +
            `2. Sélectionnez votre projet Comptalyze\n` +
            `3. Allez dans Settings > Environment Variables\n` +
            `4. Ajoutez la variable : STRIPE_PRICE_${plan.toUpperCase()}\n` +
            `5. Valeur : price_VOTRE_ID_ICI (votre Price ID Stripe)\n` +
            `6. Sélectionnez "Production", "Preview" et "Development"\n` +
            `7. Cliquez sur "Save"\n` +
            `8. Redéployez votre application (Settings > Deployments > Redeploy)\n\n` +
            `💡 Pour obtenir votre Price ID :\n` +
            `- Allez dans Stripe Dashboard > Products\n` +
            `- Créez le produit "Comptalyze ${plan.charAt(0).toUpperCase() + plan.slice(1)}"\n` +
            `- Copiez le Price ID (commence par "price_")`;
        } else {
          // Instructions pour développement local
          errorMessage = `STRIPE_PRICE_${plan.toUpperCase()} n'est pas défini dans votre fichier .env.local.\n\n` +
            `1. Créez ou ouvrez le fichier .env.local à la racine du projet\n` +
            `2. Ajoutez : STRIPE_PRICE_${plan.toUpperCase()}=price_VOTRE_ID_ICI\n` +
            `3. Redémarrez le serveur (Ctrl+C puis npm run dev)\n\n` +
            `Pour obtenir votre Price ID :\n` +
            `- Allez dans Stripe Dashboard > Products\n` +
            `- Créez le produit "Comptalyze ${plan.charAt(0).toUpperCase() + plan.slice(1)}"\n` +
            `- Copiez le Price ID (commence par "price_")`;
        }
      } else {
        errorMessage = `Le Price ID pour le plan ${plan} est invalide. Il doit commencer par "price_". ` +
          (isProduction 
            ? `Vérifiez STRIPE_PRICE_${plan.toUpperCase()} dans les Environment Variables de Vercel.`
            : `Vérifiez STRIPE_PRICE_${plan.toUpperCase()} dans .env.local`);
      }
      
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    // Utiliser NEXT_PUBLIC_BASE_URL en priorité pour éviter localhost en production
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://comptalyze.com';

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: prices[plan], quantity: 1 }],
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
      automatic_tax: { enabled: true },
      // Activer les codes promo (LAUNCH5, etc.)
      allow_promotion_codes: true,
      // Passer l'userId pour que le webhook puisse identifier l'utilisateur
      client_reference_id: userId,
      metadata: {
        userId: userId,
        plan: plan, // "pro" ou "premium"
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "Impossible de créer la session Stripe" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Erreur checkout:", err);
    const errorMessage = err.type === 'StripeInvalidRequestError' 
      ? err.message 
      : "Une erreur est survenue lors de la création de la session de paiement";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
