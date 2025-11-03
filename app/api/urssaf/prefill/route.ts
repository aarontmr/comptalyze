import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export async function POST(req: NextRequest) {
  try {
    // Vérifier la session
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const { year, month, quarter, activity_type } = body;

    if (!year) {
      return NextResponse.json({ error: 'L\'année est requise' }, { status: 400 });
    }

    // Construire la requête
    let query = supabaseAdmin
      .from('ca_records')
      .select('month, year, activity_type, amount_eur')
      .eq('user_id', user.id)
      .eq('year', year);

    if (activity_type) {
      query = query.eq('activity_type', activity_type);
    }

    if (month) {
      query = query.eq('month', month);
    } else if (quarter) {
      // Quarter: 1 = Q1 (1-3), 2 = Q2 (4-6), 3 = Q3 (7-9), 4 = Q4 (10-12)
      const startMonth = (quarter - 1) * 3 + 1;
      const endMonth = quarter * 3;
      query = query.gte('month', startMonth).lte('month', endMonth);
    }

    const { data: records, error } = await query.order('month', { ascending: true });

    if (error) {
      console.error('Erreur:', error);
      return NextResponse.json({ error: 'Erreur lors de la récupération des données' }, { status: 500 });
    }

    // Calculer le CA total
    const totalCA = records?.reduce((sum, record) => sum + Number(record.amount_eur), 0) || 0;

    // Construire le texte de pré-remplissage
    let periodText = '';
    if (month) {
      periodText = `${MONTHS[month - 1]} ${year}`;
    } else if (quarter) {
      const startMonth = MONTHS[(quarter - 1) * 3];
      const endMonth = MONTHS[quarter * 3 - 1];
      periodText = `Trimestre ${quarter} (${startMonth} - ${endMonth}) ${year}`;
    } else {
      periodText = `Année ${year}`;
    }

    const activityText = activity_type || 'Toutes activités';
    const observations = records && records.length > 0 ? 'Aucune.' : 'Aucune donnée enregistrée pour cette période.';

    const prefillText = `Déclaration URSSAF – ${periodText}

Activité: ${activityText}

Chiffre d'affaires à déclarer: ${totalCA.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €

Observations: ${observations}

---
Généré par Comptalyze le ${new Date().toLocaleDateString('fr-FR')}
`;

    return NextResponse.json({ text: prefillText });
  } catch (error: any) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur lors de la génération du pré-remplissage' }, { status: 500 });
  }
}

