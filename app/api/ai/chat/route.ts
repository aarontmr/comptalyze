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
        content: `Tu es un expert comptable français spécialisé dans les micro-entreprises, les cotisations URSSAF, et l'optimisation fiscale pour les indépendants. Tu es un assistant IA polyvalent qui peut :

1. **Répondre à toutes les questions générales** sur :
   - La micro-entreprise et le statut auto-entrepreneur
   - Les déclarations URSSAF (procédures, délais, sites web)
   - Les cotisations sociales et leur calcul
   - La fiscalité des indépendants
   - Les seuils de CA
   - La TVA
   - Les charges déductibles
   - Tout sujet lié à la gestion d'une micro-entreprise

2. **Donner des conseils personnalisés** en utilisant les données de l'utilisateur quand c'est pertinent

${contextData}

RÈGLES :
- Réponds TOUJOURS à la question posée, même si c'est une question générale
- Si la question est générale (ex: "comment déclarer sur l'URSSAF"), réponds directement sans forcement utiliser les données perso
- Si la question porte sur la situation de l'utilisateur (ex: "combien je dois payer"), utilise ses données
- Sois concis mais complet (maximum 250 mots)
- Reste professionnel et encourageant
- Fournis des informations pratiques et actionnables
- Réponds UNIQUEMENT en français
- N'invente pas d'informations, base-toi sur la réglementation française actuelle`,
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
  
  // Questions générales (ne nécessitent pas les données utilisateur)
  
  // Déclarations URSSAF
  if (lowerMessage.includes('comment') && (lowerMessage.includes('déclarer') || lowerMessage.includes('déclaration'))) {
    return `Pour déclarer vos revenus sur l'URSSAF :\n\n` +
           `1. **Connectez-vous sur** : autoentrepreneur.urssaf.fr\n` +
           `2. **Identifiez-vous** avec votre numéro SIRET\n` +
           `3. **Déclarez votre CA** du mois ou trimestre écoulé\n` +
           `4. **Payez vos cotisations** en ligne (prélèvement ou CB)\n\n` +
           `📅 **Délais** :\n` +
           `• Mensuel : Avant la fin du mois suivant\n` +
           `• Trimestriel : Avant la fin du mois suivant le trimestre\n\n` +
           `💡 **Astuce** : Enregistrez vos CA dans Comptalyze au fur et à mesure pour ne rien oublier lors de vos déclarations !`;
  }
  
  // TVA
  if (lowerMessage.includes('tva') && !lowerMessage.includes('mon') && !lowerMessage.includes('ma')) {
    return `**TVA en micro-entreprise** :\n\n` +
           `Par défaut, vous êtes **exonéré de TVA** (franchise en base).\n\n` +
           `**Seuils de franchise 2024** :\n` +
           `• Prestations de services : 36 800 €\n` +
           `• Ventes de marchandises : 91 900 €\n\n` +
           `**Au-delà**, vous devez :\n` +
           `1. Facturer avec TVA (20% généralement)\n` +
           `2. La déclarer et reverser chaque mois/trimestre\n` +
           `3. Perdre le bénéfice de la franchise\n\n` +
           `Utilisez le simulateur TVA de Comptalyze pour estimer l'impact !`;
  }
  
  // ACRE
  if (lowerMessage.includes('acre') || lowerMessage.includes('exonération')) {
    return `**ACRE (Aide à la Création d'Entreprise)** :\n\n` +
           `Permet une **exonération partielle des cotisations** la première année.\n\n` +
           `**Taux réduits :**\n` +
           `• Année 1 : Environ 50% d'exonération\n` +
           `• Services BIC/BNC : ~11% au lieu de 21,2%\n` +
           `• Ventes : ~6,4% au lieu de 12,3%\n\n` +
           `**Conditions :**\n` +
           `• Demandeur d'emploi\n` +
           `• Bénéficiaire RSA\n` +
           `• Jeune de 18-25 ans\n\n` +
           `La demande se fait lors de la création sur autoentrepreneur.urssaf.fr`;
  }

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

  // Questions "que faire maintenant" avec un montant de CA
  if ((lowerMessage.includes('que faire') || lowerMessage.includes('quoi faire') || lowerMessage.includes('faire maintenant')) || 
      (lowerMessage.includes('fait') && lowerMessage.includes('ca') && (lowerMessage.includes('€') || /\d+/.test(lowerMessage)))) {
    
    // Extraire le montant si possible
    const montantMatch = lowerMessage.match(/(\d+(?:[,\.]\d+)?)\s*€?/);
    const montant = montantMatch ? parseFloat(montantMatch[1].replace(',', '.')) : null;
    
    let response = `**Que faire après avoir réalisé un CA** ${montant ? `de ${montant.toFixed(2)} €` : ''} **?**\n\n`;
    
    response += `Voici les étapes à suivre :\n\n`;
    response += `1️⃣ **Enregistrez votre CA dans Comptalyze**\n`;
    response += `   • Allez dans "Calcul URSSAF"\n`;
    response += `   • Saisissez votre montant${montant ? ` (${montant.toFixed(2)} €)` : ''}\n`;
    response += `   • Choisissez votre type d'activité\n\n`;
    
    if (montant) {
      // Calculer les cotisations estimées
      const tauxVente = 0.123; // 12,3% pour ventes
      const tauxService = 0.212; // 21,2% pour services
      const cotisationsVente = montant * tauxVente;
      const cotisationsService = montant * tauxService;
      
      response += `2️⃣ **Vos cotisations estimées** :\n`;
      if (lowerMessage.includes('vente') || lowerMessage.includes('shopify') || lowerMessage.includes('produit')) {
        response += `   • Cotisations : ~${cotisationsVente.toFixed(2)} € (12,3%)\n`;
        response += `   • Revenu net : ~${(montant - cotisationsVente).toFixed(2)} €\n\n`;
      } else if (lowerMessage.includes('service') || lowerMessage.includes('prestation') || lowerMessage.includes('conseil')) {
        response += `   • Cotisations : ~${cotisationsService.toFixed(2)} € (21,2%)\n`;
        response += `   • Revenu net : ~${(montant - cotisationsService).toFixed(2)} €\n\n`;
      } else {
        response += `   • Si ventes : ~${cotisationsVente.toFixed(2)} € (12,3%)\n`;
        response += `   • Si services : ~${cotisationsService.toFixed(2)} € (21,2%)\n\n`;
      }
    }
    
    response += `3️⃣ **Attendez la fin du mois**\n`;
    response += `   • Cumulez tous vos CA du mois\n\n`;
    
    response += `4️⃣ **Déclarez à l'URSSAF**\n`;
    response += `   • Avant la fin du mois suivant\n`;
    response += `   • Sur autoentrepreneur.urssaf.fr\n`;
    response += `   • Déclarez le total du mois\n\n`;
    
    response += `💡 **Conseil** : Ne déclarez pas vente par vente, mais le **total mensuel** !`;
    
    return response;
  }
  
  // Où/Comment s'inscrire
  if ((lowerMessage.includes('où') || lowerMessage.includes('comment')) && (lowerMessage.includes('inscrire') || lowerMessage.includes('créer'))) {
    return `**Créer votre micro-entreprise** :\n\n` +
           `1. Rendez-vous sur **autoentrepreneur.urssaf.fr**\n` +
           `2. Cliquez sur "Créer mon auto-entreprise"\n` +
           `3. Remplissez le formulaire P0 en ligne\n` +
           `4. Vous recevrez votre numéro SIRET sous 8-15 jours\n\n` +
           `**Documents nécessaires** :\n` +
           `• Pièce d'identité\n` +
           `• Justificatif de domicile\n` +
           `• Déclaration de non-condamnation\n\n` +
           `L'inscription est **100% gratuite** !`;
  }
  
  // Questions sur le site URSSAF
  if (lowerMessage.includes('site') && (lowerMessage.includes('urssaf') || lowerMessage.includes('déclarer'))) {
    return `**Sites officiels URSSAF** :\n\n` +
           `🌐 **Déclarations et paiements** : autoentrepreneur.urssaf.fr\n` +
           `🌐 **Création d'entreprise** : autoentrepreneur.urssaf.fr\n` +
           `🌐 **Mon compte URSSAF** : urssaf.fr (espace personnel)\n` +
           `🌐 **Informations générales** : secu-independants.fr\n\n` +
           `💡 **Conseil** : Créez votre compte dès l'obtention de votre SIRET pour accéder à toutes vos déclarations en ligne.`;
  }

  // Questions sur les cotisations
  if (lowerMessage.includes('cotisation') && !lowerMessage.includes('comment') && !lowerMessage.includes('où')) {
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
    return `**Taux de cotisations URSSAF** :\n\n` +
           `• Prestations de services BIC : **21,2%**\n` +
           `• Activités libérales BNC : **21,1%**\n` +
           `• Ventes de marchandises : **12,3%**\n` +
           `• Hébergement (hôtels, etc.) : **6%**\n\n` +
           `Ces cotisations couvrent :\n` +
           `✓ Maladie-maternité\n` +
           `✓ Retraite de base et complémentaire\n` +
           `✓ Allocations familiales\n` +
           `✓ CSG-CRDS\n\n` +
           `💡 Enregistrez vos CA dans Comptalyze pour calculer vos cotisations précises !`;
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
  if (lowerMessage.includes('délai') || lowerMessage.includes('date') || lowerMessage.includes('quand')) {
    const now = new Date();
    const moisSuivant = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const dernierJour = moisSuivant.getDate();
    const nomMois = moisSuivant.toLocaleDateString('fr-FR', { month: 'long' });
    
    return `📅 **Déclaration mensuelle** : Vous devez déclarer avant le **${dernierJour} ${nomMois}** pour le mois de ${now.toLocaleDateString('fr-FR', { month: 'long' })}.\n\n` +
           `📅 **Déclaration trimestrielle** : Si vous avez choisi le trimestre, déclarez avant le dernier jour du mois suivant le trimestre.\n\n` +
           `Enregistrez vos CA régulièrement dans Comptalyze pour ne rien oublier !`;
  }
  
  // Questions sur la facturation
  if (lowerMessage.includes('facture') || lowerMessage.includes('facturer')) {
    return `**Facturation en micro-entreprise** :\n\n` +
           `Vous **devez** émettre une facture pour :\n` +
           `• Toute vente à un professionnel\n` +
           `• Toute vente > 25€ à un particulier\n\n` +
           `**Mentions obligatoires** :\n` +
           `• Votre nom, adresse, SIRET\n` +
           `• Numéro de facture unique\n` +
           `• Date d'émission\n` +
           `• Désignation et prix\n` +
           `• "TVA non applicable, art. 293 B du CGI"\n\n` +
           `💡 Utilisez le module Factures de Comptalyze pour générer des factures conformes automatiquement !`;
  }
  
  // Questions sur les charges déductibles
  if (lowerMessage.includes('déductible') || lowerMessage.includes('frais') || lowerMessage.includes('charge')) {
    return `**Charges déductibles en micro-entreprise** :\n\n` +
           `⚠️ En micro-entreprise, vous **ne pouvez PAS déduire** vos charges réelles.\n\n` +
           `**À la place** :\n` +
           `• Vous bénéficiez d'un **abattement forfaitaire** :\n` +
           `  - Services BIC : 50%\n` +
           `  - Services BNC : 34%\n` +
           `  - Ventes : 71%\n\n` +
           `Cet abattement est censé couvrir toutes vos charges professionnelles (loyer, matériel, etc.).\n\n` +
           `💡 Si vos charges réelles dépassent l'abattement, le régime réel peut être plus avantageux.`;
  }

  // Réponse par défaut - répondre à la question même si on ne comprend pas exactement
  return `Je suis désolé, je n'ai pas bien compris votre question "${message.substring(0, 50)}..."\n\n` +
         `Je peux vous aider avec :\n\n` +
         `💼 **Informations générales** :\n` +
         `• Comment créer une micro-entreprise\n` +
         `• Comment déclarer sur l'URSSAF\n` +
         `• Les taux de cotisations selon l'activité\n` +
         `• Les seuils de CA et la TVA\n` +
         `• La facturation obligatoire\n\n` +
         `📊 **Analyse personnalisée** :\n` +
         `• Vos cotisations et revenus nets\n` +
         `• L'évolution de votre activité\n` +
         `• Des projections et optimisations\n\n` +
         `Reformulez votre question ou demandez-moi quelque chose de spécifique !`;
}

