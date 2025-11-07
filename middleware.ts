import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware pour ajouter des headers de sécurité et performance
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Headers de sécurité
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Headers de performance
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  
  // Cache pour les assets statiques
  const { pathname } = request.nextUrl;
  if (pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|webp|avif)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/login',
    '/signup',
  ],
};

