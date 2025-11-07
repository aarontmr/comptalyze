import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware pour ajouter des headers de sécurité
export function middleware(request: NextRequest) {
  // Headers de sécurité pour toutes les routes matchées
  const response = NextResponse.next();
  
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/login',
    '/signup',
  ],
};

