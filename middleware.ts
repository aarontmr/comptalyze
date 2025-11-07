import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware pour le rate-limiting sur les routes sensibles
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes protégées par rate-limiting
  const authRoutes = ['/api/auth', '/login', '/signup'];
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (isAuthRoute) {
    // Le rate-limiting est géré dans les API routes individuelles
    // Ce middleware sert à logger et à ajouter des headers de sécurité
    
    // Headers de sécurité
    const response = NextResponse.next();
    
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/login',
    '/signup',
  ],
};

