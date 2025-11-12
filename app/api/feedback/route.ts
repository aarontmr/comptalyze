import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Créer un client Supabase admin avec la clé de service
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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

    // Récupérer l'utilisateur connecté (si authentifié)
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        // Avec la clé de service, on peut utiliser getUser pour valider le token
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        
        if (!authError && user) {
          userId = user.id;
        } else {
          console.error('Erreur authentification:', authError);
          // Continuer sans userId si l'authentification échoue
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du token:', error);
        // Continuer sans userId si l'authentification échoue
      }
    }

    // Préparer les données pour l'insertion
    const feedbackData: any = {
      feedback: feedback.trim(),
      email: email && email.trim() ? email.trim() : null,
      user_agent: request.headers.get('user-agent') || null,
      page_url: request.headers.get('referer') || null,
    };

    // Ajouter user_id seulement s'il est disponible
    if (userId) {
      feedbackData.user_id = userId;
    }

    // Insérer le feedback dans la table
    // Avec la clé de service, on peut contourner les politiques RLS
    const { data, error } = await supabaseAdmin
      .from('feedbacks')
      .insert([feedbackData])
      .select()
      .single();

    if (error) {
      console.error('Erreur Supabase:', error);
      // Log plus de détails pour le débogage
      console.error('Détails de l\'erreur:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json(
        { error: `Erreur lors de l'enregistrement du feedback: ${error.message || 'Erreur inconnue'}` },
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

















