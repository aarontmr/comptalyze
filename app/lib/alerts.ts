/**
 * Système d'alertes pour notifications critiques
 * Slack webhooks + Email (via Resend)
 */

export type AlertLevel = 'info' | 'warning' | 'error' | 'critical';

export interface Alert {
  level: AlertLevel;
  title: string;
  message: string;
  context?: Record<string, any>;
  timestamp?: string;
}

/**
 * Envoie une alerte Slack
 */
export async function sendSlackAlert(alert: Alert): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('SLACK_WEBHOOK_URL non configuré - alerte non envoyée');
    return false;
  }
  
  try {
    // Emoji selon le niveau
    const emoji = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '🚨',
      critical: '🔥',
    }[alert.level];
    
    // Couleur selon le niveau
    const color = {
      info: '#3b82f6',
      warning: '#f59e0b',
      error: '#ef4444',
      critical: '#dc2626',
    }[alert.level];
    
    const payload = {
      text: `${emoji} *${alert.title}*`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${emoji} ${alert.title}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: alert.message,
          },
        },
      ],
      attachments: alert.context ? [
        {
          color,
          fields: Object.entries(alert.context).map(([key, value]) => ({
            title: key,
            value: typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value),
            short: false,
          })),
          footer: 'Comptalyze Monitoring',
          ts: Math.floor(Date.now() / 1000),
        },
      ] : [],
    };
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`);
    }
    
    console.log(`✅ Alerte Slack envoyée: ${alert.title}`);
    return true;
  } catch (error) {
    console.error('Erreur envoi alerte Slack:', error);
    return false;
  }
}

/**
 * Envoie une alerte par email
 */
export async function sendEmailAlert(alert: Alert, to?: string): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const alertEmail = to || process.env.ALERT_EMAIL || 'admin@comptalyze.com';
  
  if (!resendApiKey) {
    console.warn('RESEND_API_KEY non configuré - alerte non envoyée');
    return false;
  }
  
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(resendApiKey);
    
    const levelColors = {
      info: '#3b82f6',
      warning: '#f59e0b',
      error: '#ef4444',
      critical: '#dc2626',
    };
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
      </head>
      <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="padding: 20px; background-color: ${levelColors[alert.level]}; color: white;">
            <h1 style="margin: 0; font-size: 24px;">${alert.title}</h1>
          </div>
          <div style="padding: 20px;">
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              ${alert.message}
            </p>
            ${alert.context ? `
              <div style="margin-top: 20px; padding: 15px; background-color: #f9fafb; border-radius: 4px; border-left: 4px solid ${levelColors[alert.level]};">
                <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Contexte:</h3>
                <pre style="font-size: 12px; overflow-x: auto; color: #333;">${JSON.stringify(alert.context, null, 2)}</pre>
              </div>
            ` : ''}
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
              Timestamp: ${alert.timestamp || new Date().toISOString()}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    await resend.emails.send({
      from: process.env.COMPANY_FROM_EMAIL || 'Comptalyze <no-reply@comptalyze.com>',
      to: alertEmail,
      subject: `[${alert.level.toUpperCase()}] ${alert.title}`,
      html,
    });
    
    console.log(`✅ Alerte email envoyée à ${alertEmail}`);
    return true;
  } catch (error) {
    console.error('Erreur envoi alerte email:', error);
    return false;
  }
}

/**
 * Helper pour envoyer une alerte (Slack + Email)
 */
export async function alert(
  level: AlertLevel,
  title: string,
  message: string,
  context?: Record<string, any>
): Promise<void> {
  const alertData: Alert = {
    level,
    title,
    message,
    context,
    timestamp: new Date().toISOString(),
  };
  
  // Logger dans la console
  const logFn = level === 'critical' || level === 'error' ? console.error : console.warn;
  logFn(`[ALERT ${level.toUpperCase()}] ${title}:`, message, context || '');
  
  // Envoyer en parallèle
  await Promise.allSettled([
    sendSlackAlert(alertData),
    level === 'critical' || level === 'error' ? sendEmailAlert(alertData) : Promise.resolve(),
  ]);
}

/**
 * Helpers spécifiques
 */
export const alerts = {
  webhookFailed: (eventType: string, error: string, metadata?: any) =>
    alert('error', '🚨 Webhook Stripe échoué', `Event: ${eventType}\nError: ${error}`, {
      event: eventType,
      error,
      ...metadata,
    }),
  
  importFailed: (provider: string, userId: string, error: string) =>
    alert('error', '📊 Import CA échoué', `Provider: ${provider}\nUser: ${userId}\nError: ${error}`, {
      provider,
      userId,
      error,
    }),
  
  emailBounced: (email: string, reason: string) =>
    alert('warning', '✉️ Email bounce', `Email: ${email}\nReason: ${reason}`, {
      email,
      reason,
    }),
  
  highErrorRate: (count: number, window: string) =>
    alert('critical', '🔥 Taux d\'erreur élevé', `${count} erreurs 5xx dans les ${window}`, {
      errorCount: count,
      timeWindow: window,
    }),
  
  quotaExceeded: (userId: string, quotaType: string) =>
    alert('info', 'ℹ️ Quota atteint', `User ${userId} a atteint sa limite: ${quotaType}`, {
      userId,
      quotaType,
    }),
  
  paymentFailed: (userId: string, amount: number, reason: string) =>
    alert('warning', '💳 Paiement échoué', `User: ${userId}\nMontant: ${amount}€\nRaison: ${reason}`, {
      userId,
      amount,
      reason,
    }),
};

