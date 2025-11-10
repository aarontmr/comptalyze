import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIdentifier, getRateLimitHeaders } from '@/lib/rateLimit';
import { logRequest } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientIp = getClientIdentifier(request);

  try {
    // Rate limiting : 3 inscriptions par heure par IP (plus strict)
    const rateLimitResult = checkRateLimit(`signup:${clientIp}`, {
      maxRequests: 3,
      windowMs: 3600000, // 1 heure
    });

    if (!rateLimitResult.allowed) {
      const responseTime = Date.now() - startTime;
      
      // Logger la tentative bloquée
      await logRequest(request, 429, {
        responseTime,
        error: 'Signup rate limit exceeded',
        metadata: { remainingAttempts: rateLimitResult.remaining }
      });

      const minutesUntilReset = Math.ceil((rateLimitResult.resetAt - Date.now()) / 60000);

      return NextResponse.json(
        {
          error: `Trop de tentatives d'inscription. Veuillez patienter ${minutesUntilReset} minute(s) avant de réessayer.`,
          retryAfter: Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            ...getRateLimitHeaders(rateLimitResult),
            'Retry-After': Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Récupérer les données du body
    const { email, password, acceptTerms } = await request.json();

    // Validations
    if (!email || !password) {
      const responseTime = Date.now() - startTime;
      await logRequest(request, 400, {
        responseTime,
        error: 'Email et mot de passe requis'
      });

      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      const responseTime = Date.now() - startTime;
      await logRequest(request, 400, {
        responseTime,
        error: 'Mot de passe trop court'
      });

      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      );
    }

    if (!acceptTerms) {
      const responseTime = Date.now() - startTime;
      await logRequest(request, 400, {
        responseTime,
        error: 'CGV non acceptées'
      });

      return NextResponse.json(
        { error: 'Vous devez accepter les CGV et la Politique de confidentialité' },
        { status: 400 }
      );
    }

    const responseTime = Date.now() - startTime;
    
    // Logger la tentative valide
    await logRequest(request, 200, {
      responseTime,
      metadata: { email: email.substring(0, 3) + '***', acceptTerms }
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Validations passées. Procédez avec Supabase Auth côté client.',
      },
      {
        status: 200,
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    await logRequest(request, 500, {
      responseTime,
      error: error.message || 'Internal server error'
    });

    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}










