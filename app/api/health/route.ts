/**
 * Health check endpoint
 * Vérifie que les services critiques sont disponibles
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, { status: 'ok' | 'error'; message?: string; latency?: number }> = {};
  
  // 1. Vérifier les variables d'environnement critiques
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  };
  
  const missingEnvVars = Object.entries(envVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);
  
  if (missingEnvVars.length > 0) {
    checks.env = {
      status: 'error',
      message: `Variables manquantes: ${missingEnvVars.join(', ')}`,
    };
  } else {
    checks.env = { status: 'ok' };
  }
  
  // 2. Vérifier la connexion Supabase
  const dbCheckStart = Date.now();
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Tenter une simple requête
    const { error } = await supabase.from('user_profiles').select('id').limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = table vide, c'est OK
      throw error;
    }
    
    checks.database = {
      status: 'ok',
      latency: Date.now() - dbCheckStart,
    };
  } catch (error: any) {
    checks.database = {
      status: 'error',
      message: error.message || 'Erreur connexion DB',
      latency: Date.now() - dbCheckStart,
    };
  }
  
  // 3. Vérifier Stripe (juste l'initialisation)
  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-10-29.clover',
    });
    
    // Vérifier que la clé fonctionne
    await stripe.prices.list({ limit: 1 });
    
    checks.stripe = { status: 'ok' };
  } catch (error: any) {
    checks.stripe = {
      status: 'error',
      message: error.message || 'Erreur Stripe',
    };
  }
  
  // 4. Vérifier OpenAI (optionnel)
  if (process.env.OPENAI_API_KEY) {
    try {
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      // Pas de vraie requête, juste vérifier l'init
      checks.openai = { status: 'ok' };
    } catch (error: any) {
      checks.openai = {
        status: 'error',
        message: error.message,
      };
    }
  } else {
    checks.openai = {
      status: 'ok',
      message: 'Non configuré (optionnel)',
    };
  }
  
  // 5. Vérifier Resend (optionnel)
  if (process.env.RESEND_API_KEY) {
    checks.resend = { status: 'ok' };
  } else {
    checks.resend = {
      status: 'ok',
      message: 'Non configuré (optionnel)',
    };
  }
  
  // Déterminer le status global
  const hasErrors = Object.values(checks).some(c => c.status === 'error');
  const overallStatus = hasErrors ? 'unhealthy' : 'healthy';
  
  const totalLatency = Date.now() - startTime;
  
  const response = {
    status: overallStatus,
    version: process.env.npm_package_version || '0.1.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    latency: totalLatency,
    checks,
  };
  
  return NextResponse.json(response, {
    status: hasErrors ? 503 : 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}

