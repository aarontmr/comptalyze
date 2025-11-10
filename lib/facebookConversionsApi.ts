import crypto from 'crypto';

// Types pour l'API Conversions Facebook
export interface FacebookEventData {
  event_name: string;
  event_time: number;
  event_source_url?: string;
  action_source: string;
  user_data: {
    em?: string[];
    ph?: string[];
    fn?: string[];
    ln?: string[];
    ct?: string[];
    country?: string[];
    client_user_agent?: string;
    external_id?: string[];
    subscription_id?: string;
    ge?: string[];
  };
  custom_data?: {
    [key: string]: any;
  };
}

/**
 * Hash une valeur en SHA-256 pour l'API Conversions Facebook
 */
function hashValue(value: string | null | undefined): string | null {
  if (!value || typeof value !== 'string') return null;
  
  // Normaliser la valeur (minuscules, trim)
  const normalized = value.toLowerCase().trim();
  
  // Hasher en SHA-256
  return crypto
    .createHash('sha256')
    .update(normalized)
    .digest('hex');
}

/**
 * Envoie un événement à l'API Conversions Facebook
 */
export async function sendFacebookConversionEvent(
  eventData: Partial<FacebookEventData>
): Promise<{ success: boolean; error?: string }> {
  try {
    const pixelId = process.env.FACEBOOK_PIXEL_ID;
    const accessToken = process.env.FACEBOOK_CONVERSION_API_TOKEN;
    const apiVersion = 'v21.0'; // Version de l'API Facebook

    if (!pixelId || !accessToken) {
      console.error('❌ Configuration Facebook manquante');
      return {
        success: false,
        error: 'Configuration Facebook manquante',
      };
    }

    // Construire le payload
    const payload = {
      data: [
        {
          event_name: eventData.event_name,
          event_time: eventData.event_time || Math.floor(Date.now() / 1000),
          event_source_url: eventData.event_source_url || 'https://comptalyze.com',
          action_source: eventData.action_source || 'website',
          user_data: eventData.user_data || {},
          ...(eventData.custom_data && { custom_data: eventData.custom_data }),
        },
      ],
    };

    console.log('📤 Envoi événement Facebook:', eventData.event_name);

    // Envoyer la requête à l'API Facebook
    const url = `https://graph.facebook.com/${apiVersion}/${pixelId}/events?access_token=${accessToken}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Erreur Facebook API:', result);
      return {
        success: false,
        error: result.error?.message || 'Erreur lors de l\'envoi à Facebook',
      };
    }

    console.log('✅ Événement Facebook envoyé avec succès:', result);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'envoi à Facebook:', error);
    return {
      success: false,
      error: error.message || 'Erreur inconnue',
    };
  }
}

/**
 * Envoie l'événement "StartTrial" (Démarrage d'essai)
 */
export async function trackStartTrial({
  email,
  userAgent,
  eventSourceUrl,
  userId,
}: {
  email?: string;
  userAgent?: string;
  eventSourceUrl?: string;
  userId?: string;
}): Promise<{ success: boolean; error?: string }> {
  const userData: FacebookEventData['user_data'] = {
    client_user_agent: userAgent,
  };

  // Hacher l'email si fourni
  if (email) {
    userData.em = [hashValue(email)].filter(Boolean) as string[];
  }

  // Ajouter l'ID utilisateur si fourni
  if (userId) {
    userData.external_id = [userId];
  }

  return sendFacebookConversionEvent({
    event_name: 'StartTrial',
    event_source_url: eventSourceUrl,
    action_source: 'website',
    user_data: userData,
  });
}

/**
 * Envoie l'événement "CompleteRegistration" (Inscription terminée)
 */
export async function trackCompleteRegistration({
  email,
  firstName,
  lastName,
  city,
  country,
  gender,
  userAgent,
  eventSourceUrl,
  userId,
  subscriptionId,
}: {
  email?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  country?: string;
  gender?: string;
  userAgent?: string;
  eventSourceUrl?: string;
  userId?: string;
  subscriptionId?: string;
}): Promise<{ success: boolean; error?: string }> {
  const userData: FacebookEventData['user_data'] = {
    client_user_agent: userAgent,
  };

  // Hacher les données personnelles
  if (email) {
    userData.em = [hashValue(email)].filter(Boolean) as string[];
  }
  if (firstName) {
    userData.fn = [hashValue(firstName)].filter(Boolean) as string[];
  }
  if (lastName) {
    userData.ln = [hashValue(lastName)].filter(Boolean) as string[];
  }
  if (city) {
    userData.ct = [hashValue(city)].filter(Boolean) as string[];
  }
  if (country) {
    userData.country = [hashValue(country)].filter(Boolean) as string[];
  }
  if (gender) {
    userData.ge = [hashValue(gender)].filter(Boolean) as string[];
  }

  // Ajouter l'ID utilisateur si fourni (ne pas hacher)
  if (userId) {
    userData.external_id = [userId];
  }

  // Ajouter l'ID d'abonnement si fourni (ne pas hacher)
  if (subscriptionId) {
    userData.subscription_id = subscriptionId;
  }

  return sendFacebookConversionEvent({
    event_name: 'CompleteRegistration',
    event_source_url: eventSourceUrl,
    action_source: 'website',
    user_data: userData,
  });
}

/**
 * Envoie l'événement "Purchase" (Achat)
 */
export async function trackPurchase({
  email,
  value,
  currency = 'EUR',
  userAgent,
  eventSourceUrl,
  userId,
  subscriptionId,
}: {
  email?: string;
  value: number;
  currency?: string;
  userAgent?: string;
  eventSourceUrl?: string;
  userId?: string;
  subscriptionId?: string;
}): Promise<{ success: boolean; error?: string }> {
  const userData: FacebookEventData['user_data'] = {
    client_user_agent: userAgent,
  };

  // Hacher l'email si fourni
  if (email) {
    userData.em = [hashValue(email)].filter(Boolean) as string[];
  }

  // Ajouter l'ID utilisateur si fourni
  if (userId) {
    userData.external_id = [userId];
  }

  // Ajouter l'ID d'abonnement si fourni
  if (subscriptionId) {
    userData.subscription_id = subscriptionId;
  }

  return sendFacebookConversionEvent({
    event_name: 'Purchase',
    event_source_url: eventSourceUrl,
    action_source: 'website',
    user_data: userData,
    custom_data: {
      value,
      currency,
    },
  });
}

