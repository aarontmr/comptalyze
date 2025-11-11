// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import { createCheckoutSession } from "@/app/lib/billing/createCheckoutSession";
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs'; // Stripe ne fonctionne pas en edge

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    // Vérifier que STRIPE_SECRET_KEY est défini
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY n'est pas défini dans les variables d'environnement");
      return NextResponse.json({ error: "Configuration Stripe manquante" }, { status: 500 });
    }

    const { plan, userId } = await req.json(); // "pro" or "premium" or "pro_yearly" or "premium_yearly", userId from frontend

    if (!plan) {
      return NextResponse.json({ error: "Le plan est requis" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "Vous devez être connecté pour souscrire à un abonnement" }, { status: 401 });
    }

    // Vérifier que le plan est valide
    const validPlans = ["pro", "premium", "pro_yearly", "premium_yearly"];
    if (!validPlans.includes(plan)) {
      return NextResponse.json({ error: `Plan invalide: ${plan}. Les plans valides sont: pro, premium, pro_yearly, premium_yearly` }, { status: 400 });
    }

    // Récupérer l'email de l'utilisateur
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (userError || !userData?.user?.email) {
      console.error('Erreur récupération utilisateur:', userError);
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Déterminer le plan de base (sans _yearly)
    const basePlan = plan.replace('_yearly', '') as 'pro' | 'premium';
    const isYearly = plan.includes('_yearly');

    const prices: Record<string, string> = {
      pro: process.env.STRIPE_PRICE_PRO || "",
      premium: process.env.STRIPE_PRICE_PREMIUM || "",
      pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY || "",
      premium_yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY || "",
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

    // 🎯 Créer la session d'abonnement
    const { url, sessionId } = await createCheckoutSession({
      plan: basePlan,
      priceId: prices[plan],
      successUrl: `${baseUrl}/success`,
      cancelUrl: `${baseUrl}/cancel`,
      userId,
      email: userData.user.email,
      yearly: isYearly,
    });

    console.log(`✅ Session Checkout créée: ${sessionId} pour ${basePlan}`);

    return NextResponse.json({ url, sessionId });
  } catch (err: any) {
    console.error("Erreur checkout:", err);
    const errorMessage = err.type === 'StripeInvalidRequestError' 
      ? err.message 
      : "Une erreur est survenue lors de la création de la session de paiement";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
