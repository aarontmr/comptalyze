/**
 * Validation des variables d'environnement au démarrage
 * Évite les erreurs au runtime
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
] as const;

const optionalEnvVars = [
  'STRIPE_PRICE_PRO',
  'STRIPE_PRICE_PREMIUM',
  'STRIPE_PRICE_PRO_YEARLY',
  'STRIPE_PRICE_PREMIUM_YEARLY',
  'OPENAI_API_KEY',
  'RESEND_API_KEY',
  'CRON_SECRET',
  'NEXT_PUBLIC_BASE_URL',
] as const;

interface EnvValidation {
  isValid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Valide la présence des variables d'environnement critiques
 */
export function validateEnv(): EnvValidation {
  const missing: string[] = [];
  const warnings: string[] = [];
  
  // Vérifier les variables requises
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  
  // Vérifier les variables optionnelles mais importantes
  for (const varName of optionalEnvVars) {
    if (!process.env[varName]) {
      warnings.push(varName);
    }
  }
  
  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Valide et affiche les erreurs au démarrage
 * À appeler dans le fichier principal (layout.tsx ou instrumentation.ts)
 */
export function validateEnvOrThrow(): void {
  // Ne valider qu'en développement et production (pas au build)
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return;
  }
  
  const validation = validateEnv();
  
  if (!validation.isValid) {
    console.error('\n❌ ============================================================');
    console.error('❌ ERREUR: Variables d\'environnement manquantes');
    console.error('❌ ============================================================\n');
    console.error('Variables requises manquantes:');
    validation.missing.forEach(varName => {
      console.error(`  - ${varName}`);
    });
    console.error('\n📖 Consultez le fichier env.example pour plus d\'informations\n');
    console.error('============================================================\n');
    
    throw new Error('Variables d\'environnement manquantes. Voir la console pour plus de détails.');
  }
  
  if (validation.warnings.length > 0) {
    console.warn('\n⚠️  ============================================================');
    console.warn('⚠️  ATTENTION: Variables d\'environnement optionnelles manquantes');
    console.warn('⚠️  ============================================================\n');
    console.warn('Certaines fonctionnalités pourraient ne pas fonctionner:');
    validation.warnings.forEach(varName => {
      console.warn(`  - ${varName}`);
    });
    console.warn('\n============================================================\n');
  }
}

/**
 * Type-safe accessors pour les variables d'environnement
 */
export const env = {
  // Supabase
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
  
  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY!,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    prices: {
      pro: process.env.STRIPE_PRICE_PRO,
      premium: process.env.STRIPE_PRICE_PREMIUM,
      proYearly: process.env.STRIPE_PRICE_PRO_YEARLY,
      premiumYearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY,
    },
  },
  
  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  
  // Resend
  resend: {
    apiKey: process.env.RESEND_API_KEY,
  },
  
  // App
  app: {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    cronSecret: process.env.CRON_SECRET,
  },
} as const;





