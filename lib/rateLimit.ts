// Rate limiting simple basé sur IP et userID
// Stocke les tentatives en mémoire (pour un serveur unique)
// Pour un système distribué, utiliser Redis

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const rateLimitStore: RateLimitStore = {};

// Nettoyer les entrées expirées toutes les 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach(key => {
    if (rateLimitStore[key].resetAt < now) {
      delete rateLimitStore[key];
    }
  });
}, 5 * 60 * 1000);

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 5, windowMs: 60000 }
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const key = identifier;

  // Initialiser ou réinitialiser si expiré
  if (!rateLimitStore[key] || rateLimitStore[key].resetAt < now) {
    rateLimitStore[key] = {
      count: 0,
      resetAt: now + config.windowMs,
    };
  }

  const entry = rateLimitStore[key];

  // Incrémenter le compteur
  entry.count++;

  // Vérifier si la limite est atteinte
  const allowed = entry.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);

  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
  };
}

export function getRateLimitHeaders(result: { remaining: number; resetAt: number }) {
  return {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
  };
}

export function getClientIdentifier(request: Request): string {
  // Essayer d'obtenir l'IP réelle (derrière un proxy/CDN)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  let ip = 'unknown';
  
  if (forwardedFor) {
    // x-forwarded-for peut contenir plusieurs IPs, prendre la première
    ip = forwardedFor.split(',')[0].trim();
  } else if (realIp) {
    ip = realIp;
  }
  
  return `ip:${ip}`;
}

export function getUserIdentifier(userId: string | null, ip: string): string {
  // Si utilisateur connecté, utiliser son ID + IP
  // Sinon, utiliser uniquement l'IP
  return userId ? `user:${userId}:${ip}` : `ip:${ip}`;
}























