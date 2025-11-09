// Logger pour enregistrer les accès et actions
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface LogEntry {
  ip_address: string;
  endpoint: string;
  method: string;
  status_code: number;
  user_id?: string | null;
  user_agent?: string | null;
  response_time_ms?: number;
  error_message?: string | null;
  metadata?: any;
}

export async function logAccess(entry: LogEntry): Promise<void> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    await supabase.from('access_logs').insert([
      {
        ip_address: entry.ip_address,
        endpoint: entry.endpoint,
        method: entry.method,
        status_code: entry.status_code,
        user_id: entry.user_id || null,
        user_agent: entry.user_agent || null,
        response_time_ms: entry.response_time_ms || null,
        error_message: entry.error_message || null,
        metadata: entry.metadata || null,
        created_at: new Date().toISOString(),
      }
    ]);
  } catch (error) {
    // Fallback : au moins logger dans la console si Supabase échoue
    console.error('Failed to log access:', error);
    console.log('Log entry:', entry);
  }
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return 'unknown';
}

export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown';
}

// Helper pour logger facilement une requête
export async function logRequest(
  request: Request,
  statusCode: number,
  options: {
    userId?: string | null;
    responseTime?: number;
    error?: string | null;
    metadata?: any;
  } = {}
): Promise<void> {
  const url = new URL(request.url);
  
  await logAccess({
    ip_address: getClientIp(request),
    endpoint: url.pathname,
    method: request.method,
    status_code: statusCode,
    user_id: options.userId,
    user_agent: getUserAgent(request),
    response_time_ms: options.responseTime,
    error_message: options.error,
    metadata: options.metadata,
  });
}








