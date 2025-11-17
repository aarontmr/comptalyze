import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting simple en mémoire (à remplacer par Redis/Upstash en prod)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Configuration rate limiting par route
const RATE_LIMITS: Record<string, { maxRequests: number; windowMs: number }> = {
  '/api/auth/login': { maxRequests: 5, windowMs: 60000 }, // 5 req/min
  '/api/auth/signup': { maxRequests: 3, windowMs: 60000 }, // 3 req/min
  '/api/webhook': { maxRequests: 100, windowMs: 60000 }, // 100 req/min
  '/api/ai/chat': { maxRequests: 20, windowMs: 60000 }, // 20 req/min
  '/api/ai/advice': { maxRequests: 30, windowMs: 60000 }, // 30 req/min (augmenté pour éviter les erreurs)
  '/api/export-pdf': { maxRequests: 10, windowMs: 60000 }, // 10 req/min
  '/api/feedback': { maxRequests: 5, windowMs: 60000 }, // 5 req/min
  default: { maxRequests: 60, windowMs: 60000 }, // 60 req/min par défaut
};

/**
 * Rate limiter simple
 */
function checkRateLimit(identifier: string, routePath: string): boolean {
  const now = Date.now();
  const limit = RATE_LIMITS[routePath] || RATE_LIMITS.default;
  
  // Nettoyer les entrées expirées (max 10000 entrées)
  if (rateLimitMap.size > 10000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetTime < now) {
        rateLimitMap.delete(key);
      }
    }
  }
  
  const key = `${identifier}:${routePath}`;
  const record = rateLimitMap.get(key);
  
  if (!record || record.resetTime < now) {
    // Nouvelle fenêtre
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + limit.windowMs,
    });
    return true;
  }
  
  if (record.count >= limit.maxRequests) {
    // Limite atteinte
    return false;
  }
  
  // Incrémenter
  record.count++;
  return true;
}

/**
 * Middleware principal
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Rate limiting pour les routes API sensibles
  if (pathname.startsWith('/api/')) {
    // Identifier l'utilisateur (IP + User-Agent)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                request.headers.get('x-real-ip') || 
                'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const identifier = `${ip}:${userAgent.slice(0, 50)}`;
    
    // Vérifier rate limit
    const allowed = checkRateLimit(identifier, pathname);
    
    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Trop de requêtes. Veuillez réessayer dans quelques instants.',
          code: 'RATE_LIMIT_EXCEEDED',
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': String(RATE_LIMITS[pathname]?.maxRequests || RATE_LIMITS.default.maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + 60),
          },
        }
      );
    }
  }
  
  const response = NextResponse.next();
  
  // Headers de sécurité
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // CSP (Content Security Policy) - ajuster selon les besoins
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://connect.facebook.net https://www.googletagmanager.com https://www.google-analytics.com https://*.googlesyndication.com https://www.googleadservices.com https://*.doubleclick.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.stripe.com https://connect.stripe.com https://www.google-analytics.com https://www.google.com https://region1.google-analytics.com https://*.supabase.co wss://*.supabase.co https://*.myshopify.com https://*.googlesyndication.com https://*.doubleclick.net https://www.googleadservices.com https://connect.facebook.net",
    "frame-src 'self' https://js.stripe.com https://connect.stripe.com https://www.googletagmanager.com https://*.myshopify.com",
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  
  // Headers de performance
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  
  // Cache pour les assets statiques
  if (pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|webp|avif)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  // Ajouter un request ID pour le tracking
  const requestId = crypto.randomUUID();
  response.headers.set('X-Request-ID', requestId);
  
  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/login',
    '/signup',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

