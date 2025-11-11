/**
 * Utility functions for marketing attribution tracking
 */

export interface AttributionData {
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  gclid?: string | null;
  fbclid?: string | null;
  landingSlug?: string | null;
  referrer?: string | null;
}

/**
 * Get attribution data from localStorage
 */
export function getAttributionData(): AttributionData {
  if (typeof window === "undefined") {
    return {};
  }

  return {
    utmSource: localStorage.getItem("utm_source"),
    utmMedium: localStorage.getItem("utm_medium"),
    utmCampaign: localStorage.getItem("utm_campaign"),
    utmContent: localStorage.getItem("utm_content"),
    utmTerm: localStorage.getItem("utm_term"),
    gclid: localStorage.getItem("gclid"),
    fbclid: localStorage.getItem("fbclid"),
    landingSlug: localStorage.getItem("landing_slug"),
    referrer: localStorage.getItem("referrer"),
  };
}

/**
 * Store attribution data to localStorage
 * Call this when URL params are detected
 */
export function storeAttributionData(params: URLSearchParams, pathname: string) {
  if (typeof window === "undefined") return;

  const utmSource = params.get("utm_source");
  const utmMedium = params.get("utm_medium");
  const utmCampaign = params.get("utm_campaign");
  const utmContent = params.get("utm_content");
  const utmTerm = params.get("utm_term");
  const gclid = params.get("gclid");
  const fbclid = params.get("fbclid");

  // Store UTM parameters (overwrite if present)
  if (utmSource) localStorage.setItem("utm_source", utmSource);
  if (utmMedium) localStorage.setItem("utm_medium", utmMedium);
  if (utmCampaign) localStorage.setItem("utm_campaign", utmCampaign);
  if (utmContent) localStorage.setItem("utm_content", utmContent);
  if (utmTerm) localStorage.setItem("utm_term", utmTerm);
  if (gclid) localStorage.setItem("gclid", gclid);
  if (fbclid) localStorage.setItem("fbclid", fbclid);

  // Store landing page (first visit only)
  if (!localStorage.getItem("landing_slug")) {
    localStorage.setItem("landing_slug", pathname);
  }

  // Store referrer (first visit only)
  if (document.referrer && !localStorage.getItem("referrer")) {
    localStorage.setItem("referrer", document.referrer);
  }
}

/**
 * Clear attribution data (e.g., after successful signup)
 */
export function clearAttributionData() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("utm_source");
  localStorage.removeItem("utm_medium");
  localStorage.removeItem("utm_campaign");
  localStorage.removeItem("utm_content");
  localStorage.removeItem("utm_term");
  localStorage.removeItem("gclid");
  localStorage.removeItem("fbclid");
  localStorage.removeItem("landing_slug");
  localStorage.removeItem("referrer");
}

/**
 * Get attribution data as query string (for redirects)
 */
export function getAttributionQueryString(): string {
  const data = getAttributionData();
  const params = new URLSearchParams();

  if (data.utmSource) params.set("utm_source", data.utmSource);
  if (data.utmMedium) params.set("utm_medium", data.utmMedium);
  if (data.utmCampaign) params.set("utm_campaign", data.utmCampaign);
  if (data.utmContent) params.set("utm_content", data.utmContent);
  if (data.utmTerm) params.set("utm_term", data.utmTerm);
  if (data.gclid) params.set("gclid", data.gclid);
  if (data.fbclid) params.set("fbclid", data.fbclid);

  return params.toString();
}

