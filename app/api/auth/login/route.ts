import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIdentifier, getRateLimitHeaders } from '@/lib/rateLimit';
import { logRequest } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientIp = getClientIdentifier(request);

  try {
    // Rate limiting : 5 tentatives par minute par IP
    const rateLimitResult = checkRateLimit(clientIp, {
      maxRequests: 5,
      windowMs: 60000, // 1 minute
    });

    if (!rateLimitResult.allowed) {
      const responseTime = Date.now() - startTime;
      
      // Logger la tentative bloquée
      await logRequest(request, 429, {
        responseTime,
        error: 'Rate limit exceeded',
        metadata: { remainingAttempts: rateLimitResult.remaining }
      });

      return NextResponse.json(
        {
          error: 'Trop de tentatives. Veuillez patienter avant de réessayer.',
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
    const { email, password } = await request.json();

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

    // Note : L'authentification est gérée par Supabase côté client
    // Cette route sert principalement au rate-limiting et au logging
    // Supabase Auth gère déjà l'authentification avec signInWithPassword()

    const responseTime = Date.now() - startTime;
    
    // Logger la tentative réussie (requête valide)
    await logRequest(request, 200, {
      responseTime,
      metadata: { email: email.substring(0, 3) + '***' } // Email partiel pour privacy
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Cette route est utilisée pour le rate-limiting. Utilisez Supabase Auth côté client.',
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






