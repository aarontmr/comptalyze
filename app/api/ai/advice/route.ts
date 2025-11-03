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

export async function GET(req: NextRequest) {
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

    // Récupérer les 6 derniers enregistrements
    const { data: records, error } = await supabaseAdmin
      .from('ca_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) {
      console.error('Erreur lors de la récupération des enregistrements:', error);
      return NextResponse.json({ error: 'Erreur lors de la récupération des données' }, { status: 500 });
    }

    if (!records || records.length === 0) {
      return NextResponse.json({
        advice: 'Enregistrez vos premiers revenus mensuels pour recevoir des conseils personnalisés basés sur votre activité.',
      });
    }

    // Préparer les données pour l'IA
    const MONTHS = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const recordsSummary = records.map((r) => ({
      mois: `${MONTHS[r.month - 1]} ${r.year}`,
      activite: r.activity_type,
      ca: Number(r.amount_eur).toFixed(2),
      cotisations: Number(r.computed_contrib_eur).toFixed(2),
      net: Number(r.computed_net_eur).toFixed(2),
    }));

    // Calculer quelques statistiques
    const totalCA = records.reduce((sum, r) => sum + Number(r.amount_eur), 0);
    const totalContrib = records.reduce((sum, r) => sum + Number(r.computed_contrib_eur), 0);
    const avgCA = totalCA / records.length;
    const avgContrib = totalContrib / records.length;

    // Appeler OpenAI pour générer le conseil (si disponible)
    let advice: string;

    if (!openai || !process.env.OPENAI_API_KEY) {
      // Fallback si OpenAI n'est pas configuré
      advice = generateFallbackAdvice(recordsSummary, avgCA, avgContrib, totalCA, totalContrib);
    } else {
      try {
        const prompt = `Tu es un expert comptable français spécialisé dans les cotisations URSSAF et l'optimisation fiscale pour les indépendants et micro-entrepreneurs.

Voici les données des 6 derniers mois d'un utilisateur :
${JSON.stringify(recordsSummary, null, 2)}

Statistiques :
- CA moyen mensuel : ${avgCA.toFixed(2)} €
- Cotisations moyennes mensuelles : ${avgContrib.toFixed(2)} €
- Total CA sur 6 mois : ${totalCA.toFixed(2)} €
- Total cotisations sur 6 mois : ${totalContrib.toFixed(2)} €

Génère un conseil pratique et concis en français (maximum 120 mots) qui :
1. Observe les tendances dans les revenus et cotisations
2. Propose des suggestions concrètes pour optimiser la gestion des cotisations URSSAF
3. Rappelle des informations utiles sur les seuils URSSAF ou les opportunités d'optimisation
4. Reste bienveillant et encourageant

Le conseil doit être écrit comme un message direct à l'utilisateur, en utilisant "vous".`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Tu es un expert comptable français spécialisé dans les cotisations URSSAF. Tu donnes des conseils pratiques, concis et bienveillants en français.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 200,
          temperature: 0.7,
        });

        advice = completion.choices[0]?.message?.content || generateFallbackAdvice(recordsSummary, avgCA, avgContrib, totalCA, totalContrib);
      } catch (openaiError: any) {
        console.error('Erreur OpenAI:', openaiError);
        // Fallback si OpenAI échoue
        advice = generateFallbackAdvice(recordsSummary, avgCA, avgContrib, totalCA, totalContrib);
      }
    }

    return NextResponse.json({ advice });
  } catch (error: any) {
    console.error('Erreur lors de la génération du conseil IA:', error);
    
    // Toujours renvoyer du JSON, même en cas d'erreur
    return NextResponse.json({
      advice: 'Analysez régulièrement vos enregistrements pour suivre l\'évolution de vos cotisations URSSAF et optimiser votre gestion financière.',
    }, { status: 200 });
  }
}

// Fonction helper pour générer un conseil de fallback
function generateFallbackAdvice(
  recordsSummary: any[],
  avgCA: number,
  avgContrib: number,
  totalCA: number,
  totalContrib: number
): string {
  if (recordsSummary.length === 0) {
    return 'Enregistrez vos premiers revenus mensuels pour recevoir des conseils personnalisés basés sur votre activité.';
  }

  const tauxCotisation = totalCA > 0 ? ((totalContrib / totalCA) * 100).toFixed(1) : '0';
  
  let advice = `Sur les ${recordsSummary.length} mois enregistrés, votre chiffre d'affaires moyen est de ${avgCA.toFixed(2)} € par mois. `;
  
  if (totalCA > 0) {
    advice += `Vos cotisations représentent ${tauxCotisation}% de votre CA. `;
  }
  
  advice += `Continuez à suivre régulièrement vos enregistrements pour identifier des tendances et optimiser votre gestion des cotisations URSSAF. `;
  
  if (avgCA > 5000) {
    advice += 'Pensez à consulter les seuils de déclaration URSSAF pour éviter les pénalités.';
  } else {
    advice += 'N\'oubliez pas de déclarer vos revenus dans les délais pour éviter les pénalités.';
  }
  
  return advice;
}

