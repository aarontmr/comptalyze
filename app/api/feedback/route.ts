import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { feedback, email } = await request.json();

    // Validation
    if (!feedback || typeof feedback !== 'string' || feedback.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le commentaire est requis' },
        { status: 400 }
      );
    }

    if (feedback.length > 2000) {
      return NextResponse.json(
        { error: 'Le commentaire est trop long (max 2000 caractères)' },
        { status: 400 }
      );
    }

    // Créer un client Supabase avec la clé de service (ou anon)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Récupérer l'utilisateur connecté (si authentifié)
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Alternative : essayer de récupérer depuis les cookies
    if (!userId) {
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const cookies = Object.fromEntries(
          cookieHeader.split('; ').map(c => {
            const [key, ...v] = c.split('=');
            return [key, v.join('=')];
          })
        );
        
        // Supabase stocke le token dans un cookie
        const accessToken = cookies['sb-access-token'] || cookies['supabase-auth-token'];
        if (accessToken) {
          const { data: { user } } = await supabase.auth.getUser(accessToken);
          userId = user?.id || null;
        }
      }
    }

    // Insérer le feedback dans la table
    const { data, error } = await supabase
      .from('feedbacks')
      .insert([
        {
          feedback: feedback.trim(),
          email: email && email.trim() ? email.trim() : null,
          user_id: userId,
          created_at: new Date().toISOString(),
          user_agent: request.headers.get('user-agent'),
          page_url: request.headers.get('referer') || null,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json(
        { error: 'Erreur lors de l\'enregistrement du feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback enregistré avec succès',
      id: data.id,
    });

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du feedback:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}







