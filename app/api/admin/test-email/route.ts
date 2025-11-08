/**
 * Route admin pour tester l'envoi d'emails
 * Protégée par is_admin
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
  try {
    // Vérifier si les outils admin sont activés
    const adminToolsEnabled = process.env.ADMIN_TOOLS_ENABLED !== 'false';
    
    if (!adminToolsEnabled) {
      return NextResponse.json(
        { error: 'Outils admin désactivés' },
        { status: 403 }
      );
    }
    
    // Vérifier l'authentification
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 401 }
      );
    }
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }
    
    const isAdmin = user.user_metadata?.is_admin === true;
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Accès admin requis' },
        { status: 403 }
      );
    }
    
    // Récupérer les paramètres
    const { to, template } = await req.json();
    
    if (!to) {
      return NextResponse.json(
        { error: 'Adresse email destinataire requise' },
        { status: 400 }
      );
    }
    
    if (!resend) {
      return NextResponse.json(
        { error: 'Resend non configuré (RESEND_API_KEY manquant)' },
        { status: 500 }
      );
    }
    
    // Templates disponibles
    const templates: Record<string, { subject: string; html: string }> = {
      welcome: {
        subject: '👋 Bienvenue sur Comptalyze !',
        html: `
          <h1>Bienvenue !</h1>
          <p>Merci de vous être inscrit sur Comptalyze.</p>
          <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard">Accéder au dashboard</a></p>
        `,
      },
      trial_start: {
        subject: '🎉 Votre essai Premium a commencé',
        html: `
          <h1>Essai Premium activé !</h1>
          <p>Profitez de 3 jours gratuits pour tester toutes les fonctionnalités Premium.</p>
        `,
      },
      trial_end: {
        subject: '⏰ Votre essai Premium se termine bientôt',
        html: `
          <h1>Votre essai se termine bientôt</h1>
          <p>Il vous reste 1 jour pour profiter des fonctionnalités Premium.</p>
          <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/pricing">Passer à Premium</a></p>
        `,
      },
      quota_warning: {
        subject: '⚠️ Vous approchez de votre limite',
        html: `
          <h1>Limite bientôt atteinte</h1>
          <p>Vous avez utilisé 2/3 de vos simulations gratuites ce mois-ci.</p>
          <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/pricing">Passer à Pro pour un accès illimité</a></p>
        `,
      },
      quota_reached: {
        subject: '🚫 Limite mensuelle atteinte',
        html: `
          <h1>Limite atteinte</h1>
          <p>Vous avez utilisé vos 3 simulations gratuites pour ce mois.</p>
          <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/pricing">Passer à Pro dès maintenant</a></p>
        `,
      },
      monthly_recap: {
        subject: '📊 Votre récap mensuel',
        html: `
          <h1>CA importé automatiquement</h1>
          <p>Votre chiffre d'affaires de janvier 2025 : 2 500,00 €</p>
          <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard">Voir le détail</a></p>
        `,
      },
    };
    
    const selectedTemplate = templates[template || 'welcome'];
    
    if (!selectedTemplate) {
      return NextResponse.json(
        { error: `Template inconnu: ${template}. Disponibles: ${Object.keys(templates).join(', ')}` },
        { status: 400 }
      );
    }
    
    // Envoyer l'email
    const result = await resend.emails.send({
      from: process.env.COMPANY_FROM_EMAIL || 'Comptalyze <no-reply@comptalyze.com>',
      to,
      subject: selectedTemplate.subject,
      html: selectedTemplate.html,
    });
    
    console.log(`✉️ Email test envoyé à ${to} (template: ${template})`);
    
    return NextResponse.json({
      success: true,
      messageId: result.data?.id,
      template,
      to,
    });
  } catch (error: any) {
    console.error('Erreur envoi email test:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Utilisez POST avec { to: "email@example.com", template: "welcome" }',
    templates: ['welcome', 'trial_start', 'trial_end', 'quota_warning', 'quota_reached', 'monthly_recap'],
    note: 'Route réservée aux administrateurs',
  });
}

