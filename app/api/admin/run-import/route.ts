/**
 * Route admin pour déclencher manuellement l'import CA
 * Protégée par is_admin et optionnellement par ADMIN_TOOLS_ENABLED
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { runMonthlyImportJob } from '@/app/lib/cron/import-ca';
import { verifyAdmin } from '@/lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    // Vérifier si les outils admin sont activés
    const adminToolsEnabled = process.env.ADMIN_TOOLS_ENABLED !== 'false';
    
    if (!adminToolsEnabled) {
      return NextResponse.json(
        { error: 'Outils admin désactivés' },
        { status: 403 }
      );
    }
    
    // Vérifier l'authentification admin
    const authResult = await verifyAdmin(req);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
    
    // Récupérer les paramètres
    const { searchParams } = new URL(req.url);
    const dryRun = searchParams.get('dryRun') === '1' || searchParams.get('dryRun') === 'true';
    
    console.log(`🚀 Import CA manuel déclenché par admin ${authResult.user.email} (dryRun: ${dryRun})`);
    
    // Exécuter l'import
    const result = await runMonthlyImportJob(dryRun);
    
    return NextResponse.json({
      success: true,
      dryRun,
      result,
    });
  } catch (error: any) {
    const { handleInternalError } = await import('@/lib/error-handler');
    return handleInternalError(error);
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: 'Utilisez POST avec Authorization header et optionnellement ?dryRun=1',
    note: 'Route réservée aux administrateurs',
  });
}

