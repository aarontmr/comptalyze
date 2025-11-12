import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token reCAPTCHA manquant' },
        { status: 400 }
      );
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY is not configured');
      // En mode développement sans reCAPTCHA, on peut accepter
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({ success: true, score: 1 });
      }
      return NextResponse.json(
        { success: false, error: 'Configuration reCAPTCHA manquante' },
        { status: 500 }
      );
    }

    // Vérifier le token avec l'API Google reCAPTCHA
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;
    const verifyResponse = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const verifyData = await verifyResponse.json();

    if (!verifyData.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Vérification reCAPTCHA échouée',
          'error-codes': verifyData['error-codes'] 
        },
        { status: 400 }
      );
    }

    // Pour reCAPTCHA v3, vérifier le score (0.0 à 1.0, plus c'est haut mieux c'est)
    // Un score < 0.5 est généralement considéré comme suspect
    if (verifyData.score && verifyData.score < 0.5) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Score de sécurité trop faible',
          score: verifyData.score 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      score: verifyData.score || 1,
      action: verifyData.action,
    });

  } catch (error) {
    console.error('Erreur lors de la vérification reCAPTCHA:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur lors de la vérification' },
      { status: 500 }
    );
  }
}


















