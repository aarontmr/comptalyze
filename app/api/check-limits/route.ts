import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserPlanServer } from '@/lib/plan';
import { getPlanLimits } from '@/lib/planLimits';

export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * API route pour vérifier les limites d'un utilisateur
 * POST /api/check-limits
 * Body: { type: 'urssaf' | 'invoice', year?: number, month?: number }
 */
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
    const { type, year, month } = body;

    if (!type || !['urssaf', 'invoice'].includes(type)) {
      return NextResponse.json({ error: 'Type invalide. Doit être "urssaf" ou "invoice"' }, { status: 400 });
    }

    // Récupérer le plan de l'utilisateur
    const plan = await getUserPlanServer(user.id, user.user_metadata);
    const limits = getPlanLimits(plan);

    // Si le plan n'a pas de limite (illimité), autoriser
    if (type === 'urssaf' && limits.urssafRecordsPerMonth === 0) {
      return NextResponse.json({ allowed: true, remaining: Infinity });
    }
    if (type === 'invoice' && limits.invoicesPerMonth === 0) {
      return NextResponse.json({ allowed: true, remaining: Infinity });
    }

    // Vérifier les limites par mois
    const currentDate = new Date();
    const checkYear = year || currentDate.getFullYear();
    const checkMonth = month || (currentDate.getMonth() + 1);

    if (type === 'urssaf') {
      // Compter les enregistrements URSSAF du mois
      const { count, error } = await supabaseAdmin
        .from('ca_records')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('year', checkYear)
        .eq('month', checkMonth);

      if (error) {
        console.error('Erreur lors du comptage:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
      }

      const currentCount = count || 0;
      const limit = limits.urssafRecordsPerMonth;
      const remaining = Math.max(0, limit - currentCount);
      const allowed = currentCount < limit;

      return NextResponse.json({
        allowed,
        remaining,
        current: currentCount,
        limit,
      });
    }

    if (type === 'invoice') {
      // Compter les factures du mois
      const { count, error } = await supabaseAdmin
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', `${checkYear}-${String(checkMonth).padStart(2, '0')}-01T00:00:00Z`)
        .lt('created_at', `${checkYear}-${String(checkMonth + 1).padStart(2, '0')}-01T00:00:00Z`);

      if (error) {
        console.error('Erreur lors du comptage:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
      }

      const currentCount = count || 0;
      const limit = limits.invoicesPerMonth;
      const remaining = Math.max(0, limit - currentCount);
      const allowed = currentCount < limit;

      return NextResponse.json({
        allowed,
        remaining,
        current: currentCount,
        limit,
      });
    }

    return NextResponse.json({ error: 'Type non géré' }, { status: 400 });
  } catch (error: any) {
    console.error('Erreur dans check-limits:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}









