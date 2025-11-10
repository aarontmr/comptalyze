import { NextRequest, NextResponse } from 'next/server';
import { trackCompleteRegistration } from '@/lib/facebookConversionsApi';

export async function POST(req: NextRequest) {
  try {
    const { email, userId } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    // Récupérer les informations du user-agent et du referer
    const userAgent = req.headers.get('user-agent') || undefined;
    const referer = req.headers.get('referer') || undefined;

    console.log('📊 Envoi événement CompleteRegistration à Facebook pour:', email);

    // Envoyer l'événement à Facebook
    const result = await trackCompleteRegistration({
      email,
      userAgent,
      eventSourceUrl: referer,
      userId,
    });

    if (!result.success) {
      console.error('❌ Erreur Facebook:', result.error);
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 });
    }

    console.log('✅ Événement CompleteRegistration envoyé avec succès');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'envoi à Facebook:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

