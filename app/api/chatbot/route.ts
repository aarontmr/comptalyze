import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// OpenAI client
let openai: OpenAI | null = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
} catch (error) {
  console.warn('OpenAI client non initialisé:', error);
}

// Prompts système selon le plan
const getSystemPrompt = (plan: string, userData?: any) => {
  const basePrompt = `Tu es ComptaBot, l'assistant intelligent de Comptalyze 🤖 - un expert comptable français spécialisé dans les micro-entreprises et le statut auto-entrepreneur.

Tu es amical, professionnel et empathique. Tu utilises un ton chaleureux et accessible en français.

Tu peux aider sur :
• Les cotisations URSSAF et leur calcul
• Les déclarations fiscales et administratives
• Le statut micro-entrepreneur (création, gestion, optimisation)
• Les taux de TVA et seuils de CA
• Les charges déductibles
• Les conseils d'optimisation fiscale

RÈGLES IMPORTANTES :
- Réponds TOUJOURS de manière concise (max 250 mots)
- Utilise des émojis pour rendre tes réponses plus conviviales (mais avec modération)
- Structure tes réponses avec des listes à puces quand approprié
- Sois précis et factuel, base-toi sur la réglementation française actuelle
- Si tu ne sais pas, dis-le honnêtement
- Réponds UNIQUEMENT en français`;

  if (plan === 'premium') {
    return basePrompt + `\n\n✨ L'utilisateur est PREMIUM - tu peux :
- Analyser ses données personnelles pour des conseils sur-mesure
- Proposer des optimisations fiscales avancées
- Suggérer des actions dans Comptalyze (exports, simulations, etc.)
${userData ? `\n\nDONNÉES UTILISATEUR :\n${JSON.stringify(userData, null, 2)}` : ''}`;
  } else if (plan === 'pro') {
    return basePrompt + `\n\n⚡ L'utilisateur est PRO - tu peux :
- Donner des conseils généraux approfondis
- Expliquer les fonctionnalités Comptalyze qui peuvent l'aider
- Suggérer un passage à Premium pour les fonctionnalités avancées (analytics IA, pré-remplissage URSSAF)`;
  } else {
    return basePrompt + `\n\n🌱 L'utilisateur est GRATUIT (Free) - tu peux :
- Répondre aux questions générales sur la micro-entreprise
- Expliquer le fonctionnement de Comptalyze
- Suggérer gentiment les plans Pro (7,90€/mois) ou Premium (15,90€/mois) pour des fonctionnalités avancées
- Rappeler qu'il a une limite de 30 messages/mois sur le plan gratuit`;
  }
};

// Fonction pour récupérer les données utilisateur (pour Premium uniquement)
async function getUserData(userId: string) {
  try {
    // Récupérer les données d'onboarding
    const { data: onboardingData } = await supabaseAdmin
      .from('user_onboarding_data')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Récupérer les intégrations
    const { data: integrations } = await supabaseAdmin
      .from('integration_tokens')
      .select('provider, is_active, last_sync_at')
      .eq('user_id', userId)
      .eq('is_active', true);

    // Récupérer les records CA
    const { data: records } = await supabaseAdmin
      .from('ca_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(12);

    if (!records || records.length === 0) return null;

    const MONTHS = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const summary = records.map((r) => ({
      mois: `${MONTHS[r.month - 1]} ${r.year}`,
      activite: r.activity_type,
      ca: Number(r.amount_eur).toFixed(2),
      cotisations: Number(r.computed_contrib_eur).toFixed(2),
      net: Number(r.computed_net_eur).toFixed(2),
    }));

    const totalCA = records.reduce((sum, r) => sum + Number(r.amount_eur), 0);
    const totalContrib = records.reduce((sum, r) => sum + Number(r.computed_contrib_eur), 0);
    const avgCA = totalCA / records.length;
    const tauxCotisation = totalCA > 0 ? ((totalContrib / totalCA) * 100).toFixed(1) : '0';

    // Contexte fiscal
    let fiscalContext = {};
    if (onboardingData) {
      fiscalContext = {
        regimeIR: onboardingData.ir_mode === 'versement_liberatoire' 
          ? `Versement Libératoire (${onboardingData.ir_rate}%)`
          : 'Barème Progressif',
        acre: onboardingData.has_acre
          ? `Oui - Année ${onboardingData.acre_year} (création: ${onboardingData.company_creation_date})`
          : 'Non',
      };
    }

    // Intégrations actives
    const activeIntegrations = integrations?.map(i => i.provider) || [];

    return {
      enregistrements: summary.slice(0, 3), // Derniers 3 mois
      stats: {
        caTotal: totalCA.toFixed(2),
        caMoyen: avgCA.toFixed(2),
        cotisationsTotal: totalContrib.toFixed(2),
        tauxMoyen: tauxCotisation,
      },
      contexteFiscal: fiscalContext,
      integrations: activeIntegrations.length > 0 
        ? `Connecté à: ${activeIntegrations.join(', ')}`
        : 'Aucune intégration',
    };
  } catch (error) {
    console.error('Erreur récupération données utilisateur:', error);
    return null;
  }
}

// Fonction fallback sans OpenAI
function generateFallbackResponse(message: string, plan: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Questions sur l'identité du bot / Qui es-tu / Bonjour
  if (lowerMessage.includes('qui es') || lowerMessage.includes('qui est') || 
      lowerMessage.includes('tu es qui') || lowerMessage.includes('présent') ||
      lowerMessage.includes('bonjour') || lowerMessage.includes('salut') ||
      lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
    return `Bonjour ! 👋 Je suis **ComptaBot**, l'assistant intelligent de Comptalyze 🤖\n\nJe suis spécialisé dans :\n• Les **micro-entreprises** françaises\n• Les **cotisations URSSAF** et leur calcul\n• Les **déclarations fiscales**\n• L'**optimisation** de votre activité\n\nJe peux répondre à toutes tes questions sur la gestion de ta micro-entreprise !\n\n${plan === 'free' ? '💡 *Avec un compte Premium, j\'analyse tes données personnelles pour des conseils sur-mesure !*' : ''}`;
  }
  
  // Remerciements
  if (lowerMessage.includes('merci') || lowerMessage.includes('thank')) {
    return `De rien ! 😊 Je suis là pour t'aider.\n\nN'hésite pas si tu as d'autres questions sur ta micro-entreprise !`;
  }
  
  // Au revoir
  if (lowerMessage.includes('au revoir') || lowerMessage.includes('bye') || 
      lowerMessage.includes('ciao') || lowerMessage.includes('à bientôt')) {
    return `À bientôt ! 👋 Bonne gestion de ta micro-entreprise !\n\nReviens me voir si tu as des questions. 😊`;
  }
  
  // Questions sur les taux URSSAF
  if (lowerMessage.includes('taux') || lowerMessage.includes('cotisation')) {
    return `📊 **Taux de cotisations URSSAF 2024** :\n\n• Prestations de services (BIC) : **21,2%**\n• Activités libérales (BNC) : **21,1%**\n• Ventes de marchandises : **12,3%**\n• Hébergement touristique : **6%**\n\nCes cotisations couvrent la santé, la retraite, les allocations familiales et la CSG-CRDS.\n\n${plan === 'free' ? '💡 Avec Comptalyze Pro, calculez automatiquement vos cotisations !' : ''}`;
  }
  
  // Questions sur la déclaration
  if (lowerMessage.includes('déclarer') || lowerMessage.includes('déclaration')) {
    return `📝 **Comment déclarer sur l'URSSAF** :\n\n1. Rendez-vous sur **autoentrepreneur.urssaf.fr**\n2. Connectez-vous avec votre SIRET\n3. Déclarez votre CA du mois/trimestre écoulé\n4. Payez vos cotisations en ligne\n\n📅 **Délais** :\n• Mensuel : avant la fin du mois suivant\n• Trimestriel : avant la fin du mois suivant le trimestre\n\n${plan === 'premium' ? '✨ Avec Comptalyze Premium, pré-remplissez automatiquement vos déclarations !' : ''}`;
  }
  
  // Questions sur la TVA
  if (lowerMessage.includes('tva')) {
    return `💶 **TVA en micro-entreprise** :\n\nPar défaut, vous êtes **exonéré de TVA** (franchise en base).\n\n**Seuils 2024** :\n• Prestations de services : 36 800 €\n• Ventes : 91 900 €\n\nAu-delà, vous devez facturer et déclarer la TVA.\n\n${plan === 'free' ? '💡 Simulez l\'impact de la TVA avec Comptalyze Pro !' : ''}`;
  }
  
  // Questions sur les plans Comptalyze
  if (lowerMessage.includes('prix') || lowerMessage.includes('plan') || lowerMessage.includes('premium') || lowerMessage.includes('pro')) {
    return `💎 **Plans Comptalyze** :\n\n🌱 **Gratuit** : Calculateur de base, 30 messages/mois\n⚡ **Pro** (7,90€/mois) : Factures, historique illimité, exports PDF\n✨ **Premium** (15,90€/mois) : Tout Pro + Assistant IA illimité + Analytics avancés + Pré-remplissage URSSAF\n\nDécouvrez les plans sur : comptalyze.com/pricing`;
  }
  
  // Questions sur les seuils
  if (lowerMessage.includes('seuil') || lowerMessage.includes('limite')) {
    return `📊 **Seuils de CA en micro-entreprise** :\n\n• Prestations de services (BIC/BNC) : **77 700 €**\n• Ventes de marchandises : **188 700 €**\n\nAu-delà, vous devez passer au régime réel.\n\n${plan === 'premium' ? '✨ Je peux analyser votre progression et vous alerter si vous approchez des seuils !' : ''}`;
  }
  
  // Questions sur Comptalyze
  if (lowerMessage.includes('comptalyze') || lowerMessage.includes('comment') && lowerMessage.includes('marche')) {
    return `🚀 **Comptalyze**, c'est :\n\n• 🧮 Calcul automatique des cotisations URSSAF\n• 📄 Génération de factures conformes\n• 📊 Suivi de votre CA et statistiques\n• 🤖 Assistant IA pour vos questions\n• 📱 Interface moderne et intuitive\n\nDécouvrez toutes les fonctionnalités sur le tableau de bord !`;
  }
  
  // Question générique
  return `Je suis ComptaBot, ton assistant Comptalyze ! 👋\n\nJe peux t'aider sur :\n• Les cotisations URSSAF\n• Les déclarations fiscales\n• Le statut micro-entrepreneur\n• Les taux et seuils\n• L'utilisation de Comptalyze\n\nPose-moi une question plus précise, je serai ravi d'y répondre ! 😊`;
}

export async function POST(req: NextRequest) {
  try {
    const { message, userId, plan = 'free', conversationHistory } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 });
    }

    // Limiter la taille du message
    if (message.length > 1000) {
      return NextResponse.json({ error: 'Message trop long (max 1000 caractères)' }, { status: 400 });
    }

    // Récupérer les données utilisateur si Premium
    let userData = null;
    if (plan === 'premium' && userId) {
      userData = await getUserData(userId);
    }

    // Construire le prompt système
    const systemPrompt = getSystemPrompt(plan, userData);

    // Construire l'historique de messages
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: systemPrompt,
      },
    ];

    // Ajouter l'historique de conversation (limité aux 10 derniers messages)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.slice(-10).forEach((msg: any) => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role,
            content: msg.content,
          });
        }
      });
    }

    // Ajouter le message actuel
    messages.push({
      role: 'user',
      content: message,
    });

    let response: string;

    // Utiliser OpenAI si disponible
    console.log('🔍 DEBUG OPENAI:');
    console.log('  - Client OpenAI:', openai ? '✅ INITIALISÉ' : '❌ NULL');
    console.log('  - Variable OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ PRÉSENTE' : '❌ ABSENTE');
    
    if (!openai || !process.env.OPENAI_API_KEY) {
      console.log('⚠️ MODE FALLBACK ACTIVÉ - OpenAI non disponible');
      response = generateFallbackResponse(message, plan);
    } else {
      try {
        // Modèle selon le plan
        const model = plan === 'premium' ? 'gpt-4o-mini' : 'gpt-4o-mini';
        const maxTokens = plan === 'premium' ? 500 : 300;

        const completion = await openai.chat.completions.create({
          model: model,
          messages: messages as any,
          max_tokens: maxTokens,
          temperature: 0.7,
          presence_penalty: 0.3,
          frequency_penalty: 0.3,
        });

        response = completion.choices[0]?.message?.content || generateFallbackResponse(message, plan);
      } catch (openaiError: any) {
        console.error('❌ ERREUR OPENAI DÉTAILLÉE:');
        console.error('  - Message:', openaiError.message);
        console.error('  - Status:', openaiError.status);
        console.error('  - Code:', openaiError.code);
        console.error('  - Type:', openaiError.type);
        response = generateFallbackResponse(message, plan);
      }
    }

    // Ajouter une suggestion de upgrade pour les free users de temps en temps
    if (plan === 'free' && Math.random() < 0.2) {
      response += `\n\n💡 *Passez à Pro pour des réponses plus détaillées et aucune limite de messages !*`;
    }

    return NextResponse.json({ response }, { status: 200 });
  } catch (error: any) {
    console.error('Erreur API chatbot:', error);
    
    return NextResponse.json(
      {
        response: 'Désolé, une erreur est survenue. Réessaye dans quelques instants ! 🙏',
      },
      { status: 200 } // Renvoyer 200 pour éviter les erreurs côté client
    );
  }
}

