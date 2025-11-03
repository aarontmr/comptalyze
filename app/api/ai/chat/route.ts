import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// OpenAI client - peut être null si la clé n'est pas configurée
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

export async function POST(req: NextRequest) {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Token d\'authentification manquant' }, { status: 401 });
    }

    // Vérifier le token avec Supabase
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 401 });
    }

    const userId = user.id;

    // Vérifier le plan (Premium uniquement)
    const { getUserPlanServer } = await import('@/lib/plan');
    const plan = await getUserPlanServer(userId, user.user_metadata);

    if (plan !== 'premium') {
      return NextResponse.json({ error: 'Fonctionnalité réservée au plan Premium' }, { status: 403 });
    }

    const { message, conversationHistory } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 });
    }

    // Récupérer les enregistrements CA de l'utilisateur
    const { data: records, error: recordsError } = await supabaseAdmin
      .from('ca_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(12);

    if (recordsError) {
      console.error('Erreur lors de la récupération des enregistrements:', recordsError);
    }

    // Préparer les données pour le contexte
    const MONTHS = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    let contextData = '';
    if (records && records.length > 0) {
      const recordsSummary = records.map((r) => ({
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

      contextData = `\n\nCONTEXTE - Données de l'utilisateur (${records.length} enregistrements) :\n${JSON.stringify(recordsSummary, null, 2)}\n\nStatistiques :\n- CA moyen mensuel : ${avgCA.toFixed(2)} €\n- Total CA : ${totalCA.toFixed(2)} €\n- Total cotisations : ${totalContrib.toFixed(2)} €\n- Taux de cotisation moyen : ${tauxCotisation}%`;
    } else {
      contextData = '\n\nNOTE : L\'utilisateur n\'a pas encore enregistré de chiffres d\'affaires.';
    }

    // Construire l'historique de conversation
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: `Tu es un expert comptable français spécialisé dans les micro-entreprises, les cotisations URSSAF, et l'optimisation fiscale pour les indépendants. Tu donnes des conseils pratiques, précis et bienveillants en français.

${contextData}

IMPORTANT :
- Utilise les données de l'utilisateur quand elles sont disponibles pour donner des conseils personnalisés
- Réponds de manière concise mais complète (maximum 200 mots par réponse)
- Reste toujours professionnel et encourageant
- Si tu n'as pas les informations nécessaires, demande à l'utilisateur de les fournir
- Réponds UNIQUEMENT en français`,
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

    // Générer la réponse
    let response: string;

    if (!openai || !process.env.OPENAI_API_KEY) {
      // Fallback si OpenAI n'est pas configuré
      response = generateFallbackResponse(message, records || []);
    } else {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: messages as any,
          max_tokens: 300,
          temperature: 0.7,
        });

        response = completion.choices[0]?.message?.content || generateFallbackResponse(message, records || []);
      } catch (openaiError: any) {
        console.error('Erreur OpenAI:', openaiError);
        response = generateFallbackResponse(message, records || []);
      }
    }

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('Erreur lors du traitement du message:', error);
    
    // Toujours renvoyer du JSON
    return NextResponse.json({
      response: 'Désolé, une erreur est survenue. Veuillez réessayer votre question.',
    }, { status: 200 });
  }
}

// Fonction helper pour générer une réponse de fallback intelligente
function generateFallbackResponse(message: string, records: any[]): string {
  const lowerMessage = message.toLowerCase();

  // Calculer les statistiques si on a des données
  let stats: any = null;
  if (records.length > 0) {
    const totalCA = records.reduce((sum, r) => sum + Number(r.amount_eur), 0);
    const totalContrib = records.reduce((sum, r) => sum + Number(r.computed_contrib_eur), 0);
    const totalNet = records.reduce((sum, r) => sum + Number(r.computed_net_eur), 0);
    const avgCA = totalCA / records.length;
    const avgContrib = totalContrib / records.length;
    const taux = totalCA > 0 ? ((totalContrib / totalCA) * 100).toFixed(1) : '0';
    const projectionAnnuelle = avgCA * 12;
    
    // Dernier enregistrement
    const dernier = records[0];
    const avantDernier = records[1];
    let croissance = null;
    if (avantDernier) {
      const caDernier = Number(dernier.amount_eur);
      const caAvant = Number(avantDernier.amount_eur);
      if (caAvant > 0) {
        croissance = (((caDernier - caAvant) / caAvant) * 100).toFixed(1);
      }
    }

    stats = {
      totalCA,
      totalContrib,
      totalNet,
      avgCA,
      avgContrib,
      taux,
      projectionAnnuelle,
      nbRecords: records.length,
      dernier,
      croissance,
    };
  }

  // Questions sur les cotisations
  if (lowerMessage.includes('cotisation') || lowerMessage.includes('urssaf') || lowerMessage.includes('charge')) {
    if (stats) {
      let response = `Basé sur vos ${stats.nbRecords} enregistrement(s), voici votre situation :\n\n`;
      response += `• Votre CA moyen mensuel : ${stats.avgCA.toFixed(2)} €\n`;
      response += `• Vos cotisations moyennes mensuelles : ${stats.avgContrib.toFixed(2)} €\n`;
      response += `• Taux de cotisation moyen : ${stats.taux}%\n`;
      response += `• Projection annuelle : ${stats.projectionAnnuelle.toFixed(2)} € de CA\n\n`;
      
      if (stats.croissance !== null) {
        const croissanceNum = parseFloat(stats.croissance);
        if (croissanceNum > 0) {
          response += `📈 Votre CA a augmenté de ${stats.croissance}% par rapport au mois précédent.`;
        } else if (croissanceNum < 0) {
          response += `📉 Votre CA a diminué de ${Math.abs(croissanceNum)}% par rapport au mois précédent.`;
        }
      }
      
      response += `\n\nPour optimiser vos cotisations, pensez à déclarer régulièrement vos revenus et à suivre l'évolution de votre activité.`;
      
      return response;
    }
    return 'Les cotisations URSSAF varient selon votre type d\'activité :\n• Prestations de services : 21,2%\n• Ventes de marchandises : 12,3%\n• Activités libérales : 21,1%\n\nEnregistrez vos chiffres d\'affaires dans Comptalyze pour obtenir des estimations précises basées sur votre activité.';
  }

  // Questions sur les déclarations
  if (lowerMessage.includes('déclaration') || lowerMessage.includes('déclarer') || lowerMessage.includes('déclarer')) {
    const now = new Date();
    const dernierJourMois = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    
    return `En tant que micro-entrepreneur, vous devez déclarer votre chiffre d'affaires :\n\n` +
           `📅 **Déclaration mensuelle** : avant le dernier jour du mois suivant (ex: déclarez janvier avant le ${dernierJourMois} février)\n` +
           `📅 **Déclaration trimestrielle** : avant le dernier jour du mois suivant le trimestre\n\n` +
           `Les déclarations se font sur le site de l'URSSAF (auto-entrepreneur.urssaf.fr). ` +
           `Enregistrez vos CA régulièrement dans Comptalyze pour ne rien oublier !`;
  }

  // Questions sur les seuils
  if (lowerMessage.includes('seuil') || lowerMessage.includes('limite') || lowerMessage.includes('maximum')) {
    if (stats && stats.projectionAnnuelle > 0) {
      const seuilService = 77700;
      const seuilVente = 188700;
      const projection = stats.projectionAnnuelle;
      
      let response = `Les seuils de chiffre d'affaires pour les micro-entreprises :\n\n`;
      response += `• Prestations de services BIC / Activités libérales BNC : **77 700 €**\n`;
      response += `• Ventes de marchandises : **188 700 €**\n\n`;
      
      if (projection > seuilService) {
        response += `⚠️ **Attention** : Votre projection annuelle (${projection.toFixed(2)} €) dépasse le seuil des prestations de services. Vous devrez peut-être passer au régime réel.`;
      } else {
        const pourcentage = ((projection / seuilService) * 100).toFixed(1);
        response += `📊 Votre projection annuelle actuelle : ${projection.toFixed(2)} € (${pourcentage}% du seuil prestations de services).`;
      }
      
      return response;
    }
    return 'Les seuils de chiffre d\'affaires annuel pour les micro-entreprises :\n• Prestations de services BIC / Activités libérales BNC : **77 700 €**\n• Ventes de marchandises : **188 700 €**\n\nAu-delà de ces seuils, vous devez passer au régime réel. Enregistrez vos CA pour calculer votre projection annuelle.';
  }

  // Questions fiscales
  if (lowerMessage.includes('fiscal') || lowerMessage.includes('impôt') || lowerMessage.includes('revenu')) {
    if (stats) {
      return `En micro-entreprise, vous êtes soumis à l'impôt sur le revenu.\n\n` +
             `Basé sur vos données :\n` +
             `• CA total enregistré : ${stats.totalCA.toFixed(2)} €\n` +
             `• Revenu net estimé : ${stats.totalNet.toFixed(2)} €\n\n` +
             `Vous pouvez opter pour le **versement libératoire de l'impôt** (prélèvement à la source) si votre revenu fiscal de référence de l'année précédente ne dépasse pas certains seuils. ` +
             `Consultez le site des impôts (impots.gouv.fr) pour vérifier votre éligibilité.`;
    }
    return 'En micro-entreprise, vous êtes soumis à l\'impôt sur le revenu. Vous pouvez opter pour le versement libératoire de l\'impôt (prélèvement à la source) si votre revenu fiscal de référence de l\'année précédente ne dépasse pas certains seuils. Enregistrez vos CA pour obtenir des estimations précises de vos revenus nets.';
  }

  // Questions sur le CA ou les revenus
  if (lowerMessage.includes('ca') || lowerMessage.includes('chiffre d\'affaires') || lowerMessage.includes('revenu') || lowerMessage.includes('gagner')) {
    if (stats) {
      return `Voici un résumé de votre activité :\n\n` +
             `📊 **Chiffre d'affaires** :\n` +
             `• Total enregistré : ${stats.totalCA.toFixed(2)} €\n` +
             `• Moyenne mensuelle : ${stats.avgCA.toFixed(2)} €\n` +
             `• Projection annuelle : ${stats.projectionAnnuelle.toFixed(2)} €\n\n` +
             `💰 **Revenu net** :\n` +
             `• Total net : ${stats.totalNet.toFixed(2)} €\n` +
             `• Cotisations totales : ${stats.totalContrib.toFixed(2)} €\n` +
             `• Taux de cotisation : ${stats.taux}%\n\n` +
             `Continuez à enregistrer vos CA chaque mois pour suivre l'évolution de votre activité !`;
    }
    return 'Enregistrez vos chiffres d\'affaires mensuels dans Comptalyze pour obtenir des statistiques détaillées sur votre activité, vos cotisations et vos revenus nets.';
  }

  // Questions sur la croissance ou l'évolution
  if (lowerMessage.includes('croissance') || lowerMessage.includes('évolution') || lowerMessage.includes('tendance') || lowerMessage.includes('progression')) {
    if (stats && stats.croissance !== null) {
      const croissanceNum = parseFloat(stats.croissance);
      if (croissanceNum > 0) {
        return `📈 Excellente nouvelle ! Votre chiffre d'affaires a augmenté de ${stats.croissance}% par rapport au mois précédent. ` +
               `Votre CA moyen mensuel est de ${stats.avgCA.toFixed(2)} €. ` +
               `Continuez sur cette lancée en suivant régulièrement vos enregistrements.`;
      } else if (croissanceNum < 0) {
        return `Votre chiffre d'affaires a diminué de ${Math.abs(croissanceNum)}% par rapport au mois précédent. ` +
               `Votre CA moyen mensuel est de ${stats.avgCA.toFixed(2)} €. ` +
               `Analysez les causes de cette baisse et ajustez votre stratégie si nécessaire.`;
      } else {
        return `Votre chiffre d'affaires est stable. Votre CA moyen mensuel est de ${stats.avgCA.toFixed(2)} €. ` +
               `Continuez à suivre vos enregistrements pour identifier des tendances.`;
      }
    }
    return 'Enregistrez plusieurs mois de chiffres d\'affaires pour analyser l\'évolution et les tendances de votre activité.';
  }

  // Questions générales sur la micro-entreprise
  if (lowerMessage.includes('micro') || lowerMessage.includes('auto-entrepreneur') || lowerMessage.includes('micro-entreprise')) {
    return `La micro-entreprise (anciennement auto-entrepreneur) est un régime fiscal simplifié qui permet de :\n\n` +
           `✅ Bénéficier de formalités simplifiées\n` +
           `✅ Payer des cotisations uniquement sur le CA réalisé\n` +
           `✅ Déclarer en ligne facilement\n\n` +
           `Les cotisations varient selon votre activité (12,3% à 21,2%). ` +
           `Enregistrez vos CA dans Comptalyze pour suivre vos cotisations et optimiser votre gestion.`;
  }

  // Questions sur les délais
  if (lowerMessage.includes('délai') || lowerMessage.includes('date') || lowerMessage.includes('quand') || lowerMessage.includes('quand')) {
    const now = new Date();
    const moisSuivant = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const dernierJour = moisSuivant.getDate();
    const nomMois = moisSuivant.toLocaleDateString('fr-FR', { month: 'long' });
    
    return `📅 **Déclaration mensuelle** : Vous devez déclarer avant le **${dernierJour} ${nomMois}** pour le mois de ${now.toLocaleDateString('fr-FR', { month: 'long' })}.\n\n` +
           `📅 **Déclaration trimestrielle** : Si vous avez choisi le trimestre, déclarez avant le dernier jour du mois suivant le trimestre.\n\n` +
           `Enregistrez vos CA régulièrement dans Comptalyze pour ne rien oublier !`;
  }

  // Réponse par défaut avec contexte
  if (stats) {
    return `Je peux vous aider avec vos questions sur votre micro-entreprise. ` +
           `Basé sur vos ${stats.nbRecords} enregistrement(s), votre CA moyen mensuel est de ${stats.avgCA.toFixed(2)} € ` +
           `et vos cotisations représentent ${stats.taux}% de votre chiffre d'affaires. ` +
           `Posez-moi des questions sur les cotisations, les déclarations, les seuils, ou tout autre sujet lié à votre activité.`;
  }

  return `Je suis votre assistant spécialisé dans les micro-entreprises et les cotisations URSSAF. ` +
         `Je peux vous aider avec :\n\n` +
         `• Les cotisations URSSAF (taux selon l'activité)\n` +
         `• Les déclarations (délais et procédures)\n` +
         `• Les seuils de chiffre d'affaires\n` +
         `• L'optimisation fiscale\n` +
         `• L'analyse de vos données\n\n` +
         `Enregistrez vos chiffres d'affaires pour obtenir des conseils personnalisés basés sur votre activité réelle.`;
}

