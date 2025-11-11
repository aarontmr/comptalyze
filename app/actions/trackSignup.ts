"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client with service role (bypass RLS)
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

interface TrackSignupParams {
  userId: string;
  email: string;
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
 * Track signup with marketing attribution
 * Called from /success page after successful signup
 */
export async function trackSignup(params: TrackSignupParams) {
  try {
    console.log("📊 Tracking signup with attribution:", params);

    // 1) Insert into marketing_signups table
    const { data: signupData, error: signupError } = await supabase
      .from("marketing_signups")
      .insert({
        user_id: params.userId,
        email: params.email,
        utm_source: params.utmSource,
        utm_medium: params.utmMedium,
        utm_campaign: params.utmCampaign,
        utm_content: params.utmContent,
        utm_term: params.utmTerm,
        gclid: params.gclid,
        fbclid: params.fbclid,
        landing_slug: params.landingSlug,
        referrer: params.referrer,
      })
      .select()
      .single();

    if (signupError) {
      console.error("❌ Error inserting marketing_signups:", signupError);
      throw signupError;
    }

    console.log("✅ Marketing signup tracked:", signupData.id);

    // 2) Update user_profiles with attribution data
    const { error: profileError } = await supabase
      .from("user_profiles")
      .update({
        utm_source: params.utmSource,
        utm_medium: params.utmMedium,
        utm_campaign: params.utmCampaign,
        utm_content: params.utmContent,
        utm_term: params.utmTerm,
        gclid: params.gclid,
        fbclid: params.fbclid,
        landing_slug: params.landingSlug,
        referrer: params.referrer,
      })
      .eq("id", params.userId);

    if (profileError) {
      console.error("⚠️ Error updating user_profiles:", profileError);
      // Non-blocking error, continue
    } else {
      console.log("✅ User profile updated with attribution");
    }

    return { success: true, signupId: signupData.id };
  } catch (error: any) {
    console.error("❌ Error in trackSignup:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get attribution data from localStorage (client-side utility)
 * This should be called from client components before calling trackSignup
 */
export function getAttributionData() {
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

