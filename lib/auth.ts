/**
 * Utilitaires d'authentification et d'autorisation
 * Centralise la vérification des tokens et des rôles
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import { User } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Résultat de la vérification d'authentification
 */
export interface AuthResult {
  user: User;
  userId: string;
  isAuthenticated: true;
}

export interface AuthError {
  isAuthenticated: false;
  error: string;
  status: number;
}

export type AuthCheckResult = AuthResult | AuthError;

/**
 * Vérifie l'authentification d'un utilisateur depuis une requête
 * @param req - La requête Next.js
 * @returns Le résultat de l'authentification
 */
export async function verifyAuth(req: NextRequest): Promise<AuthCheckResult> {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '').trim();

  if (!token) {
    return {
      isAuthenticated: false,
      error: 'Token d\'authentification manquant',
      status: 401,
    };
  }

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    return {
      isAuthenticated: false,
      error: 'Token invalide ou expiré',
      status: 401,
    };
  }

  return {
    user,
    userId: user.id,
    isAuthenticated: true,
  };
}

/**
 * Vérifie si un utilisateur est administrateur
 * @param user - L'utilisateur à vérifier
 * @returns true si l'utilisateur est admin
 */
export function isAdmin(user: User): boolean {
  return user.user_metadata?.is_admin === true;
}

/**
 * Vérifie l'authentification et le rôle admin d'un utilisateur
 * @param req - La requête Next.js
 * @returns Le résultat de l'authentification avec vérification admin
 */
export async function verifyAdmin(req: NextRequest): Promise<AuthCheckResult> {
  const authResult = await verifyAuth(req);

  if (!authResult.isAuthenticated) {
    return authResult;
  }

  if (!isAdmin(authResult.user)) {
    return {
      isAuthenticated: false,
      error: 'Accès administrateur requis',
      status: 403,
    };
  }

  return authResult;
}

/**
 * Vérifie que l'userId fourni correspond à l'utilisateur authentifié
 * Protection contre les attaques IDOR (Insecure Direct Object Reference)
 * @param req - La requête Next.js
 * @param providedUserId - L'userId fourni dans la requête (body, query, etc.)
 * @returns Le résultat de la vérification
 */
export async function verifyUserOwnership(
  req: NextRequest,
  providedUserId: string | undefined | null
): Promise<AuthCheckResult> {
  const authResult = await verifyAuth(req);

  if (!authResult.isAuthenticated) {
    return authResult;
  }

  if (!providedUserId) {
    return {
      isAuthenticated: false,
      error: 'ID utilisateur requis',
      status: 400,
    };
  }

  if (providedUserId !== authResult.userId) {
    return {
      isAuthenticated: false,
      error: 'Vous n\'êtes pas autorisé à accéder à cette ressource',
      status: 403,
    };
  }

  return authResult;
}

